import { useCallback, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor, Stars } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { usePrefersReducedMotion } from '../hooks/useMediaQuery.js';
import CameraRig from './CameraRig.jsx';
import GalaxyScene from './GalaxyScene.jsx';
import SolarSystemScene from './SolarSystemScene.jsx';
import { HOME } from './constants.js';
import { QUALITY } from './quality.js';
import { RegistryContext } from './registry.js';

function Fallback({ onRetry, message }) {
  return (
    <div className="canvas-fallback" role="alert">
      <p>{message}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        <RotateCcw size={16} aria-hidden="true" /> Recarregar a cena
      </button>
    </div>
  );
}

/**
 * Canvas 3D persistente. Ele fica montado enquanto o usuário navega pelos painéis e pelo chat,
 * então abrir ou fechar qualquer painel NÃO reinicia a galáxia.
 */
export default function SpaceCanvas({ mode, level, onDegrade, selectedId, onSelect, resetKey = 0, interactive = true }) {
  const settings = QUALITY[level];
  const registry = useMemo(() => new Map(), []);
  const controlsRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [canvasKey, setCanvasKey] = useState(0);
  const [lost, setLost] = useState(false);

  const handleCreated = useCallback(({ gl }) => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      setLost(true);
    });
  }, []);

  const retry = () => {
    setLost(false);
    setCanvasKey((key) => key + 1);
  };

  const home = HOME[mode];
  const motion = reducedMotion ? 0.25 : 1;

  return (
    <div
      className="space-canvas"
      role="img"
      aria-label={mode === 'solar' ? 'Sistema Solar em 3D, interativo' : 'Galáxia espiral em 3D, interativa'}
    >
      <ErrorBoundary
        key={canvasKey}
        fallback={(_, reset) => (
          <Fallback
            message="Não foi possível iniciar o gráfico 3D. Verifique se o navegador tem WebGL habilitado."
            onRetry={() => {
              reset();
              retry();
            }}
          />
        )}
      >
        {lost ? (
          <Fallback message="O contexto gráfico foi perdido (a GPU reiniciou)." onRetry={retry} />
        ) : (
          <Canvas
            flat
            dpr={settings.dpr}
            camera={{ position: home.position.toArray(), fov: 50, near: 0.1, far: 4000 }}
            gl={{ powerPreference: 'high-performance', alpha: false }}
            onCreated={handleCreated}
          >
            <color attach="background" args={['#02040b']} />
            <PerformanceMonitor onDecline={onDegrade} flipflops={3} />
            <Stars radius={900} depth={250} count={settings.bgStars} factor={7} saturation={0} fade speed={reducedMotion ? 0 : 0.5} />

            <RegistryContext.Provider value={registry}>
              {mode === 'solar' ? (
                <SolarSystemScene selectedId={selectedId} onSelect={onSelect} motion={motion} interactive={interactive} />
              ) : (
                <GalaxyScene settings={settings} selectedId={selectedId} onSelect={onSelect} motion={motion} interactive={interactive} />
              )}
              {interactive && <CameraRig controlsRef={controlsRef} mode={mode} selectedId={selectedId} resetKey={resetKey} />}
            </RegistryContext.Provider>

            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableDamping
              dampingFactor={0.06}
              rotateSpeed={0.6}
              zoomSpeed={0.8}
              minDistance={0.6}
              maxDistance={home.maxDistance}
              enablePan={interactive}
              enableZoom={interactive}
              enableRotate={interactive}
              autoRotate={!interactive && !reducedMotion}
              autoRotateSpeed={0.4}
            />
          </Canvas>
        )}
      </ErrorBoundary>
    </div>
  );
}
