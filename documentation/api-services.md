# 🌐 Servicios y API

Documentación completa sobre la arquitectura de servicios, cliente HTTP y comunicación con el backend.

## 🏗️ Arquitectura de Servicios

```
┌─────────────────────────────────────────┐
│              API LAYER                  │
├─────────────────────────────────────────┤
│  📡 API Client (Axios)                  │
│  • Base configuration                   │
│  • Interceptors                         │
│  • Error handling                       │
├─────────────────────────────────────────┤
│  🔧 Services                            │
│  • Feature-specific services            │
│  • Type-safe methods                    │
│  • Business logic                       │
├─────────────────────────────────────────┤
│  🎣 API Hooks                           │
│  • React Query integration              │
│  • Cache management                     │
│  • Loading states                       │
└─────────────────────────────────────────┘
```

## 📡 Cliente HTTP Base

### Configuración del Cliente Axios

```tsx
// lib/axios/apiClient.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useAuthStore } from "@/stores/authStore";

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - añadir token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Auto logout en 401
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          useAuthStore.getState().logout();
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }

        // Manejo de errores de red
        if (!error.response) {
          throw new NetworkError("Error de conexión");
        }

        // Manejo de errores del servidor
        if (error.response.status >= 500) {
          throw new ServerError("Error interno del servidor");
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Método para upload de archivos
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    return this.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(Math.round(progress));
        }
      },
    });
  }
}

// Instancia singleton
export const apiClient = new ApiClient();
export default apiClient;
```

### Clases de Error Personalizadas

```tsx
// lib/axios/errors.ts
export class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message = "Error de conexión") {
    super(message, 0, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class ServerError extends ApiError {
  constructor(message = "Error del servidor") {
    super(message, 500, "SERVER_ERROR");
    this.name = "ServerError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message, 422, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
```

## 🔧 Servicios por Feature

### Service Base

```tsx
// services/api/baseService.ts
import apiClient from "@/lib/axios/apiClient";
import type {
  StandardListResponse,
  PaginationParams,
  EntityId,
} from "@/types/api";

export abstract class BaseService<
  T,
  CreateT = Partial<T>,
  UpdateT = Partial<T>
> {
  constructor(protected endpoint: string) {}

  async getAll(params?: PaginationParams): Promise<StandardListResponse<T>> {
    return apiClient.get(`${this.endpoint}`, { params });
  }

  async getById(id: EntityId): Promise<T> {
    return apiClient.get(`${this.endpoint}/${id}`);
  }

  async create(data: CreateT): Promise<T> {
    return apiClient.post(`${this.endpoint}`, data);
  }

  async update(id: EntityId, data: UpdateT): Promise<T> {
    return apiClient.put(`${this.endpoint}/${id}`, data);
  }

  async delete(id: EntityId): Promise<void> {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async bulkDelete(ids: EntityId[]): Promise<void> {
    return apiClient.delete(`${this.endpoint}/bulk`, {
      data: { ids },
    });
  }
}
```

### Projects Service

```tsx
// services/api/projectsService.ts
import { BaseService } from "./baseService";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  ProjectsResponse,
} from "@/types/projects";

class ProjectsService extends BaseService<
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
> {
  constructor() {
    super("/projects");
  }

  // Override del método getAll con filtros específicos
  async getAll(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
    return apiClient.get(`${this.endpoint}`, { params: filters });
  }

  // Métodos específicos de proyectos
  async getByClient(clientId: number): Promise<Project[]> {
    return apiClient.get(`${this.endpoint}/client/${clientId}`);
  }

  async updateStatus(id: number, status: string): Promise<Project> {
    return apiClient.put(`${this.endpoint}/${id}/status`, { status });
  }

  async addExpense(id: number, expense: any): Promise<void> {
    return apiClient.post(`${this.endpoint}/${id}/expenses`, expense);
  }

  async generateReport(
    id: number,
    format: "pdf" | "excel" = "pdf"
  ): Promise<Blob> {
    const response = await apiClient.get(`${this.endpoint}/${id}/report`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  }

  // Búsqueda avanzada
  async search(
    query: string,
    filters: Partial<ProjectFilters> = {}
  ): Promise<Project[]> {
    return apiClient.get(`${this.endpoint}/search`, {
      params: { q: query, ...filters },
    });
  }
}

export const projectsService = new ProjectsService();
```

