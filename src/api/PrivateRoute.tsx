import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import api from "@api/index";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  error: string | null;
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    userRole: null,
    error: null,
  });

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!navigator.onLine) {
          const userData = JSON.parse(
            localStorage.getItem("userData") || "null"
          );
          if (userData?.rol) {
            setAuthState({
              isLoading: false,
              isAuthenticated: true,
              userRole: userData.rol,
              error: null,
            });
            return;
          }
          throw new Error("No user data available offline");
        }

        const response = await api.get<{ user: { rol: string } }>(
          "/auth/verify"
        );
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          userRole: response.data.user.rol,
          error: null,
        });
      } catch (error: unknown) {
        console.error("Verification error:", error);
        localStorage.removeItem("userData");
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          userRole: null,
          error:
            error instanceof Error
              ? error.message
              : typeof error === "object" &&
                error !== null &&
                "response" in error
              ? (error as { response?: { data?: { message?: string } } })
                  .response?.data?.message || "Authentication error"
              : "Authentication error",
        });
      }
    };

    verifyAuth();
  }, []);

  if (authState.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && authState.userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
