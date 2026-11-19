import { useCallback, useEffect, useState } from 'react';
import { ApiError, chatApi } from '../services/api.js';

/** Estado do chatbot: conversas do usuário, mensagens e envio (com persistência no servidor). */
export function useChat({ onUnauthorized }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messagesById, setMessagesById] = useState({});
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const fail = useCallback(
    (err) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized?.();
      setError(err instanceof ApiError ? err.message : 'Algo deu errado. Tente novamente.');
    },
    [onUnauthorized]
  );

  useEffect(() => {
    let active = true;
    chatApi
      .listConversations()
      .then((data) => active && setConversations(data.conversations))
      .catch((err) => active && fail(err))
      .finally(() => active && setLoadingList(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    async (id) => {
      setError('');
      setActiveId(id);
      if (messagesById[id]) return;
      setLoadingMessages(true);
      try {
        const data = await chatApi.listMessages(id);
        setMessagesById((prev) => ({ ...prev, [id]: data.messages }));
      } catch (err) {
        fail(err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [messagesById, fail]
  );

  const startNew = useCallback(() => {
    setError('');
    setActiveId(null);
  }, []);

  const remove = useCallback(
    async (id) => {
      try {
        await chatApi.deleteConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setMessagesById((prev) => {
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
        setActiveId((current) => (current === id ? null : current));
      } catch (err) {
        fail(err);
      }
    },
    [fail]
  );

  const send = useCallback(
    async (text) => {
      setError('');
      setSending(true);
      const tempId = `tmp-${Date.now()}`;
      let conversationId = activeId;
      try {
        if (conversationId == null) {
          const { conversation } = await chatApi.createConversation();
          conversationId = conversation.id;
          setConversations((prev) => [conversation, ...prev]);
          setMessagesById((prev) => ({ ...prev, [conversationId]: [] }));
          setActiveId(conversationId);
        }
        const optimistic = { id: tempId, role: 'user', content: text, createdAt: new Date().toISOString(), pending: true };
        setMessagesById((prev) => ({ ...prev, [conversationId]: [...(prev[conversationId] ?? []), optimistic] }));

        const result = await chatApi.sendMessage(conversationId, text);
        setMessagesById((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).filter((m) => m.id !== tempId).concat([result.userMessage, result.assistantMessage]),
        }));
        setConversations((prev) => [result.conversation, ...prev.filter((c) => c.id !== conversationId)]);
        return { ok: true };
      } catch (err) {
        setMessagesById((prev) =>
          prev[conversationId] ? { ...prev, [conversationId]: prev[conversationId].filter((m) => m.id !== tempId) } : prev
        );
        fail(err);
        return { ok: false };
      } finally {
        setSending(false);
      }
    },
    [activeId, fail]
  );

  const messages = activeId != null ? messagesById[activeId] ?? [] : [];
  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return {
    conversations,
    activeId,
    activeConversation,
    messages,
    loadingList,
    loadingMessages,
    sending,
    error,
    clearError: () => setError(''),
    select,
    startNew,
    remove,
    send,
  };
}
