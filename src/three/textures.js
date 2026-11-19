import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { mulberry32 } from '../utils/random.js';

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function toTexture(canvas) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Texturas pequenas e compartilhadas (brilhos e nuvens): criadas uma vez e reutilizadas por toda a cena.
let softTexture;
export function getSoftTexture() {
  if (!softTexture) {
    const canvas = makeCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    softTexture = toTexture(canvas);
  }
  return softTexture;
}

let ringTexture;
export function getRingTexture() {
  if (!ringTexture) {
    const canvas = makeCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.stroke();
    ringTexture = toTexture(canvas);
  }
  return ringTexture;
}

const cloudTextures = [];
export function getCloudTexture(variant = 0) {
  const index = variant % 3;
  if (!cloudTextures[index]) {
    const rnd = mulberry32(31 + index * 17);
    const canvas = makeCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 22; i += 1) {
      const angle = rnd() * Math.PI * 2;
      const dist = Math.pow(rnd(), 0.6) * 78;
      const x = 128 + Math.cos(angle) * dist;
      const y = 128 + Math.sin(angle) * dist;
      const r = 26 + rnd() * 44;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,255,255,${0.12 + rnd() * 0.16})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
    }
    // máscara radial para que as bordas desapareçam por completo
    ctx.globalCompositeOperation = 'destination-in';
    const mask = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    mask.addColorStop(0, 'rgba(0,0,0,1)');
    mask.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, 256, 256);
    cloudTextures[index] = toTexture(canvas);
  }
  return cloudTextures[index];
}

/** Textura procedural de planeta (faixas e manchas). Não é imagem real: é apenas uma representação visual. */
export function makePlanetTexture({ base, bands = [], spots = [], seed = 1, bandCount = 16, blotches = 40 }) {
  const w = 256;
  const h = 128;
  const rnd = mulberry32(seed);
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < bandCount && bands.length; i += 1) {
    ctx.globalAlpha = 0.35 + rnd() * 0.4;
    ctx.fillStyle = bands[Math.floor(rnd() * bands.length)];
    ctx.fillRect(0, (i / bandCount) * h, w, (h / bandCount) * (0.7 + rnd() * 0.8));
  }
  for (let i = 0; i < blotches && spots.length; i += 1) {
    ctx.globalAlpha = 0.25 + rnd() * 0.35;
    ctx.fillStyle = spots[Math.floor(rnd() * spots.length)];
    ctx.beginPath();
    ctx.ellipse(rnd() * w, rnd() * h, 3 + rnd() * 14, 3 + rnd() * 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return toTexture(canvas);
}

/** Cria uma textura e a libera da GPU quando o componente sai de cena. */
export function useDisposableTexture(factory, deps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(factory, deps);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
