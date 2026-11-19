// Testes de integração do backend. Usam um banco temporário e um provedor de IA SIMULADO (mock local)
// apenas para validar o código de integração. Não chamam nenhuma API real.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'csai-'));
const aiCalls = [];
let mockAi;
let server;
let base;
let config;

function startMockAi() {
  return new Promise((resolve) => {
    mockAi = http.createServer((req, res) => {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', () => {
        aiCalls.push({ url: req.url, headers: req.headers, body: JSON.parse(raw || '{}') });
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ content: [{ type: 'text', text: 'Resposta de teste.' }], stop_reason: 'end_turn' }));
      });
    });
    mockAi.listen(0, '127.0.0.1', () => resolve(mockAi.address().port));
  });
}

before(async () => {
  const aiPort = await startMockAi();
  process.env.DATABASE_PATH = path.join(tmp, 'test.db');
  process.env.AI_PROVIDER = 'anthropic';
  process.env.ANTHROPIC_API_KEY = 'chave-de-teste';
  process.env.AI_BASE_URL = `http://127.0.0.1:${aiPort}`;
  process.env.AI_MAX_TOKENS = '300';
  process.env.AI_HISTORY_LIMIT = '4';

  ({ config } = await import('../config/env.js'));
  const { createAppServer } = await import('../server.js');
  server = createAppServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  mockAi.close();
  server.closeAllConnections?.();
  fs.rmSync(tmp, { recursive: true, force: true });
});

async function api(method, route, { body, cookie, headers = {} } = {}) {
  const res = await fetch(base + route, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { res, status: res.status, data: text ? JSON.parse(text) : null, cookie: res.headers.getSetCookie()[0]?.split(';')[0] };
}

const validUser = (email) => ({ name: 'Ana Souza', email, password: 'Cosmos2024', confirmPassword: 'Cosmos2024' });

describe('sistema', () => {
  test('health informa que a IA está configurada e envia cabeçalhos de segurança', async () => {
    const { res, data } = await api('GET', '/api/health');
    assert.equal(data.status, 'ok');
    assert.equal(data.ai.configured, true);
    assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });

  test('rota inexistente e método incorreto', async () => {
    assert.equal((await api('GET', '/api/nada')).status, 404);
    assert.equal((await api('GET', '/api/auth/login')).status, 405);
  });
});

describe('autenticação', () => {
  test('cadastro rejeita dados inválidos', async () => {
    const weak = await api('POST', '/api/auth/register', { body: { ...validUser('a@b.com'), password: 'abc', confirmPassword: 'abc' } });
    assert.equal(weak.status, 422);
    assert.ok(weak.data.error.details.password);
    const mismatch = await api('POST', '/api/auth/register', { body: { ...validUser('a@b.com'), confirmPassword: 'Outra1234' } });
    assert.ok(mismatch.data.error.details.confirmPassword);
    const badEmail = await api('POST', '/api/auth/register', { body: validUser('nao-e-email') });
    assert.ok(badEmail.data.error.details.email);
  });

  test('cadastro cria usuário, define cookie HttpOnly e não vaza o hash', async () => {
    const r = await api('POST', '/api/auth/register', { body: validUser('ana@exemplo.com') });
    assert.equal(r.status, 201);
    assert.equal(r.data.user.email, 'ana@exemplo.com');
    assert.equal(JSON.stringify(r.data).includes('scrypt'), false);
    const setCookie = r.res.headers.getSetCookie()[0];
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Lax/);
  });

  test('e-mail duplicado (qualquer capitalização) retorna 409', async () => {
    const r = await api('POST', '/api/auth/register', { body: validUser('ANA@exemplo.com') });
    assert.equal(r.status, 409);
    assert.ok(r.data.error.details.email);
  });

  test('senha é armazenada como hash scrypt', async () => {
    const { db } = await import('../database/index.js');
    const row = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('ana@exemplo.com');
    assert.match(row.password_hash, /^scrypt\$/);
    assert.equal(row.password_hash.includes('Cosmos2024'), false);
  });

  test('login, me, logout e invalidação da sessão', async () => {
    const wrong = await api('POST', '/api/auth/login', { body: { email: 'ana@exemplo.com', password: 'errada123' } });
    assert.equal(wrong.status, 401);
    const unknown = await api('POST', '/api/auth/login', { body: { email: 'ninguem@exemplo.com', password: 'qualquer123' } });
    assert.equal(unknown.status, 401);
    assert.equal(unknown.data.error.message, wrong.data.error.message);

    const login = await api('POST', '/api/auth/login', { body: { email: 'ana@exemplo.com', password: 'Cosmos2024' } });
    assert.equal(login.status, 200);
    const cookie = login.cookie;

    assert.equal((await api('GET', '/api/auth/me')).status, 401);
    const me = await api('GET', '/api/auth/me', { cookie });
    assert.equal(me.data.user.name, 'Ana Souza');

    const out = await api('POST', '/api/auth/logout', { cookie });
    assert.equal(out.status, 204);
    assert.equal((await api('GET', '/api/auth/me', { cookie })).status, 401);
  });

  test('atualiza o nome do perfil', async () => {
    const { cookie } = await api('POST', '/api/auth/login', { body: { email: 'ana@exemplo.com', password: 'Cosmos2024' } });
    const r = await api('PATCH', '/api/auth/profile', { cookie, body: { name: 'Ana Maria' } });
    assert.equal(r.data.user.name, 'Ana Maria');
    assert.equal((await api('PATCH', '/api/auth/profile', { cookie, body: { name: 'A' } })).status, 422);
  });

  test('origem estrangeira é bloqueada em requisições que alteram estado', async () => {
    const r = await api('POST', '/api/auth/login', {
      body: { email: 'ana@exemplo.com', password: 'Cosmos2024' },
      headers: { origin: 'https://site-malicioso.example' },
    });
    assert.equal(r.status, 403);
  });
});

