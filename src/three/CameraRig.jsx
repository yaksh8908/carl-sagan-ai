import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { HOME } from './constants.js';
import { useRegistry } from './registry.js';
import { getBody } from '../data/celestialObjects.js';
import { SOLAR_FOCUS } from './SolarSystemScene.jsx';

const focusDistance = (mode, id) => (mode === 'solar' ? SOLAR_FOCUS[id] ?? 6 : getBody(id)?.galaxy?.focus ?? 6);

/**
 * Controla a câmera: voo suave até o objeto selecionado, acompanhamento dele enquanto se move
 * e retorno à visão inicial. Se o usuário pegar nos controles, ele assume o comando imediatamente.
 */
export default function CameraRig({ controlsRef, mode, selectedId, resetKey }) {
  const registry = useRegistry();
  const camera = useThree((state) => state.camera);
  const state = useRef({ phase: 'idle', needsPrev: false });
  const prev = useMemo(() => new Vector3(), []);
  const world = useMemo(() => new Vector3(), []);
  const dir = useMemo(() => new Vector3(), []);

  useEffect(() => {
    state.current.phase = 'home';
  }, [mode, resetKey]);

  useEffect(() => {
    if (selectedId) state.current.phase = 'approach';
  }, [selectedId]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return undefined;
    const onStart = () => {
      const s = state.current;
      if (s.phase === 'approach') {
        s.phase = 'follow';
        s.needsPrev = true;
      } else if (s.phase === 'home') {
        s.phase = 'idle';
      }
    };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controlsRef]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const s = state.current;
    const k = 1 - Math.exp(-delta * 3.2);

    if (s.phase === 'home') {
      const home = HOME[mode];
      controls.target.lerp(home.target, k);
      camera.position.lerp(home.position, k);
      if (camera.position.distanceTo(home.position) < 0.4 && controls.target.distanceTo(home.target) < 0.1) s.phase = 'idle';
      controls.update();
      return;
    }

    if (!selectedId || (s.phase !== 'approach' && s.phase !== 'follow')) return;
    const object = registry.get(selectedId);
    if (!object) return;
    object.getWorldPosition(world);

    if (s.phase === 'approach') {
      const want = focusDistance(mode, selectedId);
      controls.target.lerp(world, k);
      dir.copy(camera.position).sub(controls.target);
      const length = dir.length();
      camera.position.copy(controls.target).add(dir.setLength(MathUtils.lerp(length, want, k)));
      if (Math.abs(length - want) < want * 0.04 && controls.target.distanceTo(world) < want * 0.05) {
        s.phase = 'follow';
        s.needsPrev = true;
      }
    } else if (s.needsPrev) {
      prev.copy(world);
      s.needsPrev = false;
    } else {
      // acompanha o objeto mantendo o ângulo e a distância escolhidos pelo usuário
      dir.copy(world).sub(prev);
      controls.target.add(dir);
      camera.position.add(dir);
      prev.copy(world);
    }
    controls.update();
  });

  return null;
}
