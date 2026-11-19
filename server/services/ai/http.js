import { HttpError } from '../../utils/http.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** POST JSON com timeout e uma única nova tentativa para falhas de rede ou 5xx. */
export async function postJson(url, { headers, body, timeoutMs }) {
  let lastResponse = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (res.status >= 500 && attempt === 0) {
        lastResponse = res;
        await res.arrayBuffer().catch(() => {});
        await sleep(600);
        continue;
      }
      return res;
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw new HttpError(504, 'O provedor de IA demorou demais para responder. Tente novamente.', 'AI_TIMEOUT');
      }
      if (attempt === 1) {
        throw new HttpError(502, 'Não foi possível contactar o provedor de IA.', 'AI_UNAVAILABLE');
      }
      await sleep(400);
    } finally {
      clearTimeout(timer);
    }
  }
  return lastResponse;
}

async function providerMessage(res) {
  try {
    const data = await res.json();
    const msg = data?.error?.message ?? data?.message ?? '';
    return String(msg).slice(0, 200);
  } catch {
    return '';
  }
}

/** Converte respostas de erro do provedor em HttpError amigáveis (sem vazar credenciais). */
export async function assertProviderOk(res) {
  if (res.ok) return;
  const detail = await providerMessage(res);
  if (res.status === 401 || res.status === 403) {
    throw new HttpError(502, 'A chave de API da IA é inválida ou não tem permissão. Verifique o arquivo .env.', 'AI_AUTH');
  }
  if (res.status === 429) {
    const retry = Number(res.headers.get('retry-after'));
    throw new HttpError(
      429,
      'O provedor de IA atingiu o limite de requisições. Aguarde um instante e tente de novo.',
      'AI_RATE_LIMIT',
      undefined,
      Number.isFinite(retry) && retry > 0 ? { 'Retry-After': String(Math.ceil(retry)) } : undefined
    );
  }
  if (res.status === 400 || res.status === 404) {
    throw new HttpError(502, `O provedor de IA recusou a requisição${detail ? `: ${detail}` : '.'}`, 'AI_BAD_REQUEST');
  }
  throw new HttpError(502, 'O provedor de IA está indisponível no momento. Tente novamente.', 'AI_UNAVAILABLE');
}
