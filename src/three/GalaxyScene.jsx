import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import CelestialMarker from './CelestialMarker.jsx';
import Glow from './Glow.jsx';
import ParticleLayer from './ParticleLayer.jsx';
import { GALAXY_PARAMS } from './constants.js';
import { generateDust, generateGalaxy, generateNebulae } from './galaxyGenerator.js';
import { GALAXY_OBJECTS } from '../data/celestialObjects.js';

const ANDROMEDA_ORIGIN = [-120, 35, -60];

function Nebulae({ count }) {
  const items = useMemo(() => generateNebulae({ count }), [count]);
  return items.map((n) => (
    <Glow key={n.key} kind="cloud" variant={n.texture} color={n.color} scale={n.scale} opacity={n.opacity} rotation={n.rotation} />
  ));
}

/** Pequeno disco espiral ao fundo que representa a galáxia de Andrômeda (visual ilustrativo). */
function MiniGalaxy({ count, motion }) {
  const data = useMemo(() => generateGalaxy({ count, radius: 34, arms: 2, twist: 4.2, seed: 5, bulgeRatio: 0.25 }), [count]);
  return (
    <group position={ANDROMEDA_ORIGIN} rotation={[0.9, 0.3, 0.25]}>
      <ParticleLayer data={data} size={1.1} amp={0.03} alpha={0.95} spin={0.03} motion={motion} />
      <Glow color="#ffd9a0" scale={14} opacity={0.5} />
    </group>
  );
}

export default function GalaxyScene({ settings, selectedId, onSelect, motion = 1, interactive = true, pauseExtra }) {
  const spin = useRef();
  const pauseRef = useRef(false);
  const arms = useMemo(() => generateGalaxy({ count: settings.stars }), [settings.stars]);
  const dust = useMemo(() => generateDust({ count: settings.dust }), [settings.dust]);

  const inGalaxy = useMemo(() => GALAXY_OBJECTS.filter((b) => b.id !== 'andromeda'), []);
  const andromeda = GALAXY_OBJECTS.find((b) => b.id === 'andromeda');

  useFrame((_, delta) => {
    // A rotação pausa ao passar o mouse ou selecionar um objeto, para facilitar o clique e o acompanhamento.
    const paused = pauseRef.current || Boolean(selectedId) || pauseExtra?.current;
    if (spin.current && !paused) spin.current.rotation.y += delta * 0.012 * motion;
  });

  return (
    <>
      <group ref={spin}>
        <ParticleLayer data={arms} size={1} amp={0.05} alpha={0.95} spin={0} motion={motion} />
        <ParticleLayer data={dust} size={3.4} amp={0.5} alpha={0.1} motion={motion} />
        <Nebulae count={settings.nebulae} />
        <Glow color="#ffd9a0" scale={GALAXY_PARAMS.radius * 0.5} opacity={0.5} />
        <Glow color="#fff4de" scale={GALAXY_PARAMS.radius * 0.16} opacity={0.8} />
        {interactive &&
          inGalaxy.map((body) => (
            <CelestialMarker key={body.id} body={body} selected={selectedId === body.id} onSelect={onSelect} pauseRef={pauseRef} />
          ))}
      </group>

      <MiniGalaxy count={settings.mini} motion={motion} />
      {interactive && (
        <CelestialMarker body={andromeda} selected={selectedId === andromeda.id} onSelect={onSelect} pauseRef={pauseRef} />
      )}
    </>
  );
}
