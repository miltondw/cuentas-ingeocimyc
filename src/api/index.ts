import axios, {
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { saveRequest } from "@utils/offlineStorage";

// Definir interfaces para las respuestas de error
interface ErrorResponseData {
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
    return "http://localhost:5051/api";
  }
  // En producción, usar la ruta relativa
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 30000, // Aumentar timeout a 30 segundos para conexiones lentas
});

// Token manager para autenticación
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly TOKEN_EXPIRY_KEY = "token_expiry";

  static setTokens(
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await axios.post(
        `${getBaseURL()}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      const { accessToken, expiresIn } = response.data;
      this.setTokens(accessToken, undefined, expiresIn);
      return accessToken;
    } catch (error) {
      console.error("Error refrescando token:", error);
      this.clearTokens();
      return null;
    }
  }
}

// Interceptor de request - agregar token de autenticación
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Debug logging
    console.info(
      `🔌 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    // Agregar token de autenticación
    const accessToken = TokenManager.getAccessToken();
    console.info(`🔑 Access token present: ${!!accessToken}`);

    if (accessToken && !TokenManager.isTokenExpired()) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      console.info(`✅ Authorization header set with token`);
    } else if (accessToken && TokenManager.isTokenExpired()) {
      console.info(`⏰ Token expired, attempting refresh...`);
      // Intentar renovar el token
      const newToken = await TokenManager.refreshAccessToken();
      if (newToken) {
        config.headers.set("Authorization", `Bearer ${newToken}`);
        console.info(`✅ Authorization header set with new token`);
      } else {
        console.info(`❌ Failed to refresh token`);
      }
    } else {
      console.info(`ℹ️ No valid token available`);
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Extender AxiosError para incluir nuestras propiedades personalizadas
interface CustomAxiosError extends AxiosError {
  customMessage?: string;
}

// Extender AxiosRequestConfig para nuestras propiedades personalizadas
interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _redirected?: boolean;
  _retryCount?: number;
}

// Interceptor de response - manejar errores y renovación automática de tokens
api.interceptors.response.use(
  (response) => {
    console.info(
      `✅ API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error: AxiosError<ErrorResponseData>) => {
    const originalRequest = error.config as CustomRequestConfig;
    console.info(
      `❌ API Error: ${
        error.response?.status
      } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`
    );
    console.info(`Error details:`, error.response?.data);

    // Manejar reintentos para errores de red/servidor antes que otros errores
    if (!originalRequest._retry && originalRequest) {
      const retryCount = originalRequest._retryCount || 0;
      const shouldRetry =
        (error.code === "ECONNREFUSED" ||
          error.code === "NETWORK_ERROR" ||
          error.message?.includes("timeout") ||
          (error.response?.status && error.response.status >= 500)) &&
        retryCount < 2;

      if (shouldRetry) {
        originalRequest._retryCount = retryCount + 1;
        originalRequest._retry = true;

        console.info(
          `🔄 Reintentando petición (${retryCount + 1}/3) para ${
            originalRequest.url
          }...`
        );

        // Esperar antes del reintento (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount))
        );

        // Reiniciar _retry para el siguiente intento
        originalRequest._retry = false;

        return api(originalRequest);
      }
    }

    // Manejar error 401 - token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.info(`🔄 Handling 401 error - attempting token refresh`);
      originalRequest._retry = true;

      const newToken = await TokenManager.refreshAccessToken();
      if (newToken && originalRequest.headers) {
        console.info(`✅ Token refreshed successfully, retrying request`);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } else {
        console.info(`❌ Token refresh failed, redirecting to login`);
        // Si no se puede renovar, limpiar tokens y redirigir al login
        TokenManager.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    // Manejar modo offline
    if (!navigator.onLine && !originalRequest._retry) {
      try {
        await saveRequest({
          url: originalRequest.url || "",
          method: originalRequest.method || "get",
          data: originalRequest.data,
          headers: originalRequest.headers
            ? Object.fromEntries(
                Object.entries(originalRequest.headers).map(([key, value]) => [
                  key,
                  String(value),
                ])
              )
            : undefined,
          timestamp: new Date().toISOString(),
        });

        const customError = error as CustomAxiosError;
        customError.customMessage =
          "Sin conexión. La solicitud se guardó para enviar cuando haya conexión.";
        return Promise.reject(customError);
      } catch (saveError) {
        console.error("Error guardando solicitud offline:", saveError);
      }
    }

    // Manejar errores de conexión
    if (error.code === "ECONNREFUSED") {
      const customError = error as CustomAxiosError;
      customError.customMessage =
        "No se puede conectar al servidor. Verifica que el backend esté ejecutándose.";
      return Promise.reject(customError);
    }

    // Manejar rate limiting
    if (error.response?.status === 429) {
      const waitMinutes = error.response.data?.waitMinutes || 1;
      const customError = error as CustomAxiosError;
      customError.customMessage = `Demasiadas solicitudes. Intenta de nuevo en ${waitMinutes} minuto(s).`;
      return Promise.reject(customError);
    }

    // Manejar errores CSRF
    if (error.response?.status === 403) {
      const errorData = error.response.data;
      if (errorData?.error?.includes("CSRF")) {
        const customError = error as CustomAxiosError;
        customError.customMessage =
          "Error de seguridad. Por favor, recarga la página e intenta de nuevo.";
        return Promise.reject(customError);
      }
    }

    // Manejar errores del servidor
    if (error.response?.status && error.response.status >= 500) {
      const customError = error as CustomAxiosError;
      customError.customMessage =
        "Error del servidor. Por favor, intenta más tarde.";
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

// Exportar TokenManager para uso en otros módulos
export { TokenManager };

export default api;
