import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import { ApiError } from '../services/api.js';
import { formatDate, initials } from '../utils/format.js';

export default function ProfileModal({ user, onClose, onSave, onLogout }) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await onSave({ name });
      setMessage({ type: 'ok', text: 'Nome atualizado.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.details?.name ?? err.message : 'Não foi possível salvar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <header className="panel-head">
          <h2 id="profile-title">Seu perfil</h2>
          <button type="button" className="icon-btn push" onClick={onClose} aria-label="Fechar perfil">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="profile-id">
          <span className="avatar large" aria-hidden="true">
            {initials(user.name)}
          </span>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <form onSubmit={submit} className="stack">
          <label className="field">
            <span>Nome</span>
            <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
          </label>
          {message.text && (
            <p className={message.type === 'error' ? 'form-error' : 'form-ok'} role="status">
              {message.text}
            </p>
          )}
          <dl className="facts">
            <div>
              <dt>Conta criada em</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt>Conversas salvas</dt>
              <dd>{user.conversationCount}</dd>
            </div>
          </dl>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || name.trim() === user.name}>
              {saving ? 'Salvando…' : 'Salvar nome'}
            </button>
            <button type="button" className="btn" onClick={onLogout}>
              <LogOut size={16} aria-hidden="true" /> Sair da conta
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
