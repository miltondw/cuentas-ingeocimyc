import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { saveRequest } from "@/utils/offlineStorage";
import { tokenStorage } from "@/services/storage/tokenStorage";

const apiBaseUrl =
  import.meta.env.VITE_API_URL || "https://api-cuentas-zlut.onrender.com/api";

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

// Interface para respuestas de la API - Actualizada para ResponseDto
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  timestamp?: string;
  path?: string;
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
  return (
    import.meta.env.VITE_API_URL || "https://api-cuentas-zlut.onrender.com/api"
  );
};

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Crear la instancia de Axios con la configuración base
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // Cambiar a false ya que usamos tokens en headers
  timeout: 30000,
});

// Interceptor de request para agregar token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.info(
      `🔌 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    const token = tokenStorage.getAccessToken();

    if (token && !tokenStorage.isTokenExpired()) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.info(`✅ Access token added to request`);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas, refresh tokens y errores
apiClient.interceptors.response.use(
  (response) => {
    console.info(
      `✅ API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );

    // Transformar la respuesta para mantener compatibilidad si no usa ResponseDto
    if (response.data && typeof response.data === "object") {
      // Si ya tiene la estructura ResponseDto, mantenerla
      if (
        "success" in response.data &&
        "data" in response.data &&
        "message" in response.data
      ) {
        return response;
      }

      // Si no tiene la estructura, envolver en ResponseDto para compatibilidad
      response.data = {
        success: true,
        data: response.data,
        message: "Success",
        timestamp: new Date().toISOString(),
      };
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    console.error(
      `❌ API Error: ${
        error.response?.status || "NETWORK"
      } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      {
        code: error.code,
        message: error.message,
        status: error.response?.status,
      }
    );

    // Manejo de error 401 (token expirado o inválido)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Si ya estamos refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Llamar al endpoint de refresh
        const response = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { data } = response.data; // ResponseDto<AuthResponseDto>
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = data;

        // Actualizar tokens
        tokenStorage.setTokens(accessToken, newRefreshToken, expiresIn);

        // Procesar cola de requests pendientes
        processQueue(null, accessToken);

        // Reintentar request original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        tokenStorage.clearTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejar reintentos para errores de red/servidor
    if (!originalRequest._retry && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;
      const shouldRetry =
        (error.code === "ERR_NETWORK" ||
          error.code === "ECONNREFUSED" ||
          error.code === "NETWORK_ERROR" ||
          error.message?.includes("timeout") ||
          (error.response?.status && error.response.status >= 500)) &&
        retryCount < 2;

      if (shouldRetry) {
        originalRequest._retryCount = retryCount + 1;
        originalRequest._retry = true;

        console.info(`🔄 Reintentando request (${retryCount + 1}/3)...`);

        // Esperar antes del reintento (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );

        originalRequest._retry = false;
        return apiClient(originalRequest);
      }
    }

    // Manejar errores de red (guardar solicitud para sincronización offline)
    if (!error.response && originalRequest && !originalRequest._retry) {
      if (!navigator.onLine) {
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

        return Promise.reject({
          isOfflineError: true,
          message: "La solicitud se guardó y se enviará cuando haya conexión",
          originalError: error,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
