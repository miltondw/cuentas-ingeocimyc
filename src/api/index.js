// api.js
import axios from "axios";
import { saveRequest } from "../utils/offlineStorage";

//const url_remota = "https://api-cuentas-zlut.onrender.com/api";
//const url_remota = "http://localhost:5050/api";
const url_remota = "/api";
const api = axios.create({
  baseURL: url_remota,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Para enviar y recibir cookies
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!navigator.onLine && !originalRequest._retry) {
      try {
        await saveRequest({
          url: originalRequest.url,
          method: originalRequest.method,
          data: originalRequest.data,
          headers: originalRequest.headers,
          timestamp: new Date().toISOString(),
        });
        error.customMessage =
          "No hay conexión. La solicitud se sincronizará cuando haya señal.";
      } catch (storageError) {
        console.error("Error al guardar la solicitud:", storageError);
      }
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh");
        if (refreshResponse.status === 200) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error(
          "Error al refrescar el token:",
          refreshError.response?.data || refreshError.message
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
      const waitMinutes = error.response.data.waitMinutes || 15;
      error.customMessage = `Cuenta temporalmente bloqueada. Intente nuevamente en ${waitMinutes} minutos.`;
    }

    if (
      error.response?.status === 403 &&
      error.response.data.error?.includes("CSRF")
    ) {
      error.customMessage =
        "Error de seguridad. Por favor recargue la página e intente nuevamente.";
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  async (config) => {
    if (["post", "put", "delete"].includes(config.method)) {
      let csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];
      if (!csrfToken) {
        try {
          const csrfResponse = await api.get("/auth/csrf");
          csrfToken = csrfResponse.data.csrfToken;
        } catch (csrfError) {
          console.error("Error al obtener el CSRF token:", csrfError);
          throw new Error("No se pudo obtener el token CSRF");
        }
      }
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
