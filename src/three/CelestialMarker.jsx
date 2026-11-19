import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DoubleSide, MathUtils, Vector3 } from 'three';
import { noRaycast } from './constants.js';
import Glow from './Glow.jsx';
import { useRegistry } from './registry.js';
import { useHoverCursor } from './useHoverCursor.js';

const LABEL_DISTANCE = 34;

/** Corpo real do catálogo posicionado na galáxia. Posição e escala são ilustrativas. */
export default function CelestialMarker({ body, selected, onSelect, pauseRef, interactive = true }) {
  const registry = useRegistry();
  const root = useRef();
  const visual = useRef();
  const disk = useRef();
  const { position, size, alwaysLabel } = body.galaxy;

  const [hovered, setHovered] = useState(false);
  const [labelOn, setLabelOn] = useState(Boolean(alwaysLabel));
  const labelRef = useRef(Boolean(alwaysLabel));
  const world = useMemo(() => new Vector3(), []);
  useHoverCursor(hovered);

  useEffect(() => {
    registry.set(body.id, root.current);
    return () => registry.delete(body.id);
  }, [registry, body.id]);

  useEffect(() => () => {
    if (pauseRef) pauseRef.current = false;
  }, [pauseRef]);

  useFrame(({ camera }, delta) => {
    const target = hovered || selected ? 1.35 : 1;
    visual.current.scale.setScalar(MathUtils.damp(visual.current.scale.x, target, 8, delta));
    if (disk.current) disk.current.rotation.z += delta * 0.9;

    if (!alwaysLabel) {
      root.current.getWorldPosition(world);
      const want = hovered || selected || camera.position.distanceTo(world) < LABEL_DISTANCE;
      if (want !== labelRef.current) {
        labelRef.current = want;
        setLabelOn(want);
      }
    }
  });

  const handlers = interactive
    ? {
        onClick: (event) => {
          if (event.delta > 6) return; // arrastar a câmera não conta como clique
          event.stopPropagation();
          onSelect(body.id);
        },
        onPointerOver: (event) => {
          event.stopPropagation();
          setHovered(true);
          if (pauseRef) pauseRef.current = true;
        },
        onPointerOut: () => {
          setHovered(false);
          if (pauseRef) pauseRef.current = false;
        },
      }
    : {};

  const kind = body.category;
  return (
    <group ref={root} position={position}>
      <group ref={visual}>
        {kind === 'star' && (
          <>
            <mesh raycast={noRaycast}>
              <sphereGeometry args={[size, 20, 20]} />
              <meshBasicMaterial color={body.color} toneMapped={false} />
            </mesh>
            <Glow color={body.color} scale={size * 9} opacity={0.85} />
          </>
        )}
        {kind === 'nebula' && (
          <>
            <Glow kind="cloud" variant={body.id.length} color={body.color} scale={size * 7} opacity={0.6} />
            <Glow color={body.color} scale={size * 2} opacity={0.5} />
          </>
        )}
        {kind === 'blackhole' && (
          <>
            <mesh raycast={noRaycast}>
              <sphereGeometry args={[size * 0.55, 24, 24]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh ref={disk} rotation={[1.25, 0, 0]} raycast={noRaycast}>
              <ringGeometry args={[size * 0.8, size * 2.1, 64]} />
              <meshBasicMaterial color={body.color} side={DoubleSide} transparent opacity={0.85} toneMapped={false} depthWrite={false} />
            </mesh>
            <Glow color={body.color} scale={size * 9} opacity={0.55} />
          </>
        )}
        {kind === 'galaxy' && <Glow color={body.color} scale={size * 5} opacity={body.id === 'andromeda' ? 0.0 : 0.4} />}
      </group>

      {selected && <Glow kind="ring" color="#36e2f2" scale={Math.max(size * 5, 3.2)} opacity={0.95} />}

      <mesh {...handlers}>
        <sphereGeometry args={[Math.max(size * 2.2, 1.8), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {labelOn && (
        <Html position={[0, Math.max(size * 1.6, 1) + 0.6, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <span className="body-label" data-active={hovered || selected}>
            {body.name}
          </span>
        </Html>
      )}
    </group>
  );
}
