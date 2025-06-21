/**
 * Hook para debounce de valores
 * @file useDebounce.ts
 */

import { useState, useEffect } from "react";

/**
 * Hook que retorna un valor debounced después de un delay específico
 * @param value - El valor a hacer debounce
 * @param delay - El tiempo de delay en milisegundos
 * @returns El valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
