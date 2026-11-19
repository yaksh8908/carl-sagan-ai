import { useEffect, useLayoutEffect, useState } from 'react';
import { SendHorizonal } from 'lucide-react';

const MAX = 2000;

export default function ChatComposer({ onSend, disabled, draft, inputRef }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (draft?.text) {
      setValue(draft.text);
      inputRef.current?.focus();
    }
  }, [draft, inputRef]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value, inputRef]);

  const submit = async () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue('');
    const result = await onSend(text);
    if (!result.ok) setValue(text); // devolve o texto para o usuário tentar de novo
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Pergunte algo sobre o universo"
        aria-label="Mensagem para o Carl Sagan AI"
        maxLength={MAX}
        rows={1}
      />
      <button type="submit" className="send" disabled={disabled || !value.trim()} aria-label="Enviar mensagem">
        <SendHorizonal size={18} aria-hidden="true" />
      </button>
      {value.length > MAX - 300 && (
        <span className="composer-count" aria-live="polite">
          {value.length}/{MAX}
        </span>
      )}
    </form>
  );
}
