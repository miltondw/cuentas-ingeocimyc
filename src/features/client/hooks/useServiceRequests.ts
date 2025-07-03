/**
 * Hook para actualizar una solicitud de servicio (cliente)
 */
import type { UpdateServiceRequestRequest } from "@/types/serviceRequests";
export const useUpdateServiceRequest = () => {
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateServiceRequestRequest;
    }) => {
      return await serviceRequestsService.updateServiceRequest(id, data);
    },
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({
        queryKey: SERVICE_REQUEST_KEYS.details(),
      });
      queryClient.setQueryData(
        SERVICE_REQUEST_KEYS.detail(updatedRequest.id),
        updatedRequest
      );
      showNotification({
        severity: "success",
        message: "Solicitud de servicio actualizada exitosamente",
      });
    },
    onError: (error: unknown) => {
      const err = error as APIError;
      showNotification({
        severity: "error",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Error al actualizar la solicitud de servicio",
      });
    },
  });
};
/**
 * Hook para manejar solicitudes de servicio
 * @file useServiceRequests.ts
 */

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceRequestsService } from "@/api/services/serviceRequestsService";
import { useNotifications } from "@/hooks/useNotifications";
import type {
  CreateServiceRequestRequest,
  ServiceRequestFilters,
  InternalServiceRequestData,
} from "@/types/serviceRequests";

// Interfaz para errores de API
interface APIError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Claves de query para React Query
export const SERVICE_REQUEST_KEYS = {
  all: ["serviceRequests"] as const,
  lists: () => [...SERVICE_REQUEST_KEYS.all, "list"] as const,
  list: (filters: ServiceRequestFilters) =>
    [...SERVICE_REQUEST_KEYS.lists(), filters] as const,
  details: () => [...SERVICE_REQUEST_KEYS.all, "detail"] as const,
  detail: (id: number) => [...SERVICE_REQUEST_KEYS.details(), id] as const,
  services: ["services"] as const,
  serviceTypes: () => [...SERVICE_REQUEST_KEYS.services, "types"] as const,
  serviceCategories: () =>
    [...SERVICE_REQUEST_KEYS.services, "categories"] as const,
};

/**
 * Hook principal para manejar solicitudes de servicio
 */
