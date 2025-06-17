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
    return "https://api-cuentas-zlut.onrender.com/api";
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
  timeout: 15000, // Timeout de 15 segundos
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
    console.log(
      `🔌 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );

    // Agregar token de autenticación
    const accessToken = TokenManager.getAccessToken();
    console.log(`🔑 Access token present: ${!!accessToken}`);

    if (accessToken && !TokenManager.isTokenExpired()) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      console.log(`✅ Authorization header set with token`);
    } else if (accessToken && TokenManager.isTokenExpired()) {
      console.log(`⏰ Token expired, attempting refresh...`);
      // Intentar renovar el token
      const newToken = await TokenManager.refreshAccessToken();
      if (newToken) {
        config.headers.set("Authorization", `Bearer ${newToken}`);
        console.log(`✅ Authorization header set with new token`);
      } else {
        console.log(`❌ Failed to refresh token`);
      }
    } else {
      console.log(`ℹ️ No valid token available`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Extender AxiosError para incluir nuestras propiedades personalizadas
interface CustomAxiosError extends AxiosError {
  customMessage?: string;
}

// Extender AxiosRequestConfig para nuestras propiedades personalizadas
interface CustomRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _redirected?: boolean;
}

// Interceptor de response - manejar errores y renovación automática de tokens
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error: AxiosError<ErrorResponseData>) => {
    const originalRequest = error.config as CustomRequestConfig;
    console.log(
      `❌ API Error: ${
        error.response?.status
      } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`
    );
    console.log(`Error details:`, error.response?.data);

    // Manejar error 401 - token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log(`🔄 Handling 401 error - attempting token refresh`);
      originalRequest._retry = true;

      const newToken = await TokenManager.refreshAccessToken();
      if (newToken && originalRequest.headers) {
        console.log(`✅ Token refreshed successfully, retrying request`);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api.request(originalRequest);
      } else {
        console.log(`❌ Token refresh failed, redirecting to login`);
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
