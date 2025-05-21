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
}

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const getCsrfToken = async (): Promise<string | undefined> => {
  try {
    const response = await axios.get<{ csrfToken: string }>("/api/auth/csrf", {
      withCredentials: true,
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    return undefined;
  }
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (
      ["post", "put", "delete"].includes(config.method?.toLowerCase() || "")
    ) {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];
      if (!csrfToken) {
        const newCsrfToken = await getCsrfToken();
        if (newCsrfToken) {
          config.headers.set("X-CSRF-Token", newCsrfToken);
        }
      } else {
        config.headers.set("X-CSRF-Token", csrfToken);
      }
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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;
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
        return Promise.reject({
          ...error,
          customMessage:
            "No internet connection. Request queued for sync when online.",
        } as CustomAxiosError);
      } catch (storageError) {
        console.error("Failed to save request:", storageError);
      }
    }

    if (error.code === "ECONNREFUSED") {
      return Promise.reject({
        ...error,
        customMessage:
          "Cannot connect to the server. Please ensure the backend is running and try again.",
      } as CustomAxiosError);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh");
        if (refreshResponse.status === 200) {
          return api(originalRequest);
        }
      } catch (refreshError: unknown) {
        const typedError = refreshError as AxiosError;
        console.error(
          "Failed to refresh token:",
          typedError.response?.data || typedError.message
        );
        if (!originalRequest._redirected) {
          originalRequest._redirected = true;
          localStorage.removeItem("userData");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 429) {
      const errorData = error.response.data as ErrorResponseData;
      const waitMinutes = errorData?.waitMinutes || 15;
      return Promise.reject({
        ...error,
        customMessage: `Account temporarily blocked. Try again in ${waitMinutes} minutes.`,
      } as CustomAxiosError);
    }

    if (error.response?.status === 403) {
      const errorData = error.response.data as ErrorResponseData;
      if (errorData?.error?.includes("CSRF")) {
        return Promise.reject({
          ...error,
          customMessage:
            "Security error. Please reload the page and try again.",
        } as CustomAxiosError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
