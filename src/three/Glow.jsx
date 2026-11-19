import { AdditiveBlending } from 'three';
import { noRaycast } from './constants.js';
import { getCloudTexture, getRingTexture, getSoftTexture } from './textures.js';

/** Sprite aditivo usado para halos de estrelas, nuvens e anéis de seleção. */
export default function Glow({ color = '#ffffff', scale = 1, opacity = 1, kind = 'soft', variant = 0, rotation = 0 }) {
  const map = kind === 'cloud' ? getCloudTexture(variant) : kind === 'ring' ? getRingTexture() : getSoftTexture();
  return (
    <sprite scale={[scale, scale, 1]} raycast={noRaycast}>
      <spriteMaterial
        map={map}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        rotation={rotation}
      />
    </sprite>
  );
}
