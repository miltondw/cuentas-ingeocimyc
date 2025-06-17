import React from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuth } from "./useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'lab' | 'client';
  requiredRoles?: Array<'admin' | 'lab' | 'client'>;
}

const PrivateRoute = ({ children, requiredRole, requiredRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user, loading, hasRole, hasAnyRole } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="textSecondary">
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles si se especificaron
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h6" color="error">
          Acceso Denegado
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No tienes permisos para acceder a esta sección.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Rol requerido: {requiredRole}, tu rol: {user.role}
        </Typography>
      </Box>
    );
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h6" color="error">
          Acceso Denegado
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No tienes permisos para acceder a esta sección.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Roles requeridos: {requiredRoles.join(', ')}, tu rol: {user.role}
        </Typography>
      </Box>
    );
  }
  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default PrivateRoute;
