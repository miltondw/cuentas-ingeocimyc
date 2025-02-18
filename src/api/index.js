import axios from "axios";

const api = axios.create({
  baseURL: "https://api-cuentas-zlut.onrender.com/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Importante para enviar/recibir cookies
});

// Ya no añadimos el token manualmente, ya que éste se envía en una cookie httpOnly

// Response interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Aquí puedes redirigir al login o mostrar un mensaje
      // No es necesario borrar el token de localStorage, pues ya no se usa
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
