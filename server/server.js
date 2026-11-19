import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import { db, repos } from './database/index.js';
import { requireAuth } from './middleware/auth.js';
import { applySecurityHeaders, checkOrigin } from './middleware/security.js';
import { matchRoute } from './routes/index.js';
import { getAiStatus } from './services/ai/index.js';
import { HttpError, getClientIp, readJsonBody, sendError, sendJson } from './utils/http.js';
import { serveStatic } from './utils/static.js';

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

async function handleApi(req, res, url) {
  res.setHeader('Cache-Control', 'no-store');
  const matched = matchRoute(req.method, url.pathname);
  if (!matched) throw new HttpError(404, 'Rota não encontrada.', 'NOT_FOUND');
  if (matched.methodNotAllowed) {
    res.setHeader('Allow', matched.allow.join(', '));
    throw new HttpError(405, 'Método não permitido.', 'METHOD_NOT_ALLOWED');
  }

  const { route, params } = matched;
  if (req.method !== 'GET' && req.method !== 'HEAD') checkOrigin(req);
  const user = route.auth ? requireAuth(req) : null;
  const body = BODY_METHODS.has(req.method) ? await readJsonBody(req) : {};

  const result = await route.handler({ req, res, url, params, body, user, ip: getClientIp(req) });
  sendJson(res, result.status ?? 200, result.body ?? null, result.headers);
}

export function createAppServer() {
  return http.createServer(async (req, res) => {
    const started = Date.now();
    try {
      applySecurityHeaders(res);
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
      else await serveStatic(req, res, url);
    } catch (err) {
      if (res.headersSent) res.destroy();
      else sendError(res, err);
    } finally {
      if (!config.isProd && req.url?.startsWith('/api/')) {
        console.log(`${req.method} ${req.url.split('?')[0]} ${res.statusCode} ${Date.now() - started}ms`);
      }
    }
  });
}

function start() {
  const server = createAppServer();
  server.requestTimeout = 60_000;
  server.headersTimeout = 20_000;

  repos.sessions.purgeExpired();
  setInterval(() => repos.sessions.purgeExpired(), 60 * 60 * 1000).unref();

  server.listen(config.port, config.host, () => {
    const ai = getAiStatus();
    console.log(`\nCarl Sagan AI rodando em http://${config.host}:${config.port}`);
    console.log(`Banco de dados: ${path.relative(process.cwd(), config.dbPath)}`);
    console.log(
      ai.configured
        ? `IA: provedor "${ai.provider}" configurado (modelo ${config.ai.model}).`
        : `IA: NÃO configurada. Defina a chave no .env para ativar o chatbot (veja o README).`
    );
  });

  const shutdown = () => {
    console.log('\nEncerrando servidor...');
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) start();
