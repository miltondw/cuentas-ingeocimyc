import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Container, Box, Snackbar, Alert } from "@mui/material";
import Navigation from "@/components/layout/Navigation";
import { PageLoadingFallback } from "@/components/ui/PageLoadingFallback";

// Tipos para eventos personalizados
interface AppNotificationDetail {
  message: string;
  severity?: "success" | "info" | "warning" | "error";
}

interface AppNotificationEvent extends CustomEvent {
  detail: AppNotificationDetail;
}

declare global {
  interface WindowEventMap {
    "app:notification": AppNotificationEvent;
    "app:loading:start": CustomEvent;
    "app:loading:end": CustomEvent;
  }
}

/**
 * Layout principal de la aplicación
 * Incluye la navegación y estructura común para todas las páginas autenticadas
 */
const MainLayout = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
    autoHideDuration: number;
  }>({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 6000,
  });

  // Ejemplo de escucha de eventos de notificación
  useEffect(() => {
    // Manejar eventos personalizados de notificación
    const handleCustomEvent = (event: AppNotificationEvent) => {
      const { message, severity } = event.detail;

      if (message) {
        setNotification({
          open: true,
          message,
          severity: severity || "info",
          autoHideDuration: severity === "error" ? 8000 : 6000, // Errores duran más tiempo
        });
      }
    };

    // Funciones para eventos de carga
    const handleLoadingStart = () => setIsLoading(true);
    const handleLoadingEnd = () => setIsLoading(false);

    // Registrar eventos personalizados
    window.addEventListener("app:notification", handleCustomEvent);
    window.addEventListener("app:loading:start", handleLoadingStart);
    window.addEventListener("app:loading:end", handleLoadingEnd);

    return () => {
      window.removeEventListener("app:notification", handleCustomEvent);
      window.removeEventListener("app:loading:start", handleLoadingStart);
      window.removeEventListener("app:loading:end", handleLoadingEnd);
    };
  }, []);

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navigation />

      <Container
        maxWidth="xl"
        sx={{
          mb: 4,
          flexGrow: 1,
          position: "relative",
        }}
      >
        {isLoading && <PageLoadingFallback />}
        <Outlet />{" "}
        <Snackbar
          open={notification.open}
          autoHideDuration={notification.autoHideDuration}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
              width: "100%",
              boxShadow: 2,
              borderRadius: 1,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainLayout;
