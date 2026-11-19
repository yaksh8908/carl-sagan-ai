import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_PLURAL, objectsForMode } from '../../data/celestialObjects.js';

export default function ExplorerPanel({ mode, onSelect, onClose, reduced }) {
  const [query, setQuery] = useState('');
  const objects = useMemo(() => objectsForMode(mode), [mode]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? objects.filter((b) => b.name.toLowerCase().includes(q) || CATEGORIES[b.category].toLowerCase().includes(q))
      : objects;
    const map = new Map();
    for (const body of filtered) {
      if (!map.has(body.category)) map.set(body.category, []);
      map.get(body.category).push(body);
    }
    return [...map.entries()];
  }, [objects, query]);

  return (
    <motion.aside
      className="side-panel glass"
      aria-label="Painel de exploração"
      initial={reduced ? false : { x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { x: -28, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <header className="panel-head">
        <h2>{mode === 'solar' ? 'Sistema Solar' : 'Galáxia'}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar painel de exploração">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <label className="search">
        <Search size={16} aria-hidden="true" />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar corpo celeste" aria-label="Buscar corpo celeste" />
      </label>

      <div className="panel-scroll">
        {groups.length === 0 && <p className="muted pad">Nenhum objeto encontrado para "{query}".</p>}
        {groups.map(([category, bodies]) => (
          <section key={category}>
            <h3>{CATEGORY_PLURAL[category]}</h3>
            <ul className="body-list">
              {bodies.map((body) => (
                <li key={body.id}>
                  <button type="button" onClick={() => onSelect(body.id)}>
                    <span className="dot" style={{ background: body.color }} aria-hidden="true" />
                    <span className="body-name">{body.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="panel-note">
        Os objetos listados são reais. Posições, distâncias entre eles e tamanhos na cena são ilustrativos; estrelas de fundo, poeira e nebulosas
        decorativas são elementos artísticos.
      </p>
    </motion.aside>
  );
}
