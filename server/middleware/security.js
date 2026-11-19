import { config } from '../config/env.js';
import { HttpError } from '../utils/http.js';

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export function applySecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Powered-By', '');
  res.removeHeader('X-Powered-By');
  if (config.isProd) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

/**
 * Proteção CSRF complementar ao SameSite=Lax: em requisições que alteram estado,
 * se o navegador enviou Origin, ele precisa apontar para o próprio host ou para uma origem confiável.
 */
export function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  if (config.trustedOrigins.includes(origin)) return;
  try {
    if (new URL(origin).host === req.headers.host) return;
  } catch {
    /* cai no erro abaixo */
  }
  throw new HttpError(403, 'Origem da requisição não permitida.', 'FORBIDDEN_ORIGIN');
}
