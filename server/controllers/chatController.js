import { config } from '../config/env.js';
import { repos } from '../database/index.js';
import { HttpError, noContent, ok } from '../utils/http.js';
import { createRateLimiter } from '../utils/rateLimit.js';
import { parseId, validateMessage } from '../utils/validators.js';
import { generateReply } from '../services/ai/index.js';

const DEFAULT_TITLE = 'Nova conversa';
const MAX_CONVERSATIONS_PER_USER = 200;
const chatLimiter = createRateLimiter({ windowMs: 60_000, max: config.rateLimit.chatPerMinute });

const makeTitle = (text) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 48 ? `${clean.slice(0, 47).trimEnd()}…` : clean;
};

function getOwnedConversation(rawId, userId) {
  const conversation = repos.conversations.findOwned(parseId(rawId), userId);
  if (!conversation) throw new HttpError(404, 'Conversa não encontrada.', 'NOT_FOUND');
  return conversation;
}

export function listConversations({ user }) {
  return ok({ conversations: repos.conversations.listByUser(user.id) });
}

export function createConversation({ user }) {
  if (repos.conversations.countByUser(user.id) >= MAX_CONVERSATIONS_PER_USER) {
    throw new HttpError(409, 'Limite de conversas atingido. Exclua alguma para criar outra.', 'CONVERSATION_LIMIT');
  }
  return ok({ conversation: repos.conversations.create(user.id, DEFAULT_TITLE) }, 201);
}

export function deleteConversation({ user, params }) {
  const id = parseId(params.id);
  if (!repos.conversations.delete(id, user.id)) throw new HttpError(404, 'Conversa não encontrada.', 'NOT_FOUND');
  return noContent();
}

export function listMessages({ user, params }) {
  const conversation = getOwnedConversation(params.id, user.id);
  return ok({ conversation, messages: repos.messages.list(conversation.id) });
}

export async function sendMessage({ user, params, body }) {
  const conversation = getOwnedConversation(params.id, user.id);
  const content = validateMessage(body);

  const limit = chatLimiter.hit(`user:${user.id}`);
  if (!limit.ok) {
    throw new HttpError(429, 'Você está enviando mensagens rápido demais. Aguarde alguns segundos.', 'RATE_LIMITED', undefined, {
      'Retry-After': String(limit.retryAfter),
    });
  }

  const history = repos.messages.recent(conversation.id, config.ai.historyLimit);
  const sentAt = new Date().toISOString();

  // Chama a IA ANTES de gravar: se falhar, nada é persistido e o usuário pode tentar de novo.
  const reply = await generateReply({ history, message: content });
  const repliedAt = new Date().toISOString();

  const result = repos.transaction(() => {
    const userMessage = repos.messages.insert(conversation.id, 'user', content, sentAt);
    const assistantMessage = repos.messages.insert(conversation.id, 'assistant', reply.text, repliedAt);
    const title = conversation.title === DEFAULT_TITLE ? makeTitle(content) : conversation.title;
    repos.conversations.touch(conversation.id, title, repliedAt);
    return { userMessage, assistantMessage, title };
  });

  return ok({
    userMessage: result.userMessage,
    assistantMessage: result.assistantMessage,
    conversation: { ...conversation, title: result.title, updatedAt: repliedAt },
  });
}
