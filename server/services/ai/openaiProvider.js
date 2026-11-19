import { config } from '../../config/env.js';
import { assertProviderOk, postJson } from './http.js';

/** Serve o provedor "openai" e qualquer API compatível ("openai-compatible"). */
export async function callOpenAI({ system, messages, maxTokens }) {
  const { apiKey, model, baseUrl, temperature, timeoutMs, provider } = config.ai;
  const tokenField = provider === 'openai' ? 'max_completion_tokens' : 'max_tokens';
  const res = await postJson(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {},
    body: {
      model,
      [tokenField]: maxTokens,
      ...(temperature !== null && { temperature }),
      messages: [{ role: 'system', content: system }, ...messages],
    },
    timeoutMs,
  });
  await assertProviderOk(res);
  const data = await res.json();
  const choice = data.choices?.[0];
  return {
    text: (choice?.message?.content ?? '').trim(),
    truncated: choice?.finish_reason === 'length',
    usage: data.usage,
  };
}
