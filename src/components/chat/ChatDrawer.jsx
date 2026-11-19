import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, History, Plus, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import ChatComposer from './ChatComposer.jsx';
import ConversationList from './ConversationList.jsx';
import MessageBubble, { TypingBubble } from './MessageBubble.jsx';
import Logo from '../Logo.jsx';

const SUGGESTIONS = [
  'O que é um buraco negro?',
  'Estamos sozinhos no universo?',
  'Como surgiu o universo?',
  'O que é a Via Láctea?',
];

/**
 * Painel do chatbot. Fica sempre montado (apenas desliza para dentro/fora),
 * então a conversa e a galáxia ao fundo não são reiniciadas ao abrir/fechar.
 */
export default function ChatDrawer({ open, onClose, aiConfigured, draft, onUnauthorized }) {
  const chat = useChat({ onUnauthorized });
  const [showList, setShowList] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 280);
      return () => clearTimeout(timer);
    }
    setShowList(false);
    return undefined;
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [chat.messages.length, chat.sending, chat.activeId, reduced]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') (showList ? setShowList(false) : onClose());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, showList]);

  const empty = chat.messages.length === 0 && !chat.loadingMessages;

  return (
    <motion.aside
      className="chat glass"
      aria-label="Chat com Carl Sagan AI"
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={{ x: open ? 0 : '108%', opacity: open ? 1 : 0.6 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 30 }}
    >
      <header className="chat-head">
        <Logo size={26} />
        <div className="chat-title">
          <strong>Carl Sagan AI</strong>
          <span>{chat.activeConversation?.title ?? 'Nova conversa'}</span>
        </div>
        <button type="button" className="icon-btn" onClick={() => setShowList(true)} aria-label="Ver conversas anteriores">
          <History size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={chat.startNew} aria-label="Começar nova conversa">
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar chat">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      {aiConfigured === false && (
        <div className="notice" role="status">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>A IA ainda não foi configurada neste servidor. Adicione a chave da API no arquivo .env (veja o README).</span>
        </div>
      )}

      <div className="chat-body" ref={scrollRef} aria-live="polite">
        {chat.loadingMessages && <p className="muted pad">Carregando mensagens…</p>}
        {empty && (
          <div className="chat-empty">
            <p>Pergunte sobre estrelas, planetas, buracos negros ou a origem do universo.</p>
            <div className="chips">
              {SUGGESTIONS.map((text) => (
                <button key={text} type="button" className="chip" disabled={chat.sending} onClick={() => chat.send(text)}>
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}
        {chat.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {chat.sending && <TypingBubble />}
      </div>

      {chat.error && (
        <div className="notice is-error" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{chat.error}</span>
          <button type="button" className="icon-btn" onClick={chat.clearError} aria-label="Dispensar aviso">
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <ChatComposer onSend={chat.send} disabled={chat.sending} draft={draft} inputRef={inputRef} />

      <AnimatePresence>
        {showList && (
          <motion.div
            className="conv-overlay"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
          >
            <ConversationList
              conversations={chat.conversations}
              activeId={chat.activeId}
              loading={chat.loadingList}
              onSelect={(id) => {
                chat.select(id);
                setShowList(false);
              }}
              onNew={() => {
                chat.startNew();
                setShowList(false);
              }}
              onRemove={chat.remove}
              onClose={() => setShowList(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