export const useServiceRequests = (filters: ServiceRequestFilters = {}) => {
  // Query para obtener la lista de solicitudes
  const {
    data: serviceRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: SERVICE_REQUEST_KEYS.list(filters),
    queryFn: () => serviceRequestsService.getServiceRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  return {
    serviceRequests: serviceRequests?.data || [],
    page: serviceRequests?.page,
    limit: serviceRequests?.limit,
    total: serviceRequests?.total || 0,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener una solicitud específica
 */
export const useServiceRequest = (id: number) => {
  return useQuery({
    queryKey: SERVICE_REQUEST_KEYS.detail(id),
    queryFn: () => serviceRequestsService.getServiceRequest(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener tipos de servicios
 */
export const useServiceTypes = () => {
  return useQuery({
    queryKey: SERVICE_REQUEST_KEYS.serviceTypes(),
    queryFn: () => serviceRequestsService.getServiceTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutos (raramente cambian)
  });
};

/**
 * Hook para obtener categorías de servicios
 */
export const useServiceCategories = () => {
  return useQuery({
    queryKey: SERVICE_REQUEST_KEYS.serviceCategories(),
    queryFn: () => serviceRequestsService.getServiceCategories(),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para obtener todos los servicios desde /api/services
 */
export const useServices = () => {
  return useQuery({
    queryKey: [...SERVICE_REQUEST_KEYS.services, "all"],
    queryFn: () => serviceRequestsService.getServices(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para crear solicitudes de servicio
 */
export const useCreateServiceRequest = () => {
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequestRequest) =>
      serviceRequestsService.createServiceRequest(data),
    onSuccess: (newRequest) => {
      // Invalidar y refrescar la cache
      queryClient.invalidateQueries({
        queryKey: SERVICE_REQUEST_KEYS.lists(),
      });

      // Agregar la nueva solicitud a la cache
      queryClient.setQueryData(
        SERVICE_REQUEST_KEYS.detail(newRequest.id),
        newRequest
      );
      showNotification({
        severity: "success",
        message: "Solicitud de servicio creada exitosamente",
      });
    },
    onError: (error: APIError) => {
      console.error("Error creating service request:", error);
      showNotification({
        severity: "error",
        message:
          error.response?.data?.message ||
          "Error al crear la solicitud de servicio",
      });
    },
  });
};

/**
 * Hook para descargar PDF de solicitud
 */
export const useDownloadServiceRequestPDF = () => {
  const { showNotification } = useNotifications();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = useCallback(
    async (id: number, filename?: string) => {
      setIsDownloading(true);
      try {
        const blob = await serviceRequestsService.downloadServiceRequestPDF(id);

        // Crear URL del blob y descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || `solicitud-servicio-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showNotification({
          severity: "success",
          message: "PDF descargado exitosamente",
        });
      } catch (error: unknown) {
        const apiError = error as APIError;
        console.error("Error downloading PDF:", apiError);
        showNotification({
          severity: "error",
          message:
            apiError.response?.data?.message || "Error al descargar el PDF",
        });
      } finally {
        setIsDownloading(false);
      }
    },
    [showNotification]
  );

  return {
    downloadPDF,
    isDownloading,
  };
};

/**
 * Hook para previsualizar PDF
 */
export const usePreviewServiceRequestPDF = () => {
  const { showNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const previewPDF = useCallback(
    async (id: number) => {
      setIsLoading(true);
      try {
        const previewUrl =
          await serviceRequestsService.previewServiceRequestPDF(id);

        // Abrir en nueva ventana
        window.open(previewUrl, "_blank");
        return previewUrl;
      } catch (error: unknown) {
        const apiError = error as APIError;
        console.error("Error previewing PDF:", apiError);
        showNotification({
          severity: "error",
          message:
            apiError.response?.data?.message || "Error al previsualizar el PDF",
        });
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [showNotification]
  );

  return {
    previewPDF,
    isLoading,
  };
};

/**
 * Hook para validaciones del formulario
 */
export const useServiceRequestValidation = () => {
  const validateForm = useCallback((data: InternalServiceRequestData) => {
    const errors: Partial<Record<keyof InternalServiceRequestData, string>> =
      {};

    // Validar nombre
    if (!data.nombre?.trim()) {
      errors.nombre = "El nombre es requerido";
    } else if (data.nombre.length < 2) {
      errors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email?.trim()) {
      errors.email = "El email es requerido";
    } else if (!emailRegex.test(data.email)) {
      errors.email = "Formato de email inválido";
    }

    // Validar teléfono
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!data.telefono?.trim()) {
      errors.telefono = "El teléfono es requerido";
    } else if (!phoneRegex.test(data.telefono) || data.telefono.length < 8) {
      errors.telefono = "Formato de teléfono inválido";
    }

    // Validar empresa
    if (!data.empresa?.trim()) {
      errors.empresa = "El nombre de la empresa es requerido";
    }

    // Validar servicios seleccionados
    if (!data.selectedServices || data.selectedServices.length === 0) {
      errors.selectedServices = "Debe seleccionar al menos un servicio";
    }

    // Validar descripción
    if (!data.descripcion?.trim()) {
      errors.descripcion = "La descripción del proyecto es requerida";
    } else if (data.descripcion.length < 10) {
      errors.descripcion = "La descripción debe tener al menos 10 caracteres";
    }

    // Validar ubicación
    if (!data.ubicacionProyecto?.trim()) {
      errors.ubicacionProyecto = "La ubicación del proyecto es requerida";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, []);

  return { validateForm };
};
