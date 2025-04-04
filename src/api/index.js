// api.js
import axios from "axios";

const url_remota = "https://api-cuentas-zlut.onrender.com/api";
const api = axios.create({
  baseURL: url_remota,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Para enviar y recibir cookies
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        if (refreshResponse.status === 200) {
          // El backend ya actualizó la cookie accessToken, no necesitas hacer nada más
          return api(originalRequest); // Reintenta la petición original
        }
      } catch (refreshError) {
        console.error(
          "Error al refrescar el token:",
          refreshError.response?.data || refreshError.message
        );
        localStorage.removeItem("userData");
        window.location.href = "/login"; // Redirige al login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
