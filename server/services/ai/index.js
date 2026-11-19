import { config } from '../../config/env.js';
import { SYSTEM_PROMPT } from '../../config/systemPrompt.js';
import { HttpError } from '../../utils/http.js';
import { callAnthropic } from './anthropicProvider.js';
import { callOpenAI } from './openaiProvider.js';

// Para adicionar outro provedor: crie um adaptador com a mesma assinatura e registre aqui.
const PROVIDERS = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  'openai-compatible': callOpenAI,
};

const MAX_CONTEXT_CHARS = 1500; // por mensagem do histórico (economia de tokens)
const LONG_ANSWER_RE = /(detalh|aprofund|explique melhor|mais a fundo|passo a passo|em profundidade|completo|extens|elabor|desenvolva)/i;

export function isAiConfigured() {
  const ai = config.ai;
  if (!ai.knownProvider || !ai.model) return false;
  if (ai.provider === 'openai-compatible' && !ai.baseUrl) return false;
  return Boolean(ai.apiKey) || (ai.provider === 'openai-compatible' && !ai.requireKey);
}

export const getAiStatus = () => ({ configured: isAiConfigured(), provider: config.ai.provider });

/** Mantém só o contexto relevante: últimas N mensagens, alternando user/assistant, começando por user. */
export function buildMessages(history, message) {
  const recent = history.slice(-config.ai.historyLimit).map((m) => ({
    role: m.role,
    content: m.content.slice(0, MAX_CONTEXT_CHARS),
  }));
  recent.push({ role: 'user', content: message });

  const merged = [];
  for (const m of recent) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += `\n${m.content}`;
    else merged.push({ ...m });
  }
  while (merged.length && merged[0].role !== 'user') merged.shift();
  return merged;
}

/** Quando a resposta é cortada pelo limite de tokens, descarta a frase incompleta final. */
export function trimToLastSentence(text) {
  const match = text.match(/^[\s\S]*[.!?…](?=["')\]]*\s|["')\]]*$)/);
  return match && match[0].length >= text.length * 0.4 ? match[0].trim() : text.trim();
}

export async function generateReply({ history, message }) {
  if (!isAiConfigured()) {
    throw new HttpError(
      503,
      'A integração de IA ainda não foi configurada no servidor. Defina a chave da API no arquivo .env (veja o README).',
      'AI_NOT_CONFIGURED'
    );
  }
  const maxTokens = LONG_ANSWER_RE.test(message) ? config.ai.maxTokensLong : config.ai.maxTokens;
  const result = await PROVIDERS[config.ai.provider]({
    system: SYSTEM_PROMPT,
    messages: buildMessages(history, message),
    maxTokens,
  });
  const text = result.truncated ? trimToLastSentence(result.text) : result.text;
  if (!text) throw new HttpError(502, 'A IA devolveu uma resposta vazia. Tente novamente.', 'AI_EMPTY');
  return { text, usage: result.usage };
}
