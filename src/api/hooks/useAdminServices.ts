import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/api/services/admin";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateServiceRequest,
  CreateCompleteServiceRequest,
  UpdateServiceRequest,
  UpdateCompleteServiceRequest,
  CreateServiceAdditionalFieldRequest,
  UpdateServiceAdditionalFieldRequest,
  AdminQueryParams,
} from "@/types/admin";

// Tipo para manejar errores de API
type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

// =============== QUERY KEYS ===============
export const adminQueryKeys = {
  all: ["admin"] as const,
  categories: () => [...adminQueryKeys.all, "categories"] as const,
  category: (id: number) => [...adminQueryKeys.categories(), id] as const,
  services: () => [...adminQueryKeys.all, "services"] as const,
  service: (id: number) => [...adminQueryKeys.services(), id] as const,
  fields: (serviceId: number) =>
    [...adminQueryKeys.service(serviceId), "fields"] as const,
  field: (fieldId: number) =>
    [...adminQueryKeys.all, "fields", fieldId] as const,
};

// =============== HOOKS PARA CATEGORÍAS ===============

// Obtener todas las categorías
export const useAdminCategories = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: [...adminQueryKeys.categories(), params],
    queryFn: () => adminApi.categories.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Obtener categoría por ID
export const useAdminCategory = (id: number) => {
  return useQuery({
    queryKey: adminQueryKeys.category(id),
    queryFn: () => adminApi.categories.getById(id),
    enabled: !!id,
  });
};

// Crear categoría
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      adminApi.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Categoría creada exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al crear la categoría";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Actualizar categoría
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      adminApi.categories.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.category(id) });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Categoría actualizada exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al actualizar la categoría";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Eliminar categoría
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Categoría eliminada exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al eliminar la categoría";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// =============== HOOKS PARA SERVICIOS ===============

// Obtener todos los servicios
export const useAdminServices = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: [...adminQueryKeys.services(), params],
    queryFn: () => adminApi.services.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
};

// Obtener servicio por ID
export const useAdminService = (id: number) => {
  return useQuery({
    queryKey: adminQueryKeys.service(id),
    queryFn: () => adminApi.services.getById(id),
    enabled: !!id,
  });
};

// Crear servicio básico
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequest) => adminApi.services.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Servicio creado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al crear el servicio";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Crear servicio completo
export const useCreateCompleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompleteServiceRequest) =>
      adminApi.services.createComplete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Servicio completo creado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al crear el servicio completo";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Actualizar servicio
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceRequest }) =>
      adminApi.services.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.service(id) });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Servicio actualizado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al actualizar el servicio";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Actualizar servicio completo
export const useUpdateCompleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCompleteServiceRequest;
    }) => adminApi.services.updateComplete(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.service(id) });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Servicio actualizado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message ||
        "Error al actualizar el servicio completo";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Eliminar servicio
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminApi.services.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Servicio eliminado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al eliminar el servicio";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// =============== HOOKS PARA CAMPOS ADICIONALES ===============

// Obtener campos de un servicio
export const useServiceFields = (serviceId: number) => {
  return useQuery({
    queryKey: adminQueryKeys.fields(serviceId),
    queryFn: () => adminApi.fields.getByServiceId(serviceId),
    enabled: !!serviceId,
  });
};

// Obtener campo por ID
export const useServiceField = (fieldId: number) => {
  return useQuery({
    queryKey: adminQueryKeys.field(fieldId),
    queryFn: () => adminApi.fields.getById(fieldId),
    enabled: !!fieldId,
  });
};

// Crear campo adicional
export const useCreateServiceField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      data,
    }: {
      serviceId: number;
      data: CreateServiceAdditionalFieldRequest;
    }) => adminApi.fields.create(serviceId, data),
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.fields(serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.service(serviceId),
      });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Campo adicional creado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al crear el campo adicional";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Actualizar campo adicional
export const useUpdateServiceField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: number;
      data: UpdateServiceAdditionalFieldRequest;
    }) => adminApi.fields.update(fieldId, data),
    onSuccess: (data) => {
      if (data?.data?.serviceId) {
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.fields(data.data.serviceId),
        });
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.service(data.data.serviceId),
        });
      }
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Campo actualizado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al actualizar el campo";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};

// Eliminar campo adicional
export const useDeleteServiceField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: number) => adminApi.fields.delete(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: {
            message: "Campo eliminado exitosamente",
            severity: "success",
          },
        })
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Error al eliminar el campo";
      window.dispatchEvent(
        new CustomEvent("app:notification", {
          detail: { message, severity: "error" },
        })
      );
    },
  });
};
