import axios from "axios";
const url_local="https://localhost:5050/api"
const url_remota= "https://api-cuentas-zlut.onrender.com/api"
const api = axios.create({
  baseURL:url_remota,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Importante para enviar/recibir cookies
  credentials: "include",
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
