/**
 * Hooks para administración de solicitudes de servicio
 * @file useAdminServiceRequests.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/useNotifications";
import { adminServiceRequestsService } from "@/api/services/adminServiceRequestsService";
import type {
  AdminServiceRequestFilters,
  UpdateServiceRequestStatusRequest,
} from "@/types/serviceRequests";

// Query keys
export const ADMIN_SERVICE_REQUESTS_KEYS = {
  all: ["admin", "serviceRequests"] as const,
  lists: () => [...ADMIN_SERVICE_REQUESTS_KEYS.all, "list"] as const,
  list: (filters: AdminServiceRequestFilters) =>
    [...ADMIN_SERVICE_REQUESTS_KEYS.lists(), filters] as const,
  details: () => [...ADMIN_SERVICE_REQUESTS_KEYS.all, "detail"] as const,
  detail: (id: number) =>
    [...ADMIN_SERVICE_REQUESTS_KEYS.details(), id] as const,
  stats: () => [...ADMIN_SERVICE_REQUESTS_KEYS.all, "stats"] as const,
};

/**
 * Hook para obtener lista de solicitudes de servicio
 */
export function useAdminServiceRequests(
  filters: AdminServiceRequestFilters = {}
) {
  return useQuery({
    queryKey: ADMIN_SERVICE_REQUESTS_KEYS.list(filters),
    queryFn: () => adminServiceRequestsService.getServiceRequests(filters),
  });
}

/**
 * Hook para obtener una solicitud de servicio específica
 */
export function useAdminServiceRequest(id: number) {
  return useQuery({
    queryKey: ADMIN_SERVICE_REQUESTS_KEYS.detail(id),
    queryFn: () => adminServiceRequestsService.getServiceRequest(id),
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de solicitudes
 */
export function useAdminServiceRequestStats() {
  return useQuery({
    queryKey: ADMIN_SERVICE_REQUESTS_KEYS.stats(),
    queryFn: () => adminServiceRequestsService.getServiceRequestStats(),
  });
}

/**
 * Hook para actualizar una solicitud de servicio
 */
export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateServiceRequestStatusRequest;
    }) => adminServiceRequestsService.updateServiceRequest(id, data),
    onSuccess: (updatedRequest, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_REQUESTS_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_REQUESTS_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_REQUESTS_KEYS.stats(),
      });

      showSuccess("Solicitud actualizada exitosamente");
    },
    onError: (error: Error) => {
      showError(`Error al actualizar la solicitud: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar una solicitud de servicio
 */
export function useDeleteServiceRequest() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();

  return useMutation({
    mutationFn: (id: number) =>
      adminServiceRequestsService.deleteServiceRequest(id),
    onSuccess: () => {
      // Invalidar todas las queries de solicitudes
      queryClient.invalidateQueries({
        queryKey: ADMIN_SERVICE_REQUESTS_KEYS.all,
      });

      showSuccess("Solicitud eliminada exitosamente");
    },
    onError: (error: Error) => {
      showError(`Error al eliminar la solicitud: ${error.message}`);
    },
  });
}

/**
 * Hook para generar PDF
 */
export function useGeneratePDF() {
  const { showSuccess, showError } = useNotifications();

  return useMutation({
    mutationFn: (id: number) => adminServiceRequestsService.generatePDF(id),
    onSuccess: (blob, id) => {
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `solicitud-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("PDF generado y descargado exitosamente");
    },
    onError: (error: Error) => {
      showError(`Error al generar PDF: ${error.message}`);
    },
  });
}

/**
 * Hook para regenerar PDF
 */
export function useRegeneratePDF() {
  const { showSuccess, showError } = useNotifications();

  return useMutation({
    mutationFn: (id: number) => adminServiceRequestsService.regeneratePDF(id),
    onSuccess: () => {
      showSuccess("PDF regenerado exitosamente");
    },
    onError: (error: Error) => {
      showError(`Error al regenerar PDF: ${error.message}`);
    },
  });
}

/**
 * Hook para previsualizar PDF
 */
export function usePreviewPDF(id: number) {
  return useQuery({
    queryKey: ["admin", "serviceRequests", "pdf", "preview", id],
    queryFn: () => adminServiceRequestsService.previewPDF(id),
    enabled: !!id,
  });
}
