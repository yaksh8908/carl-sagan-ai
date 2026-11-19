const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export const formatTime = (iso) => timeFormatter.format(new Date(iso));
export const formatDate = (iso) => dateFormatter.format(new Date(iso));

/** "14:32" se for hoje, senão "12 nov." */
export function formatRelative(iso) {
  const date = new Date(iso);
  const now = new Date();
  return date.toDateString() === now.toDateString() ? timeFormatter.format(date) : dayFormatter.format(date);
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
