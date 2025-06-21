import { useQuery } from "@tanstack/react-query";
import { useServerPagination } from "@/hooks/useServerPagination";
import { projectsService } from "@/api/services";
import type { Project, ProjectFilters } from "@/types/api";

/**
 * Parámetros para el hook de proyectos paginados
 */
export interface UseProjectsPaginatedParams {
  page: number;
  limit: number;
  filters?: Omit<ProjectFilters, "page" | "limit">;
  enabled?: boolean;
}

/**
 * Hook para obtener proyectos con paginación de servidor
 *
 * @example
 * ```tsx
 * const ProjectsPage = () => {
 *   const [page, setPage] = useState(1);
 *   const [limit, setLimit] = useState(10);
 *   const [searchTerm, setSearchTerm] = useState('');
 *
 *   const { data, isLoading, paginationData, isEmpty } = useProjectsPaginated({
 *     page,
 *     limit,
 *     filters: { search: searchTerm },
 *   });
 *
 *   return (
 *     <>
 *       <DataTable
 *         data={data}
 *         columns={columns}
 *         loading={isLoading}
 *         keyField="id"
 *       />
 *       {!isEmpty && (
 *         <DataTablePagination
 *           paginationData={paginationData}
 *           onPageChange={setPage}
 *           onRowsPerPageChange={setLimit}
 *         />
 *       )}
 *     </>
 *   );
 * };
 * ```
 */
export const useProjectsPaginated = ({
  page,
  limit,
  filters,
  enabled = true,
}: UseProjectsPaginatedParams) => {
  // Query para obtener datos de la API
  const queryResult = useQuery({
    queryKey: ["projects-paginated", page, limit, filters],
    queryFn: () => projectsService.getProjectsPaginated(page, limit, filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Transformar la respuesta usando el hook de paginación de servidor
  return useServerPagination<Project>({
    apiResponse: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  });
};

export default useProjectsPaginated;
