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
  timeout: 30000, // Aumentar timeout a 30 segundos para conexiones lentas como Render
});

// Interceptor de request para agregar token de autenticación
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Debug logging
    console.info(
      `🔌 Auth Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    const token = tokenStorage.getAccessToken();
    console.info(`🔑 Auth token present: ${!!token}`);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      console.info(`✅ Auth header set`);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Auth Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.info(
      `✅ Auth Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    console.error(
      `❌ Auth Error: ${
        error.response?.status || "NETWORK"
      } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      {
        code: error.code,
        message: error.message,
        status: error.response?.status,
      }
    );

    // Manejar reintentos para errores de red/servidor antes que otros errores
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

        console.info(`🔄 Reintentando login (${retryCount + 1}/3)...`);

        // Esperar antes del reintento (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );

        // Reiniciar _retry para el siguiente intento
        originalRequest._retry = false;

        return apiClient(originalRequest);
      }
    }

    // Manejar errores de red (guardar solicitud para sincronización)
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

// Función para "despertar" el servidor (pre-warm) en caso de que esté dormido
const warmUpServer = async (): Promise<void> => {
  try {
    console.info("🔥 Intentando despertar servidor...");
    const response = await fetch(
      `https://api-cuentas-zlut.onrender.com/health`,
      {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json",
        },
      }
    );
    console.info(
      "🔥 Server warm-up:",
      response.status === 200 ? "Success ✅" : `Failed ❌ (${response.status})`
    );
  } catch (error) {
    console.warn(
      "⚠️ Server warm-up failed (server might be cold starting):",
      (error as Error).message
    );

    // Intentar con el endpoint base como fallback
    try {
      const fallbackResponse = await fetch(getBaseURL(), {
        method: "GET",
        mode: "cors",
      });
      console.info(
        "🔥 Fallback warm-up:",
        fallbackResponse.status === 200
          ? "Success ✅"
          : `Status: ${fallbackResponse.status}`
      );
    } catch (fallbackError) {
      console.warn(
        "⚠️ Fallback warm-up also failed:",
        (fallbackError as Error).message
      );
    }
  }
};

// Hacer warm-up automático cuando se carga el módulo
if (typeof window !== "undefined" && import.meta.env.DEV) {
  warmUpServer();
}

export default apiClient;
