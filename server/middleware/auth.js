import { HttpError } from '../utils/http.js';
import { findUserBySession, getSessionToken } from '../services/sessionService.js';

export function requireAuth(req) {
  const user = findUserBySession(getSessionToken(req));
  if (!user) throw new HttpError(401, 'Sessão expirada ou ausente. Entre novamente.', 'UNAUTHENTICATED');
  return user;
}