### Financial Service

```tsx
// services/api/financialService.ts
import { BaseService } from "./baseService";
import type {
  GastoEmpresa,
  FinancialFilters,
  MonthlyReport,
  UtilityReport,
} from "@/types/financial";

class FinancialService extends BaseService<GastoEmpresa> {
  constructor() {
    super("/financial");
  }

  // Gastos empresariales
  async getGastosEmpresa(filters: FinancialFilters = {}) {
    return apiClient.get(`${this.endpoint}/gastos-empresa`, {
      params: filters,
    });
  }

  async createGastoEmpresa(data: Partial<GastoEmpresa>) {
    return apiClient.post(`${this.endpoint}/gastos-empresa`, data);
  }

  async updateGastoEmpresa(id: number, data: Partial<GastoEmpresa>) {
    return apiClient.put(`${this.endpoint}/gastos-empresa/${id}`, data);
  }

  async deleteGastoEmpresa(id: number) {
    return apiClient.delete(`${this.endpoint}/gastos-empresa/${id}`);
  }

  // Reportes financieros
  async getMonthlyReport(year: number, month?: number): Promise<MonthlyReport> {
    return apiClient.get(`${this.endpoint}/reports/monthly`, {
      params: { year, month },
    });
  }

  async getUtilityReport(
    filters: FinancialFilters = {}
  ): Promise<UtilityReport> {
    return apiClient.get(`${this.endpoint}/reports/utility`, {
      params: filters,
    });
  }

  // Exportación
  async exportData(
    format: "excel" | "pdf",
    filters: FinancialFilters = {}
  ): Promise<Blob> {
    return apiClient.get(`${this.endpoint}/export`, {
      params: { format, ...filters },
      responseType: "blob",
    });
  }
}

export const financialService = new FinancialService();
```

### Lab Service

```tsx
// services/api/labService.ts
import type {
  LabProject,
  LabProjectFilters,
  LabProjectsResponse,
  Apique,
  Profile,
} from "@/types/lab";

class LabService {
  private endpoint = "/lab";

  // Proyectos de laboratorio
  async getProjects(
    filters: LabProjectFilters = {}
  ): Promise<LabProjectsResponse> {
    return apiClient.get(`${this.endpoint}/projects`, { params: filters });
  }

  async getProjectById(id: number): Promise<LabProject> {
    return apiClient.get(`${this.endpoint}/projects/${id}`);
  }

  async createProject(data: Partial<LabProject>): Promise<LabProject> {
    return apiClient.post(`${this.endpoint}/projects`, data);
  }

  async updateProject(
    id: number,
    data: Partial<LabProject>
  ): Promise<LabProject> {
    return apiClient.put(`${this.endpoint}/projects/${id}`, data);
  }

  // Apiques
  async getApiques(projectId: number): Promise<Apique[]> {
    return apiClient.get(`${this.endpoint}/projects/${projectId}/apiques`);
  }

  async createApique(
    projectId: number,
    data: Partial<Apique>
  ): Promise<Apique> {
    return apiClient.post(
      `${this.endpoint}/projects/${projectId}/apiques`,
      data
    );
  }

  // Perfiles
  async getProfiles(projectId: number): Promise<Profile[]> {
    return apiClient.get(`${this.endpoint}/projects/${projectId}/profiles`);
  }

  async createProfile(
    projectId: number,
    data: Partial<Profile>
  ): Promise<Profile> {
    return apiClient.post(
      `${this.endpoint}/projects/${projectId}/profiles`,
      data
    );
  }

  // Estadísticas del dashboard
  async getDashboardStats(): Promise<any> {
    return apiClient.get(`${this.endpoint}/dashboard/stats`);
  }
}

export const labService = new LabService();
```

## 🎣 Hooks de API

### Hooks Base con React Query

```tsx
// api/hooks/useApiData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { EntityId, StandardListResponse } from "@/types/api";

export function useApiData<T>(
  queryKey: string[],
  queryFn: () => Promise<StandardListResponse<T>>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    select?: (data: StandardListResponse<T>) => any;
  } = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutos por defecto
    ...options,
  });
}

export function useApiItem<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options.enabled !== false,
    staleTime: options.staleTime || 1000 * 60 * 5,
  });
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    invalidateQueries?: string[][];
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries(queryKey);
        });
      }

      options.onSuccess?.(data, variables);
    },
    onError: options.onError,
  });
}
```

