import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ApiError } from '../services/api.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = 'Informe seu e-mail.';
    if (!form.password) next.password = 'Informe sua senha.';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(location.state?.from ?? '/explorar', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.details ?? {});
        setFormError(err.message);
      } else {
        setFormError('Algo deu errado. Tente novamente.');
      }
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Continue sua exploração e retome suas conversas."
      footer={
        <>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="stack">
        <Field label="E-mail" type="email" value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" autoFocus />
        <Field label="Senha" type="password" value={form.password} onChange={update('password')} error={errors.password} autoComplete="current-password" />
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
