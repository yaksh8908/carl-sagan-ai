import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Field({ label, error, hint, type = 'text', ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="field" data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id}>{label}</label>
      <div className="field-control">
        <input id={id} type={isPassword && visible ? 'text' : type} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
        {isPassword && (
          <button type="button" className="icon-btn" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error ? (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="field-hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
