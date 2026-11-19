import path from 'node:path';

export const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..');

// Carrega .env com o recurso nativo do Node (sem dotenv). Variáveis já definidas têm prioridade.
try {
  process.loadEnvFile(path.join(ROOT_DIR, '.env'));
} catch (err) {
  if (err.code !== 'ENOENT') console.warn('[env] Não foi possível ler o .env:', err.message);
}

const str = (key, fallback = '') => (process.env[key] ?? fallback).toString().trim();
const int = (key, fallback) => {
  const n = Number.parseInt(process.env[key] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const optionalNumber = (key, fallback) => {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  if (raw.trim() === '') return null; // vazio = não enviar o parâmetro ao provedor
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};
const bool = (key, fallback) => {
  const raw = str(key).toLowerCase();
  if (['1', 'true', 'yes'].includes(raw)) return true;
  if (['0', 'false', 'no'].includes(raw)) return false;
  return fallback;
};

const nodeEnv = str('NODE_ENV', 'development');
const isProd = nodeEnv === 'production';

const PROVIDER_DEFAULTS = {
  anthropic: { keyVar: 'ANTHROPIC_API_KEY', model: 'claude-haiku-5-5', baseUrl: 'https://api.anthropic.com' },
  openai: { keyVar: 'OPENAI_API_KEY', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
  'openai-compatible': { keyVar: 'AI_API_KEY', model: '', baseUrl: '' },
};

const provider = str('AI_PROVIDER', 'anthropic').toLowerCase();
const defaults = PROVIDER_DEFAULTS[provider] ?? PROVIDER_DEFAULTS.anthropic;

const cookieSecureSetting = str('COOKIE_SECURE', 'auto').toLowerCase();

export const config = {
  nodeEnv,
  isProd,
  port: int('PORT', 3001),
  host: str('HOST', '127.0.0.1'),
  dbPath: path.resolve(ROOT_DIR, str('DATABASE_PATH', 'server/data/carl-sagan.db')),
  distDir: path.join(ROOT_DIR, 'dist'),
  trustProxy: bool('TRUST_PROXY', false),
  trustedOrigins: str('TRUSTED_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean),
  cookie: {
    name: 'csai_sid',
    secure: cookieSecureSetting === 'auto' ? isProd : cookieSecureSetting === 'true',
    maxAgeSeconds: 60 * 60 * 24 * 7,
  },
  rateLimit: {
    chatPerMinute: int('CHAT_RATE_LIMIT_PER_MIN', 12),
  },
  ai: {
    provider,
    knownProvider: provider in PROVIDER_DEFAULTS,
    apiKey: str(defaults.keyVar) || str('AI_API_KEY'),
    requireKey: bool('AI_REQUIRE_KEY', true),
    model: str('AI_MODEL') || defaults.model,
    baseUrl: str('AI_BASE_URL') || defaults.baseUrl,
    maxTokens: int('AI_MAX_TOKENS', 300),
    maxTokensLong: int('AI_MAX_TOKENS_LONG', 900),
    temperature: optionalNumber('AI_TEMPERATURE', 0.4),
    historyLimit: int('AI_HISTORY_LIMIT', 8),
    timeoutMs: int('AI_TIMEOUT_MS', 30000),
  },
};
