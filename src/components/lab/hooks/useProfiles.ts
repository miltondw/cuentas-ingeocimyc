import { useCallback, useMemo } from "react";
import { profilesService } from "@/api/services";
import { useApiData } from "@/api/hooks/useApiData";
import { useNotifications } from "@/api/hooks/useNotifications";
import type { Profile, ProfilesFilters, PaginatedResponse } from "@/types/api";

export const useProfiles = (projectId: number) => {
  const { showNotification } = useNotifications();

  // Default filters for profiles
  const defaultFilters = useMemo<ProfilesFilters>(
    () => ({
      projectId,
      page: 1,
      limit: 10,
      sortBy: "drillingDate",
      sortOrder: "DESC",
    }),
    [projectId]
  );

  // Use the generic useApiData hook
  const {
    data: profiles,
    pagination,
    loading,
    error,
    filters,
    updateFilters: baseUpdateFilters,
    refetch: refreshProfiles,
    setError,
  } = useApiData<Profile, ProfilesFilters>({
    service: profilesService.getProfiles,
    initialFilters: defaultFilters,
    autoFetch: !!projectId,
    debounceMs: 300,
  });

  // Enhanced updateFilters with validation
  const updateFilters = useCallback(
    (newFilters: Partial<ProfilesFilters>) => {
      if (newFilters.projectId && newFilters.projectId !== projectId) {
        console.warn("Project ID mismatch in profiles filters");
        return;
      }
      baseUpdateFilters({ ...newFilters, projectId });
    },
    [baseUpdateFilters, projectId]
  );

  // Delete profile with optimistic updates and notifications
  const deleteProfile = useCallback(
    async (profileId: number) => {
      try {
        await profilesService.deleteProfile(profileId);

        showNotification({
          type: "success",
          title: "Perfil eliminado",
          message: "El perfil se eliminó correctamente",
          duration: 3000,
        });

        await refreshProfiles();
        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al eliminar el perfil";

        showNotification({
          type: "error",
          title: "Error al eliminar",
          message: errorMessage,
          duration: 5000,
        });

        setError(errorMessage);
        await refreshProfiles();
        return { success: false, error: errorMessage };
      }
    },
    [showNotification, refreshProfiles, setError]
  );

  // Create profile with notifications
  const createProfile = useCallback(
    async (profileData: Omit<Profile, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newProfile = await profilesService.createProfile({
          ...profileData,
          projectId,
        });

        showNotification({
          type: "success",
          title: "Perfil creado",
          message: "El perfil se creó correctamente",
          duration: 3000,
        });

        await refreshProfiles();
        return { success: true, data: newProfile };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear el perfil";

        showNotification({
          type: "error",
          title: "Error al crear",
          message: errorMessage,
          duration: 5000,
        });

        return { success: false, error: errorMessage };
      }
    },
    [projectId, showNotification, refreshProfiles]
  );

  // Update profile with notifications
  const updateProfile = useCallback(
    async (profileId: number, updates: Partial<Profile>) => {
      try {
        const updatedProfile = await profilesService.updateProfile(
          profileId,
          updates
        );

        showNotification({
          type: "success",
          title: "Perfil actualizado",
          message: "El perfil se actualizó correctamente",
          duration: 3000,
        });

        await refreshProfiles();
        return { success: true, data: updatedProfile };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al actualizar el perfil";

        showNotification({
          type: "error",
          title: "Error al actualizar",
          message: errorMessage,
          duration: 5000,
        });

        return { success: false, error: errorMessage };
      }
    },
    [showNotification, refreshProfiles]
  );
  // Create a paginated response structure for backward compatibility
  const paginatedProfiles = useMemo<PaginatedResponse<Profile> | null>(() => {
    if (!profiles || !pagination) return null;
    return {
      data: profiles,
      pagination,
      total: pagination.totalItems,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      totalPages: pagination.totalPages,
    };
  }, [profiles, pagination]);

  return {
    // Data
    paginatedProfiles,
    profiles: profiles || [],

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
    refreshProfiles,
    deleteProfile,
    createProfile,
    updateProfile,
    setError,

    // Utilities
    clearError: () => setError(null),
    isFirstPage: (pagination?.currentPage || 1) === 1,
    isEmpty: !loading && (!profiles || profiles.length === 0),
  };
};
