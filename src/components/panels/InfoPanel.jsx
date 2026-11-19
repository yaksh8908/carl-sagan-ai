import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, MessageCircle, Orbit, X } from 'lucide-react';
import { CATEGORIES } from '../../data/celestialObjects.js';
import BodyPortrait from './BodyPortrait.jsx';

const ROWS = [
  ['Distância da Terra', 'distance'],
  ['Dimensões', 'size'],
  ['Temperatura', 'temperature'],
  ['Composição', 'composition'],
];

export default function InfoPanel({ body, mode, onClose, onBack, onAskCarl, onEnterSolar, onReset, reduced }) {
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [body.id]);

  return (
    <motion.aside
      className="side-panel info glass"
      aria-label={`Informações sobre ${body.name}`}
      initial={reduced ? false : { x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { x: -28, opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <header className="panel-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar à lista">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <span className="badge">Objeto real</span>
        <button type="button" className="icon-btn push" onClick={onClose} aria-label="Fechar informações">
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="panel-scroll" ref={scroller}>
        <BodyPortrait body={body} />
        <h2 className="info-name">{body.name}</h2>
        <p className="info-kind">
          {CATEGORIES[body.category]}: {body.tagline}
        </p>
        <p className="info-desc">{body.description}</p>

        <dl className="data-grid">
          {ROWS.map(([label, key]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{body[key]}</dd>
            </div>
          ))}
        </dl>

        {body.facts?.length > 0 && (
          <section>
            <h3>Informações científicas</h3>
            <dl className="facts">
              {body.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {body.curiosities?.length > 0 && (
          <section>
            <h3>Curiosidades</h3>
            <ul className="curiosities">
              {body.curiosities.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="panel-note">
          Os dados desta ficha são de um objeto real, com valores arredondados. A posição e o tamanho na cena 3D são ilustrativos.
        </p>
      </div>

      <footer className="panel-actions">
        <button type="button" className="btn btn-primary" onClick={() => onAskCarl(body)}>
          <MessageCircle size={16} aria-hidden="true" /> Perguntar ao Carl
        </button>
        {body.id === 'sol' && mode === 'galaxy' && (
          <button type="button" className="btn" onClick={onEnterSolar}>
            <Orbit size={16} aria-hidden="true" /> Entrar no Sistema Solar
          </button>
        )}
        <button type="button" className="btn" onClick={onReset}>
          <Home size={16} aria-hidden="true" /> Visão geral
        </button>
      </footer>
    </motion.aside>
  );
}
