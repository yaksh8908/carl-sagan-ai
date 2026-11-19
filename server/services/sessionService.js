import { createHash, randomBytes } from 'node:crypto';
import { config } from '../config/env.js';
import { repos } from '../database/index.js';
import { parseCookies, serializeCookie } from '../utils/http.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  repos.sessions.create({
    id: hashToken(token), // somente o hash fica no banco
    userId,
    expiresAt: Date.now() + config.cookie.maxAgeSeconds * 1000,
  });
  return token;
}

export function destroySession(token) {
  if (token) repos.sessions.delete(hashToken(token));
}

export function getSessionToken(req) {
  return parseCookies(req.headers.cookie)[config.cookie.name] || null;
}

export function findUserBySession(token) {
  if (!token || token.length > 128) return null;
  const id = hashToken(token);
  const session = repos.sessions.find(id);
  if (!session) return null;
  if (session.expires_at <= Date.now()) {
    repos.sessions.delete(id);
    return null;
  }
  return repos.users.findById(session.user_id);
}

export const sessionCookie = (token) =>
  serializeCookie(config.cookie.name, token, {
    maxAge: config.cookie.maxAgeSeconds,
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'Lax',
  });

export const clearedSessionCookie = () =>
  serializeCookie(config.cookie.name, '', { maxAge: 0, httpOnly: true, secure: config.cookie.secure, sameSite: 'Lax' });
