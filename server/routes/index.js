import * as auth from '../controllers/authController.js';
import * as chat from '../controllers/chatController.js';
import * as system from '../controllers/systemController.js';

// auth: true => exige sessão válida
const ROUTES = [
  { method: 'GET', path: '/api/health', handler: system.health },

  { method: 'POST', path: '/api/auth/register', handler: auth.register },
  { method: 'POST', path: '/api/auth/login', handler: auth.login },
  { method: 'POST', path: '/api/auth/logout', handler: auth.logout },
  { method: 'GET', path: '/api/auth/me', handler: auth.me, auth: true },
  { method: 'PATCH', path: '/api/auth/profile', handler: auth.updateProfile, auth: true },

  { method: 'GET', path: '/api/conversations', handler: chat.listConversations, auth: true },
  { method: 'POST', path: '/api/conversations', handler: chat.createConversation, auth: true },
  { method: 'DELETE', path: '/api/conversations/:id', handler: chat.deleteConversation, auth: true },
  { method: 'GET', path: '/api/conversations/:id/messages', handler: chat.listMessages, auth: true },
  { method: 'POST', path: '/api/conversations/:id/messages', handler: chat.sendMessage, auth: true },
];

const compiled = ROUTES.map((route) => {
  const keys = [];
  const source = route.path.replace(/:([a-zA-Z]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { ...route, keys, regex: new RegExp(`^${source}/?$`) };
});

/** Retorna { route, params } | { methodNotAllowed, allow } | null */
export function matchRoute(method, pathname) {
  const allow = [];
  for (const route of compiled) {
    const match = route.regex.exec(pathname);
    if (!match) continue;
    if (route.method !== method) {
      allow.push(route.method);
      continue;
    }
    const params = {};
    route.keys.forEach((key, i) => {
      try {
        params[key] = decodeURIComponent(match[i + 1]);
      } catch {
        params[key] = match[i + 1];
      }
    });
    return { route, params };
  }
  return allow.length ? { methodNotAllowed: true, allow } : null;
}
