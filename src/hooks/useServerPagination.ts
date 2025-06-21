import { useMemo } from "react";
import type { PaginationData } from "@/components/common/DataTablePagination";

/**
 * Estructura estándar de respuesta de API con paginación
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Props para el hook de paginación de servidor
 */
export interface UseServerPaginationProps<T> {
  apiResponse?: ApiPaginatedResponse<T>;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * Valor de retorno del hook de paginación de servidor
 */
export interface UseServerPaginationReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  paginationData: PaginationData;
  isEmpty: boolean;
}

/**
 * Hook para manejar paginación del lado del servidor
 *
 * Este hook transforma la respuesta de APIs que siguen el formato:
 * {
 *   data: T[],
 *   total: number,
 *   page: number,
 *   limit: number
 * }
 *
 * En un formato compatible con DataTable y DataTablePagination
 *
 * @example
 * ```tsx
 * const { data: apiResponse, isLoading, error } = useQuery({
 *   queryKey: ['projects', page, limit],
 *   queryFn: () => fetchProjects(page, limit),
 * });
 *
 * const { data, paginationData, isEmpty } = useServerPagination({
 *   apiResponse,
 *   isLoading,
 *   error,
 * });
 *
 * return (
 *   <>
 *     <DataTable data={data} columns={columns} loading={isLoading} />
 *     {!isEmpty && (
 *       <DataTablePagination
 *         paginationData={paginationData}
 *         onPageChange={setPage}
 *         onRowsPerPageChange={setLimit}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export const useServerPagination = <T>({
  apiResponse,
  isLoading = false,
  error = null,
}: UseServerPaginationProps<T>): UseServerPaginationReturn<T> => {
  // Calcular datos de paginación basados en la respuesta de la API
  const paginationData = useMemo((): PaginationData => {
    if (!apiResponse) {
      return {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        startItem: 0,
        endItem: 0,
      };
    }

    const { total, page, limit } = apiResponse;
    const totalPages = Math.ceil(total / limit);
    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      startItem,
      endItem,
    };
  }, [apiResponse]);

  // Datos extraídos de la respuesta
  const data = useMemo(() => apiResponse?.data || [], [apiResponse]);

  // Verificar si no hay datos
  const isEmpty = useMemo(() => {
    return !isLoading && (!apiResponse || apiResponse.total === 0);
  }, [isLoading, apiResponse]);

  return {
    data,
    isLoading,
    error,
    paginationData,
    isEmpty,
  };
};

/**
 * Hook más específico que combina react-query con paginación de servidor
 *
 * @example
 * ```tsx
 * const useProjects = (page: number, limit: number) => {
 *   const queryResult = useQuery({
 *     queryKey: ['projects', page, limit],
 *     queryFn: () => fetchProjects(page, limit),
 *   });
 *
 *   return useServerPaginationQuery(queryResult);
 * };
 * ```
 */
export const useServerPaginationQuery = <T>(queryResult: {
  data?: ApiPaginatedResponse<T>;
  isLoading: boolean;
  error: Error | null;
}): UseServerPaginationReturn<T> => {
  return useServerPagination({
    apiResponse: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  });
};

export default useServerPagination;
