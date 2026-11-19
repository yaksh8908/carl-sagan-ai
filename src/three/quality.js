import { useCallback, useEffect, useMemo, useState } from 'react';

export const QUALITY = {
  high: { label: 'Alta', stars: 70000, dust: 2600, bgStars: 4500, nebulae: 16, mini: 16000, dpr: [1, 2] },
  medium: { label: 'Média', stars: 36000, dust: 1300, bgStars: 2600, nebulae: 10, mini: 8000, dpr: [1, 1.5] },
  low: { label: 'Baixa', stars: 14000, dust: 500, bgStars: 1200, nebulae: 6, mini: 3500, dpr: [1, 1] },
};
export const LEVELS = ['high', 'medium', 'low'];

const STORAGE_KEY = 'csai:quality';

export function detectQuality() {
  if (typeof window === 'undefined') return 'medium';
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  const memory = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (mobile && (memory <= 4 || cores <= 4)) return 'low';
  if (mobile || memory <= 4 || cores <= 4) return 'medium';
  return 'high';
}

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'auto' || LEVELS.includes(saved) ? saved : 'auto';
  } catch {
    return 'auto';
  }
}

/** Qualidade gráfica: "auto" detecta o dispositivo e reduz sozinha se o FPS cair. */
export function useQuality() {
  const [preference, setPreferenceState] = useState(readPreference);
  const [autoLevel, setAutoLevel] = useState(detectQuality);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* armazenamento indisponível: segue sem persistir */
    }
  }, [preference]);

  const level = preference === 'auto' ? autoLevel : preference;

  const degrade = useCallback(() => {
    if (preference !== 'auto') return;
    setAutoLevel((current) => LEVELS[Math.min(LEVELS.indexOf(current) + 1, LEVELS.length - 1)]);
  }, [preference]);

  return useMemo(
    () => ({ preference, setPreference: setPreferenceState, level, degrade }),
    [preference, level, degrade]
  );
}