### Hooks Específicos

```tsx
// api/hooks/useProjects.ts
import { projectsService } from "@/services/api/projectsService";
import { useApiData, useApiItem, useApiMutation } from "./useApiData";
import { useNotifications } from "@/hooks/useNotifications";
import type {
  Project,
  ProjectFilters,
  CreateProjectRequest,
} from "@/types/projects";

export function useProjects(filters: ProjectFilters = {}) {
  return useApiData(
    ["projects", filters],
    () => projectsService.getAll(filters),
    {
      select: (data) => ({
        projects: data.data,
        pagination: data.pagination,
        summary: data.summary,
      }),
    }
  );
}

export function useProject(id: number) {
  return useApiItem(["project", id], () => projectsService.getById(id), {
    enabled: !!id,
  });
}

export function useCreateProject() {
  const { showNotification } = useNotifications();

  return useApiMutation(
    (data: CreateProjectRequest) => projectsService.create(data),
    {
      onSuccess: () => {
        showNotification({
          type: "success",
          message: "Proyecto creado exitosamente",
        });
      },
      onError: () => {
        showNotification({
          type: "error",
          message: "Error al crear el proyecto",
        });
      },
      invalidateQueries: [["projects"]],
    }
  );
}

export function useUpdateProject() {
  const { showNotification } = useNotifications();

  return useApiMutation(
    ({ id, data }: { id: number; data: Partial<Project> }) =>
      projectsService.update(id, data),
    {
      onSuccess: (updatedProject) => {
        showNotification({
          type: "success",
          message: "Proyecto actualizado exitosamente",
        });
      },
      invalidateQueries: [["projects"], ["project"]],
    }
  );
}

export function useDeleteProject() {
  const { showNotification } = useNotifications();

  return useApiMutation((id: number) => projectsService.delete(id), {
    onSuccess: () => {
      showNotification({
        type: "success",
        message: "Proyecto eliminado exitosamente",
      });
    },
    invalidateQueries: [["projects"]],
  });
}
```

## 🔄 Caché y Sincronización

### Estrategias de Caché

```tsx
// Configuración de caché por tipo de dato
const cacheConfig = {
  // Datos que cambian frecuentemente
  dynamic: {
    staleTime: 1000 * 30, // 30 segundos
    cacheTime: 1000 * 60 * 5, // 5 minutos
  },

  // Datos estables
  stable: {
    staleTime: 1000 * 60 * 15, // 15 minutos
    cacheTime: 1000 * 60 * 60, // 1 hora
  },

  // Datos estáticos
  static: {
    staleTime: 1000 * 60 * 60, // 1 hora
    cacheTime: 1000 * 60 * 60 * 24, // 24 horas
  },
};

// Ejemplo de uso
export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectsService.getAll(filters),
    ...cacheConfig.dynamic, // Los proyectos cambian frecuentemente
  });
}

export function useSystemConfig() {
  return useQuery({
    queryKey: ["system-config"],
    queryFn: () => configService.getConfig(),
    ...cacheConfig.static, // La configuración rara vez cambia
  });
}
```

### Invalidación Selectiva

```tsx
// utils/queryInvalidation.ts
import { QueryClient } from "@tanstack/react-query";

export class QueryInvalidator {
  constructor(private queryClient: QueryClient) {}

  // Invalidar proyectos específicos
  invalidateProject(projectId: number) {
    this.queryClient.invalidateQueries(["project", projectId]);
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        const [key, filters] = query.queryKey;
        return (
          key === "projects" &&
          typeof filters === "object" &&
          filters?.projectId === projectId
        );
      },
    });
  }

  // Invalidar datos financieros
  invalidateFinancialData(year?: number, month?: number) {
    this.queryClient.invalidateQueries(["financial"]);

    if (year) {
      this.queryClient.invalidateQueries(["financial-report", year]);

      if (month) {
        this.queryClient.invalidateQueries(["financial-report", year, month]);
      }
    }
  }

  // Invalidar todo el caché (usar con precaución)
  invalidateAll() {
    this.queryClient.invalidateQueries();
  }
}

// Hook para usar el invalidator
export function useQueryInvalidator() {
  const queryClient = useQueryClient();
  return useMemo(() => new QueryInvalidator(queryClient), [queryClient]);
}
```

