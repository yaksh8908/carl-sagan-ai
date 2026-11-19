import { Color } from 'three';
import { gauss, mulberry32 } from '../utils/random.js';
import { GALAXY_PARAMS } from './constants.js';

const WARM = new Color('#ffcf9a');
const COOL = new Color('#5b86ff');
const PURPLE = new Color('#9b6bff');
const CYAN = new Color('#4fe3f5');
const WHITE = new Color('#ffffff');

function allocate(count) {
  return {
    count,
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    sizes: new Float32Array(count),
    phases: new Float32Array(count),
  };
}

/** Disco espiral com bojo central. Elemento artístico: não representa o mapa real da Via Láctea. */
export function generateGalaxy({
  count,
  radius = GALAXY_PARAMS.radius,
  arms = GALAXY_PARAMS.arms,
  twist = GALAXY_PARAMS.twist,
  seed = 7,
  bulgeRatio = 0.2,
}) {
  const rnd = mulberry32(seed);
  const out = allocate(count);
  const color = new Color();

  for (let i = 0; i < count; i += 1) {
    let x;
    let y;
    let z;
    let size;

    if (rnd() < bulgeRatio) {
      const r = Math.pow(rnd(), 1.8) * radius * 0.22;
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.cos(phi) * 0.55;
      z = r * Math.sin(phi) * Math.sin(theta);
      color.copy(WARM).lerp(WHITE, rnd() * 0.45).multiplyScalar(0.55);
      size = 0.5 + rnd() * 1.1;
    } else {
      const t = Math.pow(rnd(), 0.75);
      const r = Math.max(t, 0.05) * radius;
      const angle = ((i % arms) / arms) * Math.PI * 2 + t * twist;
      const spread = radius * (0.025 + 0.08 * t);
      x = Math.cos(angle) * r + gauss(rnd) * spread;
      z = Math.sin(angle) * r + gauss(rnd) * spread;
      y = gauss(rnd) * radius * 0.012 * (1 - t * 0.6);

      color.copy(WARM).lerp(COOL, Math.min(1, t * 1.15));
      const roll = rnd();
      if (roll < 0.12) color.lerp(PURPLE, 0.55);
      else if (roll < 0.16) color.lerp(CYAN, 0.6);
      else if (roll > 0.98) color.copy(WHITE);
      color.multiplyScalar(0.5 + rnd() * 0.6);
      size = 0.45 + Math.pow(rnd(), 3) * 2.2;
    }

    out.positions.set([x, y, z], i * 3);
    out.colors.set([color.r, color.g, color.b], i * 3);
    out.sizes[i] = size;
    out.phases[i] = rnd() * Math.PI * 2;
  }
  return out;
}

/** Poeira cósmica: partículas maiores, esparsas e translúcidas ao longo dos braços. */
export function generateDust({ count, radius = GALAXY_PARAMS.radius, arms = GALAXY_PARAMS.arms, twist = GALAXY_PARAMS.twist, seed = 21 }) {
  const rnd = mulberry32(seed);
  const out = allocate(count);
  const color = new Color();
  const base = new Color('#7a5cff');
  const warm = new Color('#d98a6a');

  for (let i = 0; i < count; i += 1) {
    const t = 0.12 + Math.pow(rnd(), 0.9) * 0.88;
    const r = t * radius;
    const angle = ((i % arms) / arms) * Math.PI * 2 + t * twist + gauss(rnd) * 0.12;
    const spread = radius * (0.04 + 0.07 * t);
    out.positions.set(
      [Math.cos(angle) * r + gauss(rnd) * spread, gauss(rnd) * radius * 0.02, Math.sin(angle) * r + gauss(rnd) * spread],
      i * 3
    );
    color.copy(base).lerp(warm, rnd() * 0.6).multiplyScalar(0.35 + rnd() * 0.4);
    out.colors.set([color.r, color.g, color.b], i * 3);
    out.sizes[i] = 2.5 + rnd() * 3.5;
    out.phases[i] = rnd() * Math.PI * 2;
  }
  return out;
}

/** Posições e parâmetros das nuvens decorativas (nebulosas ilustrativas) ao longo dos braços. */
export function generateNebulae({ count, radius = GALAXY_PARAMS.radius, arms = GALAXY_PARAMS.arms, twist = GALAXY_PARAMS.twist, seed = 99 }) {
  const rnd = mulberry32(seed);
  const palette = ['#8a5cff', '#36e2f2', '#ff6fb5', '#2d6bff', '#a77bff'];
  return Array.from({ length: count }, (_, i) => {
    const t = 0.28 + rnd() * 0.6;
    const r = t * radius;
    const angle = ((i % arms) / arms) * Math.PI * 2 + t * twist + gauss(rnd) * 0.2;
    return {
      key: i,
      position: [Math.cos(angle) * r, gauss(rnd) * 0.6, Math.sin(angle) * r],
      scale: 8 + rnd() * 11,
      color: palette[Math.floor(rnd() * palette.length)],
      opacity: 0.07 + rnd() * 0.1,
      rotation: rnd() * Math.PI * 2,
      texture: i % 3,
    };
  });
}
