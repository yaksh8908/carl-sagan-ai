import { repos } from '../database/index.js';
import { HttpError, getClientIp, noContent, ok } from '../utils/http.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { validateLogin, validateProfile, validateRegister } from '../utils/validators.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from '../services/passwordService.js';
import {
  clearedSessionCookie,
  createSession,
  destroySession,
  getSessionToken,
  sessionCookie,
} from '../services/sessionService.js';

const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 20 });
const loginIpLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 40 });
const loginAccountLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8 });

const tooMany = (retryAfter) =>
  new HttpError(429, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.', 'RATE_LIMITED', undefined, {
    'Retry-After': String(retryAfter),
  });

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  conversationCount: repos.conversations.countByUser(user.id),
});

export async function register({ body, ip }) {
  const limit = registerLimiter.hit(ip);
  if (!limit.ok) throw tooMany(limit.retryAfter);

  const { name, email, password } = validateRegister(body);
  if (repos.users.findByEmail(email)) {
    throw new HttpError(409, 'Este e-mail já está cadastrado.', 'EMAIL_TAKEN', { email: 'Este e-mail já está cadastrado.' });
  }

  const passwordHash = await hashPassword(password);
  let user;
  try {
    user = repos.users.create({ name, email, passwordHash });
  } catch (err) {
    if (/UNIQUE constraint failed/i.test(err.message)) {
      throw new HttpError(409, 'Este e-mail já está cadastrado.', 'EMAIL_TAKEN', { email: 'Este e-mail já está cadastrado.' });
    }
    throw err;
  }
  return ok({ user: publicUser(user) }, 201, { 'Set-Cookie': sessionCookie(createSession(user.id)) });
}

export async function login({ body, ip }) {
  const { email, password } = validateLogin(body);
  const byIp = loginIpLimiter.hit(ip);
  const byAccount = loginAccountLimiter.hit(`${ip}|${email}`);
  if (!byIp.ok || !byAccount.ok) throw tooMany(Math.max(byIp.retryAfter, byAccount.retryAfter));

  const user = repos.users.findByEmail(email);
  const valid = await verifyPassword(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');

  loginAccountLimiter.reset(`${ip}|${email}`);
  return ok({ user: publicUser(user) }, 200, { 'Set-Cookie': sessionCookie(createSession(user.id)) });
}

export function logout({ req }) {
  destroySession(getSessionToken(req));
  return noContent({ 'Set-Cookie': clearedSessionCookie() });
}

export function me({ user }) {
  return ok({ user: publicUser(user) });
}

export function updateProfile({ user, body }) {
  const { name } = validateProfile(body);
  return ok({ user: publicUser(repos.users.rename(user.id, name)) });
}
