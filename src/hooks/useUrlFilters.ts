/**
 * Hook para manejar filtros con URL params y buenas prácticas
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import type { FilterValue } from "@/types/labFilters";

export interface UseUrlFiltersOptions<T> {
  defaultFilters: T;
  debounceMs?: number;
  excludeFromUrl?: (keyof T)[];
  onFiltersChange?: (filters: T) => void;
}

export interface UseUrlFiltersResult<T> {
  filters: T;
  updateFilters: (newFilters: Partial<T>) => void;
  updateFilter: (key: keyof T, value: FilterValue) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof T) => void;
  isLoading: boolean;
  hasActiveFilters: boolean;
  resetToDefaults: () => void;
}

/**
 * Hook personalizado para manejar filtros con sincronización de URL params
 *
 * @param options Configuración del hook
 * @returns Objeto con estado y funciones para manejar filtros
 */
export function useUrlFilters<T extends Record<string, FilterValue>>({
  defaultFilters,
  debounceMs = 300,
  excludeFromUrl = [],
  onFiltersChange,
}: UseUrlFiltersOptions<T>): UseUrlFiltersResult<T> {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para parsear valores de URL params
  const parseParamValue = useCallback(
    (value: string, key: string): FilterValue => {
      if (value === "true") return true;
      if (value === "false") return false;
      if (value === "null" || value === "undefined") return null;

      // Intentar parsear como número si el key sugiere que es numérico
      const numericKeys = [
        "page",
        "limit",
        "projectId",
        "minDepth",
        "maxDepth",
        "samplesNumber",
        "minApiques",
        "maxApiques",
      ];
      if (numericKeys.some((k) => key.includes(k))) {
        const num = Number(value);
        if (!isNaN(num)) return num;
      }

      return value;
    },
    []
  );

  // Función para convertir filtros a URL params
  const filtersToUrlParams = useCallback(
    (filters: T): URLSearchParams => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !excludeFromUrl.includes(key as keyof T)
        ) {
          params.set(key, String(value));
        }
      });

      return params;
    },
    [excludeFromUrl]
  );

  // Función para obtener filtros de URL params
  const getFiltersFromUrl = useCallback((): T => {
    const urlFilters = { ...defaultFilters };

    searchParams.forEach((value, key) => {
      if (key in defaultFilters) {
        (urlFilters as Record<string, FilterValue>)[key] = parseParamValue(
          value,
          key
        );
      }
    });

    return urlFilters;
  }, [searchParams, defaultFilters, parseParamValue]);

  // Estado de filtros basado en URL params
  const filters = useMemo(() => getFiltersFromUrl(), [getFiltersFromUrl]);

  // Función para actualizar filtros con debounce
  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      setIsLoading(true);

      // Limpiar timer anterior
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        const updatedFilters = { ...filters, ...newFilters };

        // Limpiar valores vacíos
        Object.keys(updatedFilters).forEach((key) => {
          const value = updatedFilters[key as keyof T];
          if (value === "" || value === null || value === undefined) {
            delete updatedFilters[key as keyof T];
          }
        });

        const newParams = filtersToUrlParams(updatedFilters);
        setSearchParams(newParams, { replace: true });

        onFiltersChange?.(updatedFilters);
        setIsLoading(false);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [
      filters,
      debounceTimer,
      debounceMs,
      filtersToUrlParams,
      setSearchParams,
      onFiltersChange,
    ]
  );

  // Función para actualizar un solo filtro
  const updateFilter = useCallback(
    (key: keyof T, value: FilterValue) => {
      updateFilters({ [key]: value } as Partial<T>);
    },
    [updateFilters]
  );

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
    onFiltersChange?.(defaultFilters);
  }, [setSearchParams, onFiltersChange, defaultFilters]);

  // Función para limpiar un filtro específico
  const clearFilter = useCallback(
    (key: keyof T) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      updateFilters(newFilters);
    },
    [filters, updateFilters]
  );

  // Función para resetear a valores por defecto
  const resetToDefaults = useCallback(() => {
    const defaultParams = filtersToUrlParams(defaultFilters);
    setSearchParams(defaultParams, { replace: true });
    onFiltersChange?.(defaultFilters);
  }, [defaultFilters, filtersToUrlParams, setSearchParams, onFiltersChange]);

  // Verificar si hay filtros activos (diferentes a los por defecto)
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some((key) => {
      const currentValue = filters[key as keyof T];
      const defaultValue = defaultFilters[key as keyof T];

      // Considerar valores vacíos como no activos
      if (
        currentValue === "" ||
        currentValue === null ||
        currentValue === undefined
      ) {
        return false;
      }

      return currentValue !== defaultValue;
    });
  }, [filters, defaultFilters]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Log para debugging en desarrollo
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info("🔍 Filtros actualizados:", {
        filters,
        url: location.pathname + location.search,
        hasActiveFilters,
      });
    }
  }, [filters, location, hasActiveFilters]);

  return {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
    clearFilter,
    isLoading,
    hasActiveFilters,
    resetToDefaults,
  };
}
