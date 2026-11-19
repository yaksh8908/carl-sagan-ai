import { useState } from 'react';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { formatRelative } from '../../utils/format.js';

export default function ConversationList({ conversations, activeId, loading, onSelect, onNew, onRemove, onClose }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="conv-list">
      <div className="conv-head">
        <h3>Conversas</h3>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar lista de conversas">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="btn btn-primary conv-new" onClick={onNew}>
        <Plus size={16} aria-hidden="true" /> Nova conversa
      </button>

      {loading && <p className="muted pad">Carregando…</p>}
      {!loading && conversations.length === 0 && <p className="muted pad">Você ainda não tem conversas. Envie a primeira pergunta.</p>}

      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id} data-active={conversation.id === activeId}>
            {confirmId === conversation.id ? (
              <div className="conv-confirm" role="alert">
                <span>Excluir esta conversa?</span>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    setConfirmId(null);
                    onRemove(conversation.id);
                  }}
                >
                  Excluir
                </button>
                <button type="button" className="btn" onClick={() => setConfirmId(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <button type="button" className="conv-item" onClick={() => onSelect(conversation.id)}>
                  <MessageSquare size={16} aria-hidden="true" />
                  <span className="conv-title">{conversation.title}</span>
                  <time dateTime={conversation.updatedAt}>{formatRelative(conversation.updatedAt)}</time>
                </button>
                <button
                  type="button"
                  className="icon-btn conv-del"
                  onClick={() => setConfirmId(conversation.id)}
                  aria-label={`Excluir conversa ${conversation.title}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
