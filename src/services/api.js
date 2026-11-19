export class ApiError extends Error {
  constructor(message, { status = 0, code = 'ERROR', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível falar com o servidor. Verifique se ele está em execução.', { code: 'NETWORK' });
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error?.message ?? 'Algo deu errado. Tente novamente.', {
      status: res.status,
      code: data?.error?.code ?? 'ERROR',
      details: data?.error?.details,
    });
  }
  return data;
}

export const systemApi = {
  health: () => request('/health'),
};

export const authApi = {
  me: () => request('/auth/me'),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PATCH', body: payload }),
};

export const chatApi = {
  listConversations: () => request('/conversations'),
  createConversation: () => request('/conversations', { method: 'POST' }),
  deleteConversation: (id) => request(`/conversations/${id}`, { method: 'DELETE' }),
  listMessages: (id) => request(`/conversations/${id}/messages`),
  sendMessage: (id, content) => request(`/conversations/${id}/messages`, { method: 'POST', body: { content } }),
};
