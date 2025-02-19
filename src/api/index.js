import axios from "axios";

const api = axios.create({
  baseURL: "https://api-cuentas-zlut.onrender.com/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Importante para enviar/recibir cookies
});

// Ya no añadimos el token manualmente, ya que éste se envía en una cookie httpOnly

// Response interceptor para manejar errores 401
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await api.post("/auth/refresh"); // Intenta refrescar el token
        return api(originalRequest); // Reintenta la petición original
      } catch (refreshError) {
        localStorage.removeItem("userData");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);
export default api;
