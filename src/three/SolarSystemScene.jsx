import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { DoubleSide, MathUtils, Vector3 } from 'three';
import Glow from './Glow.jsx';
import { noRaycast } from './constants.js';
import { useRegistry } from './registry.js';
import { makePlanetTexture, useDisposableTexture } from './textures.js';
import { useHoverCursor } from './useHoverCursor.js';
import { mulberry32 } from '../utils/random.js';
import { getBody } from '../data/celestialObjects.js';

/**
 * Escala ILUSTRATIVA: órbitas, tamanhos e velocidades são comprimidos para caber na tela.
 * `period` (em anos terrestres) é real e define a velocidade relativa; o resto é visual.
 */
const PLANETS = [
  { id: 'mercurio', orbit: 4.4, radius: 0.34, period: 0.241, phase: 0.6, tex: { base: '#9a948c', spots: ['#6f6a64', '#b9b3aa'], seed: 3 } },
  { id: 'venus', orbit: 6.4, radius: 0.6, period: 0.615, phase: 2.1, tex: { base: '#e4c48a', bands: ['#eed7a6', '#d3b176'], seed: 4 } },
  { id: 'terra', orbit: 8.6, radius: 0.66, period: 1, phase: 4.0, tex: { base: '#2f6fe0', spots: ['#3f9d4f', '#d8e6f0', '#5a8b3a'], blotches: 55, seed: 5 } },
  { id: 'marte', orbit: 10.8, radius: 0.46, period: 1.881, phase: 5.3, tex: { base: '#c4573a', spots: ['#8f3d28', '#e08a68'], seed: 6 } },
  { id: 'jupiter', orbit: 15.4, radius: 1.9, period: 11.86, phase: 1.2, tex: { base: '#d9b48a', bands: ['#b98a62', '#efd9b8', '#a56e4b'], bandCount: 22, seed: 7 } },
  { id: 'saturno', orbit: 20.4, radius: 1.6, period: 29.45, phase: 3.3, rings: true, tex: { base: '#e3cf9f', bands: ['#cdb98a', '#f1e3bd'], bandCount: 16, seed: 8 } },
  { id: 'urano', orbit: 24.8, radius: 1.05, period: 84.0, phase: 0.2, tex: { base: '#9fe3e6', bands: ['#8bd3d8', '#b6f0f1'], bandCount: 6, seed: 9 } },
  { id: 'netuno', orbit: 28.6, radius: 1.0, period: 164.8, phase: 5.8, tex: { base: '#4766e8', bands: ['#3a56cc', '#6f8bff'], bandCount: 8, seed: 10 } },
];

const MOON = { id: 'lua', orbit: 1.35, radius: 0.18, period: 0.0748, color: '#c9c9c9' };

// Velocidade angular compressada: cada planeta mantém a ordem real (mais perto = mais rápido).
const omega = (periodYears) => 0.5 * Math.pow(periodYears, -0.6);

const circle = (radius, segments = 128) =>
  Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  });

