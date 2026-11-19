import { HttpError } from './http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fail(fields) {
  throw new HttpError(422, 'Confira os campos destacados.', 'VALIDATION_ERROR', fields);
}

export function normalizeName(raw) {
  return typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : '';
}

export function normalizeEmail(raw) {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : '';
}

function checkName(name, errors) {
  if (name.length < 2) errors.name = 'Informe seu nome (mínimo de 2 caracteres).';
  else if (name.length > 60) errors.name = 'O nome pode ter no máximo 60 caracteres.';
}

export function validateRegister(body) {
  const name = normalizeName(body.name);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
  const errors = {};

  checkName(name, errors);
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) errors.email = 'Informe um e-mail válido.';
  if (password.length < 8) errors.password = 'A senha precisa ter pelo menos 8 caracteres.';
  else if (password.length > 128) errors.password = 'A senha pode ter no máximo 128 caracteres.';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) errors.password = 'Use letras e números na senha.';
  if (!errors.password && password !== confirmPassword) errors.confirmPassword = 'As senhas não coincidem.';

  if (Object.keys(errors).length) fail(errors);
  return { name, email, password };
}

export function validateLogin(body) {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const errors = {};
  if (!email || email.length > 254) errors.email = 'Informe seu e-mail.';
  if (!password || password.length > 128) errors.password = 'Informe sua senha.';
  if (Object.keys(errors).length) fail(errors);
  return { email, password };
}

export function validateProfile(body) {
  const name = normalizeName(body.name);
  const errors = {};
  checkName(name, errors);
  if (Object.keys(errors).length) fail(errors);
  return { name };
}

export const MAX_MESSAGE_LENGTH = 2000;

export function validateMessage(body) {
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!content) fail({ content: 'Digite uma mensagem.' });
  if (content.length > MAX_MESSAGE_LENGTH) fail({ content: `A mensagem pode ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.` });
  return content;
}

export function parseId(raw) {
  if (!/^\d{1,12}$/.test(raw ?? '')) throw new HttpError(404, 'Recurso não encontrado.', 'NOT_FOUND');
  const id = Number(raw);
  if (id < 1) throw new HttpError(404, 'Recurso não encontrado.', 'NOT_FOUND');
  return id;
}
