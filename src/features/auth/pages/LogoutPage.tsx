import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Página de cierre de sesión
 * Cierra automáticamente la sesión del usuario y redirige a la página de inicio de sesión
 */
const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Error during logout:", error);
        // Incluso en caso de error, redirigimos al usuario a login
        navigate("/login", { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Cerrando sesión...
      </Typography>
    </Box>
  );
};

export default LogoutPage;
