import { BrowserRouter as Router } from "react-router-dom";
import { useState, useEffect } from "react";
import { Alert, Container, Button } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import theme from "./theme";
import AppRoutes from "./routes";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { syncPendingRequests } from "@/utils/sync";

// Tipos para PWA
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

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
  // Manejar instalación de PWA
  useEffect(() => {
    // Detectar si se está ejecutando en un navegador móvil
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Verificar si la PWA ya está instalada
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone ||
      document.referrer.startsWith("android-app://");

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Evitar el comportamiento predeterminado

      if (isMobile && !isInstalled) {
        setInstallPrompt(event as BeforeInstallPromptEvent); // Guardar el evento para usarlo más tarde
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);
  // Manejar clic en botón de instalación
  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();

      // Esperar a la respuesta del usuario
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.info("Usuario aceptó la instalación");
        } else {
          console.info("Usuario rechazó la instalación");
        }
        setInstallPrompt(null);
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            {" "}
            {/* Botón de instalación de PWA */}
            {installPrompt && (
              <Container maxWidth="sm" sx={{ mt: 2, textAlign: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleInstallClick}
                  sx={{ fontWeight: "bold" }}
                >
                  Instalar la aplicación
                </Button>
              </Container>
            )}
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