## 📤 Upload de Archivos

### Service de Upload

```tsx
// services/api/uploadService.ts
class UploadService {
  async uploadFile(
    file: File,
    endpoint: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.upload(`/upload/${endpoint}`, formData, onProgress);
  }

  async uploadMultiple(
    files: File[],
    endpoint: string,
    onProgress?: (progress: number) => void
  ): Promise<Array<{ url: string; id: string }>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return apiClient.upload(
      `/upload/${endpoint}/multiple`,
      formData,
      onProgress
    );
  }

  async deleteFile(fileId: string): Promise<void> {
    return apiClient.delete(`/upload/files/${fileId}`);
  }
}

export const uploadService = new UploadService();
```

### Hook de Upload

```tsx
// hooks/useFileUpload.ts
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadService } from "@/services/api/uploadService";

export function useFileUpload() {
  const [progress, setProgress] = useState<number>(0);

  const uploadMutation = useMutation({
    mutationFn: ({ file, endpoint }: { file: File; endpoint: string }) =>
      uploadService.uploadFile(file, endpoint, setProgress),
    onSuccess: () => {
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isLoading,
    progress,
    error: uploadMutation.error,
    data: uploadMutation.data,
  };
}
```

## 🚨 Manejo de Errores

### Error Handler Global

```tsx
// utils/errorHandler.ts
import { AxiosError } from "axios";
import { useNotifications } from "@/hooks/useNotifications";

export class ErrorHandler {
  static handle(error: unknown, context?: string) {
    console.error(`Error in ${context}:`, error);

    if (error instanceof AxiosError) {
      return this.handleAxiosError(error);
    }

    if (error instanceof Error) {
      return this.handleGenericError(error);
    }

    return "Error desconocido";
  }

  private static handleAxiosError(error: AxiosError): string {
    const status = error.response?.status;
    const data = error.response?.data as any;

    switch (status) {
      case 400:
        return data?.message || "Solicitud inválida";
      case 401:
        return "No autorizado. Por favor, inicie sesión nuevamente.";
      case 403:
        return "No tiene permisos para realizar esta acción.";
      case 404:
        return "Recurso no encontrado.";
      case 422:
        return data?.message || "Datos de validación incorrectos.";
      case 500:
        return "Error interno del servidor. Intente nuevamente.";
      default:
        return data?.message || "Error en la comunicación con el servidor.";
    }
  }

  private static handleGenericError(error: Error): string {
    return error.message || "Error inesperado";
  }
}

// Hook para manejo de errores
export function useErrorHandler() {
  const { showNotification } = useNotifications();

  const handleError = (error: unknown, context?: string) => {
    const message = ErrorHandler.handle(error, context);

    showNotification({
      type: "error",
      title: "Error",
      message,
      duration: 5000,
    });
  };

  return { handleError };
}
```

## 🔧 Configuración Avanzada

### Retry Logic

```tsx
// utils/retryConfig.ts
export const retryConfig = {
  retry: (failureCount: number, error: any) => {
    // No reintentar errores de cliente (4xx)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }

    // Máximo 3 reintentos
    return failureCount < 3;
  },

  retryDelay: (attemptIndex: number) => {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * 2 ** attemptIndex, 30000);
  },
};

// Uso en queries
export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => projectsService.getAll(filters),
    ...retryConfig,
  });
}
```

### Request Deduplication

```tsx
// React Query automáticamente deduplica requests idénticos
// Pero puedes configurarlo manualmente para casos específicos

export function useProjectsWithDedup(filters: ProjectFilters = {}) {
  // Normalizar filtros para evitar requests duplicados
  const normalizedFilters = useMemo(() => {
    const sorted = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {} as ProjectFilters);

    return sorted;
  }, [filters]);

  return useQuery({
    queryKey: ["projects", normalizedFilters],
    queryFn: () => projectsService.getAll(normalizedFilters),
    staleTime: 1000 * 60 * 5,
  });
}
```

---

**Siguiente:** [🔐 Autenticación](./authentication.md)
