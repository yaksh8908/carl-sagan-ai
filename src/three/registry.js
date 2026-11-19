import { createContext, useContext } from 'react';

/** Mapa id -> Object3D dos corpos selecionáveis. A câmera consulta aqui a posição atual de cada um. */
export const RegistryContext = createContext(null);
export const useRegistry = () => useContext(RegistryContext);
