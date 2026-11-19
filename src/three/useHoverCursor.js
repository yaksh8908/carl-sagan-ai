import { useEffect } from 'react';

/** Mostra o cursor de clique sobre objetos selecionáveis e o restaura ao sair/desmontar. */
export function useHoverCursor(hovered) {
  useEffect(() => {
    if (!hovered) return undefined;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);
}
