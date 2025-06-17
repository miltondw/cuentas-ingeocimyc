/**
 * Hook personalizado para gestión de datos de la API
 * Basado en las mejores prácticas modernas de React y las nuevas funcionalidades de la API
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { PaginatedResponse } from "@/types/api";

export interface UseApiDataOptions<T, F = Record<string, unknown>> {
  service: (filters: F) => Promise<PaginatedResponse<T>>;
  initialFilters?: F;
  autoFetch?: boolean;
  dependencies?: unknown[];
  onError?: (error: Error) => void;
  onSuccess?: (data: PaginatedResponse<T>) => void;
  debounceMs?: number;
}

export interface UseApiDataResult<T, F = Record<string, unknown>> {
  data: T[];
  pagination: PaginatedResponse<T>["pagination"] | null;
  loading: boolean;
  error: string | null;
  filters: F;
  updateFilters: (newFilters: Partial<F>) => void;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  setError: (error: string | null) => void;
}

export function useApiData<T, F = Record<string, unknown>>({
  service,
  initialFilters = {} as F,
  autoFetch = true,
  dependencies = [],
  onError,
  onSuccess,
  debounceMs = 300,
}: UseApiDataOptions<T, F>): UseApiDataResult<T, F> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedResponse<T>["pagination"] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<F>(initialFilters);

  // Use ref to store the timeout ID
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (filtersToUse: F) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);

        const response = await service(filtersToUse);

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        setData(response.data);
        setPagination(response.pagination);

        if (onSuccess) {
          onSuccess(response);
        }
      } catch (err) {
        // Don't set error if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar datos";
        setError(errorMessage);
        setData([]);
        setPagination(null);

        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        // Don't set loading to false if request was aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [service, onError, onSuccess]
  );

  const debouncedFetchData = useCallback(
    (filtersToUse: F) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        fetchData(filtersToUse);
      }, debounceMs);
    },
    [fetchData, debounceMs]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<F>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };
        debouncedFetchData(updated);
        return updated;
      });
    },
    [debouncedFetchData]
  );

  const refetch = useCallback(() => {
    return fetchData(filters);
  }, [fetchData, filters]);

  const refresh = useCallback(() => {
    return fetchData(filters);
  }, [fetchData, filters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSetError = useCallback((newError: string | null) => {
    setError(newError);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData(filters);
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refetch,
    refresh,
    clearError,
    setError: handleSetError,
  };
}

export default useApiData;
