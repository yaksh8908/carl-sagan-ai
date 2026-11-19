import { config } from '../config/env.js';

export class HttpError extends Error {
  constructor(status, message, code = 'ERROR', details = undefined, headers = undefined) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.headers = headers;
  }
}

export function sendJson(res, status, body = null, headers = {}) {
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (status === 204 || body === null) {
    res.writeHead(status);
    res.end();
    return;
  }
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function sendError(res, err) {
  const known = err instanceof HttpError;
  if (!known) console.error('[erro]', err);
  const status = known ? err.status : 500;
  const headers = { ...(known ? err.headers : {}) };
  if (status === 413) headers.Connection = 'close';
  sendJson(
    res,
    status,
    {
      error: {
        code: known ? err.code : 'INTERNAL_ERROR',
        message: known ? err.message : 'Erro interno do servidor.',
        ...(known && err.details ? { details: err.details } : {}),
      },
    },
    headers
  );
}

export async function readJsonBody(req, limit = 32 * 1024) {
  const hasBody =
    (req.headers['content-length'] !== undefined && req.headers['content-length'] !== '0') ||
    req.headers['transfer-encoding'] !== undefined;
  if (!hasBody) return {};

  const type = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') {
    throw new HttpError(415, 'Envie o corpo da requisição como application/json.', 'UNSUPPORTED_MEDIA_TYPE');
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'Corpo da requisição grande demais.', 'PAYLOAD_TOO_LARGE');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not object');
    return parsed;
  } catch {
    throw new HttpError(400, 'JSON inválido.', 'INVALID_JSON');
  }
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      /* cookie malformado: ignora */
    }
  }
  return out;
}

export function serializeCookie(name, value, { maxAge, httpOnly = true, secure = false, sameSite = 'Lax', path = '/' } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (httpOnly) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function getClientIp(req) {
  if (config.trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export const ok = (body, status = 200, headers = undefined) => ({ status, body, headers });
export const noContent = (headers = undefined) => ({ status: 204, body: null, headers });
