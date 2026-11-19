import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { config } from '../config/env.js';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.glb': 'model/gltf-binary',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt']);
const gzipCache = new Map();

async function readGzip(file, stat) {
  const cached = gzipCache.get(file);
  if (cached && cached.mtime === stat.mtimeMs) return cached.data;
  const data = zlib.gzipSync(await fs.readFile(file), { level: 9 });
  gzipCache.set(file, { mtime: stat.mtimeMs, data });
  return data;
}

async function statFile(file) {
  try {
    const stat = await fs.stat(file);
    return stat.isFile() ? stat : null;
  } catch {
    return null;
  }
}

export async function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }

  const root = config.distDir;
  let file = path.join(root, pathname);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }

  let stat = pathname.endsWith('/') ? null : await statFile(file);
  if (!stat) {
    // Rotas do React Router: qualquer caminho sem extensão cai no index.html
    if (path.extname(pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Não encontrado.');
      return;
    }
    file = path.join(root, 'index.html');
    stat = await statFile(file);
    if (!stat) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Frontend não compilado. Rode "npm run build" ou use "npm run dev" durante o desenvolvimento.');
      return;
    }
  }

  const ext = path.extname(file).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] ?? 'application/octet-stream',
    'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  };

  const wantsGzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (wantsGzip) {
    const data = await readGzip(file, stat);
    headers['Content-Encoding'] = 'gzip';
    headers['Content-Length'] = data.length;
    headers.Vary = 'Accept-Encoding';
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : data);
    return;
  }

  const data = await fs.readFile(file);
  headers['Content-Length'] = data.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : data);
}
