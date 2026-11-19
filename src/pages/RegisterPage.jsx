import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ApiError } from '../services/api.js';

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Informe seu nome (mínimo de 2 caracteres).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = 'Informe um e-mail válido.';
  if (form.password.length < 8) errors.password = 'A senha precisa ter pelo menos 8 caracteres.';
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errors.password = 'Use letras e números na senha.';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';
  return errors;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = validate(form);
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await register(form);
      navigate('/explorar', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.details ?? {});
        setFormError(err.details ? '' : err.message);
      } else {
        setFormError('Algo deu errado. Tente novamente.');
      }
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Seu histórico de conversas fica salvo na sua conta."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="stack">
        <Field label="Nome" value={form.name} onChange={update('name')} error={errors.name} autoComplete="name" maxLength={60} autoFocus />
        <Field label="E-mail" type="email" value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" />
        <Field
          label="Senha"
          type="password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          hint="Mínimo de 8 caracteres, com letras e números."
          autoComplete="new-password"
        />
        <Field label="Confirmar senha" type="password" value={form.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