describe('conversas e chatbot', () => {
  let cookieA;
  let cookieB;
  let convId;

  before(async () => {
    cookieA = (await api('POST', '/api/auth/login', { body: { email: 'ana@exemplo.com', password: 'Cosmos2024' } })).cookie;
    cookieB = (await api('POST', '/api/auth/register', { body: validUser('bruno@exemplo.com') })).cookie;
  });

  test('rotas de conversa exigem autenticação', async () => {
    assert.equal((await api('GET', '/api/conversations')).status, 401);
    assert.equal((await api('POST', '/api/conversations/1/messages', { body: { content: 'oi' } })).status, 401);
  });

  test('enviar mensagem chama o provedor com prompt, limite de tokens e chave no header', async () => {
    convId = (await api('POST', '/api/conversations', { cookie: cookieA })).data.conversation.id;
    const r = await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieA, body: { content: 'O que é um buraco negro?' } });
    assert.equal(r.status, 200);
    assert.equal(r.data.assistantMessage.content, 'Resposta de teste.');
    assert.equal(r.data.conversation.title, 'O que é um buraco negro?');

    const call = aiCalls.at(-1);
    assert.equal(call.url, '/v1/messages');
    assert.equal(call.headers['x-api-key'], 'chave-de-teste');
    assert.equal(call.body.max_tokens, 300);
    assert.match(call.body.system, /Carl Sagan AI/);
    assert.deepEqual(call.body.messages, [{ role: 'user', content: 'O que é um buraco negro?' }]);
  });

  test('pedido de aprofundamento libera limite maior e histórico é limitado', async () => {
    for (let i = 0; i < 3; i += 1) {
      await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieA, body: { content: `pergunta ${i}` } });
    }
    await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieA, body: { content: 'Explique em detalhes a relatividade' } });
    const call = aiCalls.at(-1);
    assert.equal(call.body.max_tokens, Number(config.ai.maxTokensLong));
    assert.ok(call.body.messages.length <= 5, 'contexto deve respeitar AI_HISTORY_LIMIT (4) + mensagem atual');
    assert.equal(call.body.messages[0].role, 'user');
  });

  test('histórico persiste e fica isolado por usuário', async () => {
    const mine = await api('GET', `/api/conversations/${convId}/messages`, { cookie: cookieA });
    assert.equal(mine.data.messages.length, 10);
    assert.equal(mine.data.messages[0].role, 'user');
    assert.equal((await api('GET', `/api/conversations/${convId}/messages`, { cookie: cookieB })).status, 404);
    assert.equal((await api('DELETE', `/api/conversations/${convId}`, { cookie: cookieB })).status, 404);
    assert.equal((await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieB, body: { content: 'oi' } })).status, 404);
    assert.equal((await api('GET', '/api/conversations', { cookie: cookieB })).data.conversations.length, 0);
  });

  test('valida o conteúdo da mensagem', async () => {
    assert.equal((await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieA, body: { content: '   ' } })).status, 422);
    assert.equal((await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieA, body: { content: 'x'.repeat(2001) } })).status, 422);
    assert.equal((await api('GET', '/api/conversations/abc/messages', { cookie: cookieA })).status, 404);
  });

  test('sem chave de API retorna 503 e não grava a mensagem', async () => {
    const saved = config.ai.apiKey;
    config.ai.apiKey = '';
    try {
      const before = (await api('GET', `/api/conversations/${convId}/messages`, { cookie: cookieA })).data.messages.length;
      const r = await api('POST', `/api/conversations/${convId}/messages`, { cookie: cookieA, body: { content: 'sem chave' } });
      assert.equal(r.status, 503);
      assert.equal(r.data.error.code, 'AI_NOT_CONFIGURED');
      const after = (await api('GET', `/api/conversations/${convId}/messages`, { cookie: cookieA })).data.messages.length;
      assert.equal(after, before);
    } finally {
      config.ai.apiKey = saved;
    }
  });

  test('exclui conversa e mensagens em cascata', async () => {
    assert.equal((await api('DELETE', `/api/conversations/${convId}`, { cookie: cookieA })).status, 204);
    assert.equal((await api('GET', `/api/conversations/${convId}/messages`, { cookie: cookieA })).status, 404);
    const { db } = await import('../database/index.js');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ?').get(convId).n, 0);
  });
});

describe('frontend estático', () => {
  test('sem build, a raiz responde 503 com instrução clara', async () => {
    if (fs.existsSync(config.distDir)) return; // com dist/ presente, o fallback SPA é outro cenário
    const res = await fetch(base + '/');
    assert.equal(res.status, 503);
    assert.match(await res.text(), /npm run build/);
  });

  test('bloqueia path traversal', async () => {
    const res = await fetch(base + '/..%2f..%2fpackage.json');
    assert.notEqual(res.status, 200);
  });
});
