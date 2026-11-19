import { config } from '../../config/env.js';
import { assertProviderOk, postJson } from './http.js';

export async function callAnthropic({ system, messages, maxTokens }) {
  const { apiKey, model, baseUrl, temperature, timeoutMs } = config.ai;
  const res = await postJson(`${baseUrl.replace(/\/+$/, '')}/v1/messages`, {
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: {
      model,
      max_tokens: maxTokens,
      ...(temperature !== null && { temperature }),
      system,
      messages,
    },
    timeoutMs,
  });
  await assertProviderOk(res);
  const data = await res.json();
  const text = (data.content ?? [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
  return { text, truncated: data.stop_reason === 'max_tokens', usage: data.usage };
}
