import { Vector3 } from 'three';

/** Parâmetros compartilhados entre estrelas, poeira e nebulosas para que sigam os mesmos braços. */
export const GALAXY_PARAMS = { radius: 60, arms: 4, twist: 5.0 };

export const HOME = {
  galaxy: { position: new Vector3(0, 62, 108), target: new Vector3(0, 0, 0), maxDistance: 520 },
  solar: { position: new Vector3(0, 24, 46), target: new Vector3(0, 0, 0), maxDistance: 160 },
};

export const noRaycast = () => null;
