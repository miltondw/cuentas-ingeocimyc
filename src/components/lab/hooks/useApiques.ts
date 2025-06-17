import { useCallback, useMemo } from "react";
import { apiquesService } from "@/api/services";
import { useApiData } from "@/api/hooks/useApiData";
import { useNotifications } from "@/api/hooks/useNotifications";
import type { Apique, ApiquesFilters, PaginatedResponse } from "@/types/api";

export const useApiques = (projectId: number) => {
  const { showNotification } = useNotifications();

  // Default filters for apiques
  const defaultFilters = useMemo<ApiquesFilters>(
    () => ({
      projectId,
      page: 1,
      limit: 10,
      sortBy: "collectionDate",
      sortOrder: "DESC",
    }),
    [projectId]
  );
  // Use the generic useApiData hook
  const {
    data: apiques,
    pagination,
    loading,
    error,
    filters,
    updateFilters: baseUpdateFilters,
    refetch: refreshApiques,
    setError,
  } = useApiData<Apique, ApiquesFilters>({
    service: apiquesService.getApiques,
    initialFilters: defaultFilters,
    autoFetch: !!projectId,
    debounceMs: 300,
  });

  // Enhanced updateFilters with validation
  const updateFilters = useCallback(
    (newFilters: Partial<ApiquesFilters>) => {
      if (newFilters.projectId && newFilters.projectId !== projectId) {
        console.warn("Project ID mismatch in apiques filters");
        return;
      }
      baseUpdateFilters({ ...newFilters, projectId });
    },
    [baseUpdateFilters, projectId]
  );
  // Delete apique with optimistic updates and notifications
  const deleteApique = useCallback(
    async (apiqueId: number) => {
      try {
        await apiquesService.deleteApique(apiqueId);

        // Show success notification
        showNotification({
          type: "success",
          title: "Apique eliminado",
          message: "El apique se eliminó correctamente",
          duration: 3000,
        });

        // Refresh data
        await refreshApiques();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al eliminar el apique";

        // Show error notification
        showNotification({
          type: "error",
          title: "Error al eliminar",
          message: errorMessage,
          duration: 5000,
        });

        setError(errorMessage);

        // Refresh to restore correct state
        await refreshApiques();
        return { success: false, error: errorMessage };
      }
    },
    [showNotification, refreshApiques, setError]
  );
  // Create apique with notifications
  const createApique = useCallback(
    async (apiqueData: Omit<Apique, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newApique = await apiquesService.createApique({
          ...apiqueData,
          projectId,
        });

        showNotification({
          type: "success",
          title: "Apique creado",
          message: "El apique se creó correctamente",
          duration: 3000,
        });

        await refreshApiques();
        return { success: true, data: newApique };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear el apique";

        showNotification({
          type: "error",
          title: "Error al crear",
          message: errorMessage,
          duration: 5000,
        });

        return { success: false, error: errorMessage };
      }
    },
    [projectId, showNotification, refreshApiques]
  );

  // Update apique with notifications
  const updateApique = useCallback(
    async (apiqueId: number, updates: Partial<Apique>) => {
      try {
        const updatedApique = await apiquesService.updateApique(
          apiqueId,
          updates
        );

        showNotification({
          type: "success",
          title: "Apique actualizado",
          message: "El apique se actualizó correctamente",
          duration: 3000,
        });

        await refreshApiques();
        return { success: true, data: updatedApique };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al actualizar el apique";

        showNotification({
          type: "error",
          title: "Error al actualizar",
          message: errorMessage,
          duration: 5000,
        });

        return { success: false, error: errorMessage };
      }
    },
    [showNotification, refreshApiques]
  );
  // Create a paginated response structure for backward compatibility
  const paginatedApiques = useMemo<PaginatedResponse<Apique> | null>(() => {
    if (!apiques || !pagination) return null;
    return {
      data: apiques,
      pagination,
      total: pagination.totalItems,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      totalPages: pagination.totalPages,
    };
  }, [apiques, pagination]);

  return {
    // Data
    paginatedApiques,
    apiques: apiques || [],

    // State
    loading,
    error,
    filters,

    // Pagination info
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 0,
    totalItems: pagination?.totalItems || 0,
    hasNextPage: pagination?.hasNextPage || false,
    hasPreviousPage: pagination?.hasPreviousPage || false,

    // Actions
    updateFilters,
    refreshApiques,
    deleteApique,
    createApique,
    updateApique,
    setError,

    // Utilities
    clearError: () => setError(null),
    isFirstPage: (pagination?.currentPage || 1) === 1,
    isEmpty: !loading && (!apiques || apiques.length === 0),
  };
};
