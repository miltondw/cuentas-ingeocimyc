// PrivateRoute.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import api from "./index.js";

const PrivateRoute = ({ children, requiredRole }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    userRole: null,
    error: null
  });

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.get("/auth/verify");
        const userRole = response.data.user.rol;

        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          userRole,
          error: null
        });
      } catch (error) {
        console.error("Error de verificación:", error);
        // Limpiamos localStorage por si acaso
        localStorage.removeItem("userData");

        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          error: error.response?.data?.message || "Error de autenticación"
        });
      }
    };

    verifyAuth();
  }, []);

  // Pantalla de carga mientras verifica
  if (authState.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Verificando autenticación...</Typography>
      </Box>
    );
  }

  // Redireccionar si no está autenticado
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Verificar rol si es necesario
  if (requiredRole && authState.userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  // Usuario autenticado y con rol adecuado
  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

export default PrivateRoute;