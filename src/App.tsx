import { BrowserRouter as Router } from "react-router-dom";
import { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import theme from "./theme";
import AppRoutes from "./routes/index";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { syncPendingRequests } from "@/utils/sync";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { PWAInstallBanner } from "@/components/common/PWAInstallBanner";

// Crear el cliente de React Query con configuración óptima
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Usar el hook personalizado para PWA
  const { showBanner, isInstalling, install, dismiss, remindLater } =
    usePWAInstall({
      initialDelay: 2, // Mostrar después de 2 días
      reminderInterval: 7, // Recordar cada 7 días
      maxReminders: 3, // Máximo 3 recordatorios
      mobileOnly: true, // Solo en móviles
    });

  // Manejar estado online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncPendingRequests();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            {/* Banner de instalación de PWA más amigable */}
            <PWAInstallBanner
              show={showBanner}
              isInstalling={isInstalling}
              onInstall={install}
              onDismiss={dismiss}
              onRemindLater={remindLater}
              variant="detailed" // Puedes cambiar a 'minimal' o 'card'
              position="top"
            />

            {/* Alerta de offline */}
            {isOffline && (
              <Alert severity="warning" sx={{ m: 2 }}>
                Estás sin conexión. Los datos se sincronizarán cuando tengas
                señal.
              </Alert>
            )}

            <AppRoutes />
          </Router>
        </AuthProvider>

        {/* Herramientas de desarrollo para React Query (solo en desarrollo) */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
