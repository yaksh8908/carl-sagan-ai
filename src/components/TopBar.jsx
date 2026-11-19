import { useEffect, useRef, useState } from 'react';
import { Gauge, Home, LogOut, MessageCircle, Orbit, Telescope, User } from 'lucide-react';
import Logo from './Logo.jsx';
import { QUALITY } from '../three/quality.js';
import { initials } from '../utils/format.js';

function Popover({ label, icon, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => !ref.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="popover" ref={ref}>
      <button type="button" className="icon-btn" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen((v) => !v)}>
        {icon}
      </button>
      {open && (
        <div className={`menu glass align-${align}`} role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

const MODES = [
  { id: 'galaxy', label: 'Galáxia', Icon: Telescope },
  { id: 'solar', label: 'Sistema Solar', Icon: Orbit },
];

export default function TopBar({ mode, onModeChange, explorerOpen, onToggleExplorer, chatOpen, onToggleChat, onReset, quality, user, onOpenProfile, onLogout }) {
  const options = [['auto', 'Automática'], ...Object.entries(QUALITY).map(([id, q]) => [id, q.label])];

  return (
    <header className="topbar">
      <div className="brand">
        <Logo size={30} />
        <span>Carl Sagan AI</span>
      </div>

      <div className="segmented" role="tablist" aria-label="Cena">
        {MODES.map(({ id, label, Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => onModeChange(id)}>
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <nav className="actions" aria-label="Navegação principal">
        <button type="button" className="btn nav-btn" aria-pressed={explorerOpen} onClick={onToggleExplorer}>
          <Telescope size={16} aria-hidden="true" />
          <span>Explorar</span>
        </button>
        <button type="button" className="btn nav-btn" onClick={onReset}>
          <Home size={16} aria-hidden="true" />
          <span>Visão geral</span>
        </button>
        <button type="button" className="btn btn-primary nav-btn" aria-pressed={chatOpen} onClick={onToggleChat}>
          <MessageCircle size={16} aria-hidden="true" />
          <span>Carl Sagan AI</span>
        </button>

        <Popover label="Qualidade gráfica" icon={<Gauge size={18} aria-hidden="true" />}>
          <p className="menu-title">Qualidade gráfica</p>
          {options.map(([id, label]) => (
            <button key={id} type="button" role="menuitemradio" aria-checked={quality.preference === id} onClick={() => quality.setPreference(id)}>
              {label}
              {id === 'auto' && <small>agora: {QUALITY[quality.level].label}</small>}
            </button>
          ))}
        </Popover>

        <Popover label="Menu da conta" icon={<span className="avatar">{initials(user.name) || <User size={16} />}</span>}>
          <p className="menu-title">{user.name}</p>
          <button type="button" role="menuitem" onClick={onOpenProfile}>
            <User size={16} aria-hidden="true" /> Perfil
          </button>
          <button type="button" role="menuitem" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" /> Sair
          </button>
        </Popover>
      </nav>
    </header>
  );
}
