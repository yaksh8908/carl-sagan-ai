import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';

const VERTEX = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uAmp;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aPhase * 3.0) * uAmp;
    p.y += cos(uTime * 0.27 + aPhase * 2.0) * uAmp * 0.5;
    p.z += sin(uTime * 0.31 + aPhase * 5.0) * uAmp;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * aSize * uPixelRatio * (300.0 / -mv.z), 1.0, 26.0 * uPixelRatio);
    vColor = aColor;
    vTwinkle = 0.78 + 0.22 * sin(uTime * 1.3 + aPhase * 10.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float a = pow(1.0 - d * 2.0, 2.0);
    gl_FragColor = vec4(vColor * vTwinkle, a * uAlpha);
    #include <colorspace_fragment>
  }
`;

/**
 * Uma única chamada de desenho (THREE.Points) para dezenas de milhares de partículas.
 * O movimento (oscilação e cintilação) roda inteiramente na GPU, sem custo de CPU por partícula.
 */
export default function ParticleLayer({ data, size = 1, amp = 0.05, alpha = 0.9, spin = 0, motion = 1 }) {
  const points = useRef();
  const material = useRef();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: size }, uPixelRatio: { value: 1 }, uAmp: { value: amp }, uAlpha: { value: alpha } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    uniforms.uSize.value = size;
    uniforms.uAmp.value = amp * motion;
    uniforms.uAlpha.value = alpha;
  }, [uniforms, size, amp, alpha, motion]);

  useFrame(({ clock, gl }, delta) => {
    uniforms.uTime.value = clock.elapsedTime * (motion > 0 ? 1 : 0);
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (spin && points.current) points.current.rotation.y += delta * spin * motion;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[data.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
