// api.js
import axios from "axios";

const url_remota = "https://api-cuentas-zlut.onrender.com/api";
const api = axios.create({
  baseURL: url_remota,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Para enviar y recibir cookies
});

// Agregar un interceptor para manejar tokens CSRF
api.interceptors.request.use(
  async (config) => {
    // Solo agregar el token CSRF para métodos que modifican datos
    if (['post', 'put', 'delete'].includes(config.method)) {
      // Obtener el token CSRF del header si existe
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
      
      if (csrfToken) {
        // Agregar el token al header para validación CSRF
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Manejar errores 401 (No autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        if (refreshResponse.status === 200) {
          // El backend ya actualizó la cookie accessToken
          return api(originalRequest); // Reintenta la petición original
        }
      } catch (refreshError) {
        console.error(
          "Error al refrescar el token:",
          refreshError.response?.data || refreshError.message
        );
        // Limpiar datos de usuario y redirigir al login
        localStorage.removeItem("userData");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    // Manejar errores 429 (Demasiadas peticiones - cuenta bloqueada)
    if (error.response?.status === 429) {
      // Muestra información sobre bloqueo temporal de cuenta
      const waitMinutes = error.response.data.waitMinutes || 15;
      error.customMessage = `Cuenta temporalmente bloqueada. Intente nuevamente en ${waitMinutes} minutos.`;
    }
    
    // Manejar errores 403 (Prohibido - CSRF)
    if (error.response?.status === 403 && error.response.data.error?.includes('CSRF')) {
      // Podría ser un problema de token CSRF, intentar recargar la página
      error.customMessage = "Error de seguridad. Por favor recargue la página e intente nuevamente.";
    }

    return Promise.reject(error);
  }
);

export default api;