function Label({ text, offset, active }) {
  return (
    <Html position={[0, offset, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <span className="body-label" data-active={active}>
        {text}
      </span>
    </Html>
  );
}

function Planet({ def, selectedId, onSelect, timeScale, motion, interactive }) {
  const registry = useRegistry();
  const orbit = useRef();
  const holder = useRef();
  const body = useRef();
  const moonOrbit = useRef();
  const moonHolder = useRef();
  const [hovered, setHovered] = useState(false);
  useHoverCursor(hovered);

  const data = getBody(def.id);
  const orbitPoints = useMemo(() => circle(def.orbit), [def.orbit]);
  const texture = useDisposableTexture(() => makePlanetTexture(def.tex), [def]);
  const selected = selectedId === def.id;
  const moonSelected = selectedId === MOON.id;

  useEffect(() => {
    registry.set(def.id, holder.current);
    if (def.id === 'terra') registry.set(MOON.id, moonHolder.current);
    return () => {
      registry.delete(def.id);
      if (def.id === 'terra') registry.delete(MOON.id);
    };
  }, [registry, def.id]);

  useFrame((_, delta) => {
    const dt = delta * timeScale.current * motion;
    orbit.current.rotation.y -= omega(def.period) * dt;
    body.current.rotation.y += dt * 0.4;
    if (moonOrbit.current) moonOrbit.current.rotation.y -= omega(MOON.period) * 0.5 * dt;
  });

  const hit = {
    onClick: (event) => {
      if (event.delta > 6) return;
      event.stopPropagation();
      onSelect(def.id);
    },
    onPointerOver: (event) => {
      event.stopPropagation();
      setHovered(true);
    },
    onPointerOut: () => setHovered(false),
  };

  return (
    <>
      <Line points={orbitPoints} color="#4a6fb5" lineWidth={1} transparent opacity={selected ? 0.8 : 0.32} />
      <group ref={orbit} rotation={[0, def.phase, 0]}>
        <group ref={holder} position={[def.orbit, 0, 0]}>
          <mesh ref={body} raycast={noRaycast}>
            <sphereGeometry args={[def.radius, 36, 36]} />
            <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
          </mesh>
          {def.rings && (
            <mesh rotation={[Math.PI / 2 - 0.47, 0, 0]} raycast={noRaycast}>
              <ringGeometry args={[def.radius * 1.35, def.radius * 2.25, 96]} />
              <meshStandardMaterial color="#cdb98a" side={DoubleSide} transparent opacity={0.8} roughness={1} />
            </mesh>
          )}
          {selected && <Glow kind="ring" color="#36e2f2" scale={def.radius * 4.2 + 1} opacity={0.95} />}
          {interactive && (
            <mesh {...hit}>
              <sphereGeometry args={[Math.max(def.radius * 1.7, 0.9), 12, 12]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
          <Label text={data.name} offset={def.radius * 1.5 + 0.7} active={hovered || selected} />

          {def.id === 'terra' && (
            <group ref={moonOrbit}>
              <group ref={moonHolder} position={[MOON.orbit, 0, 0]}>
                <mesh raycast={noRaycast}>
                  <sphereGeometry args={[MOON.radius, 20, 20]} />
                  <meshStandardMaterial color={MOON.color} roughness={1} />
                </mesh>
                {moonSelected && <Glow kind="ring" color="#36e2f2" scale={1.1} opacity={0.95} />}
                {interactive && (
                  <mesh
                    onClick={(event) => {
                      if (event.delta > 6) return;
                      event.stopPropagation();
                      onSelect(MOON.id);
                    }}
                  >
                    <sphereGeometry args={[0.4, 10, 10]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                  </mesh>
                )}
              </group>
            </group>
          )}
        </group>
      </group>
    </>
  );
}

/** Cinturão decorativo (ilustrativo) entre Marte e Júpiter. */
function AsteroidBelt({ motion }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const rnd = mulberry32(77);
    const array = new Float32Array(1600 * 3);
    for (let i = 0; i < 1600; i += 1) {
      const a = rnd() * Math.PI * 2;
      const r = 12.1 + rnd() * 1.1;
      array.set([Math.cos(a) * r, (rnd() - 0.5) * 0.35, Math.sin(a) * r], i * 3);
    }
    return array;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02 * motion;
  });
  return (
    <points ref={ref} frustumCulled={false} raycast={noRaycast}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9a8f80" size={0.07} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

export default function SolarSystemScene({ selectedId, onSelect, motion = 1, interactive = true }) {
  const registry = useRegistry();
  const sunRef = useRef();
  const timeScale = useRef(1);
  const sun = getBody('sol');
  const [sunHover, setSunHover] = useState(false);
  useHoverCursor(sunHover);

  useEffect(() => {
    registry.set('sol', sunRef.current);
    return () => registry.delete('sol');
  }, [registry]);

  // Com um objeto selecionado o tempo quase para, e a câmera consegue acompanhá-lo com suavidade.
  useFrame((_, delta) => {
    timeScale.current = MathUtils.damp(timeScale.current, selectedId ? 0.06 : 1, 3, delta);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 0]} intensity={4} decay={0} color="#fff1d6" />

      <group ref={sunRef}>
        <mesh raycast={noRaycast}>
          <sphereGeometry args={[2.6, 48, 48]} />
          <meshBasicMaterial color="#ffcf6b" toneMapped={false} />
        </mesh>
        <Glow color="#ffb347" scale={15} opacity={0.85} />
        <Glow color="#ff9a3c" scale={30} opacity={0.25} />
        {selectedId === 'sol' && <Glow kind="ring" color="#36e2f2" scale={9} opacity={0.95} />}
        {interactive && (
          <mesh
            onClick={(event) => {
              if (event.delta > 6) return;
              event.stopPropagation();
              onSelect('sol');
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              setSunHover(true);
            }}
            onPointerOut={() => setSunHover(false)}
          >
            <sphereGeometry args={[3.4, 14, 14]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
        <Label text={sun.name} offset={4.4} active={sunHover || selectedId === 'sol'} />
      </group>

      {PLANETS.map((def) => (
        <Planet key={def.id} def={def} selectedId={selectedId} onSelect={onSelect} timeScale={timeScale} motion={motion} interactive={interactive} />
      ))}
      <AsteroidBelt motion={motion} />
    </>
  );
}

export const SOLAR_FOCUS = {
  sol: 9,
  ...Object.fromEntries(PLANETS.map((p) => [p.id, p.radius * 4.2 + 1.6])),
  lua: 1.4,
};
