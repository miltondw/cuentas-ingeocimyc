import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { saveRequest } from "@/utils/offlineStorage";
import { tokenStorage } from "@/services/storage/tokenStorage";

// Definir interfaces para las respuestas de error
export interface ErrorResponseData {
  waitMinutes?: number;
  error?: string;
  message?: string;
  status?: number;
  details?: unknown;
}

// Interface para respuestas paginadas de la API (actualizada según NestJS)
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: Record<string, string | number | boolean>;
  sort?: {
    field: string;
    direction: "ASC" | "DESC";
  };
}

// Interface para respuestas de la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Interface para filtros base
export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// Configuración del entorno
const getBaseURL = (): string => {
  // Si estamos en desarrollo, usar el servidor externo
  if (import.meta.env.DEV) {
    return "https://api-cuentas-zlut.onrender.com/api";
  }
  // En producción, usar la ruta relativa
  return "/api";
};

// Crear la instancia de Axios con la configuración base
export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 15000, // Timeout de 15 segundos
});

// Interceptor de request para agregar token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    }; // Manejar errores de red (guardar solicitud para sincronización)
    if (!error.response && originalRequest && !originalRequest._retry) {
      // Si no hay conexión a internet, guardar la solicitud para sincronizarla después
      if (!navigator.onLine) {
        // Convertir headers de Axios a Record<string, string>
        const convertedHeaders: Record<string, string> = {};
        if (originalRequest.headers) {
          Object.entries(originalRequest.headers).forEach(([key, value]) => {
            if (typeof value === "string") {
              convertedHeaders[key] = value;
            } else if (value != null) {
              convertedHeaders[key] = String(value);
            }
          });
        }

        await saveRequest({
          url: originalRequest.url || "",
          method: originalRequest.method || "GET",
          data: originalRequest.data,
          headers: convertedHeaders,
          timestamp: new Date().toISOString(),
          priority: 1,
        });

        // Devolver un error personalizado
        return Promise.reject({
          isOfflineError: true,
          message: "La solicitud se guardó y se enviará cuando haya conexión",
          originalError: error,
        });
      }
    }

    // Manejo de error 401 (no autorizado)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        // Intentar renovar token (esto requiere implementar la función refreshToken)
        // const newToken = await refreshToken();
        // Si se logra obtener un nuevo token, reintentar la solicitud
        // tokenStorage.setAccessToken(newToken);
        // return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla la renovación del token, cerrar sesión
        tokenStorage.clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
