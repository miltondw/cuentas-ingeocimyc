/* eslint-disable react/prop-types */
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./api/AuthContext";
import { CircularProgress, Box, Typography, Container, Alert, Button } from "@mui/material";
import Navigation from "./components/atoms/Navigation";
import ProjectApiques from "./components/lab/pages/ProjectApiques/ProjectApiques";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import ClientForm from "./components/client/components/ClientForm/ClientForm";
import { syncPendingRequests } from "./utils/sync";
import { ServiceRequestProvider } from "./components/client/components/ServiceRequestContext";
// Componentes de carga perezosa
const Login = lazy(() => import("./api/Login"));
const Logout = lazy(() => import("./api/Logout"));
const GastosProject = lazy(() => import("./components/cuentas/tablas/gasto-project"));
const TablaGastosEmpresa = lazy(() => import("./components/cuentas/tablas/gasto-mes"));
const FormCreateMonth = lazy(() => import("./components/cuentas/forms/CreateMonth"));
const FormCreateProject = lazy(() => import("./components/cuentas/forms/CreateProject"));
const TablaUtilidades = lazy(() => import("./components/cuentas/tablas/TablaUtilidades"));
const PerfilesDeSuelo = lazy(() => import("./components/lab/components/PerfilDeSuelos/PerfilDeSuelos"));
const ProjectProfiles = lazy(() => import("./components/lab/pages/ProjectProfiles"));
const ProjectsDashboard = lazy(() => import("./components/lab/pages/ProjectsDashboard"));
const ApiquesDeSuelos = lazy(() => import("./components/lab/components/ApiquesDeSuelos/ApiquesDeSuelos"));

// Componentes comunes
const LoadingFallback = () => (
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 2
  }}>
    <CircularProgress size={60} thickness={4} />
    <Typography variant="h6" color="textSecondary">
      Cargando módulos...
    </Typography>
  </Box>
);

const Unauthorized = () => (
  <Container maxWidth="sm" sx={{ mt: 4 }}>
    <Alert severity="error" sx={{ mb: 2 }}>
      <Typography variant="h6">Acceso denegado</Typography>
      <Typography variant="body1">
        No tiene permisos suficientes para acceder a esta sección.
      </Typography>
    </Alert>
    <Button variant="contained" onClick={() => window.history.back()}>
      Volver
    </Button>
  </Container>
);

const NotFound = () => (
  <Container maxWidth="sm" sx={{ mt: 4 }}>
    <Alert severity="warning">
      <Typography variant="h6">Página no encontrada</Typography>
      <Typography variant="body1">
        La página solicitada no existe.
      </Typography>
    </Alert>
  </Container>
);

// Layout principal
const MainLayout = () => (
  <>
    <Navigation />
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </Container>
  </>
);

// Componente de ruta privada mejorado
const PrivateRouteWrapper = ({ children, requiredRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRoles && !requiredRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children || <Outlet />;
};
// Gestión de rutas de autenticación
const AuthRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to={user.rol == "admin" ? "/proyectos" : "/lab/proyectos"} replace /> : <Navigate to="/login" replace />;
};

// Configuración principal de rutas
// Configuración principal de rutas
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<AuthRedirect />} />

    {/* Rutas públicas */}
    <Route path="/login" element={<Login />} />
    <Route path="/logout" element={<Logout />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="/cliente" element={
      <ServiceRequestProvider>
        <ClientForm />
      </ServiceRequestProvider>
    } />
    <Route
      path="/cliente"
      element={
        <ServiceRequestProvider>
          <ClientForm />
        </ServiceRequestProvider>
      }
    />

    {/* Rutas protegidas */}
    <Route element={<PrivateRouteWrapper><MainLayout /></PrivateRouteWrapper>}>

      {/* Ruta padre para admin */}
      <Route element={<PrivateRouteWrapper requiredRoles={["admin"]} />}>
        <Route path="/proyectos" element={<GastosProject />} />
        <Route path="/gastos" element={<TablaGastosEmpresa />} />
        <Route path="/crear-proyecto" element={<FormCreateProject />} />
        <Route path="/crear-proyecto/:id" element={<FormCreateProject />} />
        <Route path="/crear-gasto-mes" element={<FormCreateMonth />} />
        <Route path="/crear-gasto-mes/:id" element={<FormCreateMonth />} />
        <Route path="/utilidades" element={<TablaUtilidades />} />
      </Route>

      {/* Módulo de Laboratorio */}
      <Route path="/lab/proyectos">
        <Route index element={<ProjectsDashboard />} />
        <Route path=":projectId">
          <Route index element={<Navigate to="perfiles" replace />} />
          <Route path="perfiles" element={<ProjectProfiles />} />
          <Route path="perfil">
            <Route path=":profileId" element={<PerfilesDeSuelo />} />
            <Route path="nuevo" element={<PerfilesDeSuelo />} />
          </Route>
          <Route path="apiques" element={<ProjectApiques />} />
          <Route path="apique">
            <Route path=":apiqueId" element={<ApiquesDeSuelos />} />
            <Route path="nuevo" element={<ApiquesDeSuelos />} />
          </Route>
        </Route>
      </Route>
    </Route>

    {/* Ruta de fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

// Componente principal
const App = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => {
      syncPendingRequests();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  //Install app
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // Detectar si se está ejecutando en un navegador móvil
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Verificar si la PWA ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.startsWith('android-app://');

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault(); // Evitar el comportamiento predeterminado del navegador
      if (isMobile && !isInstalled) {
        setInstallPrompt(event); // Guardar el evento para usarlo más tarde
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt(); // Mostrar el diálogo de instalación
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó la instalación');
        } else {
          console.log('Usuario rechazó la instalación');
        }
        setInstallPrompt(null); // Limpiar el prompt después de la instalación
      });
    }
  };
  // App.jsx
  useEffect(() => {
    const mostrarActualizacion = () => {
      if (window.confirm('Hay una nueva versión disponible. ¿Quieres actualizar?')) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('updatefound', () => {
      const swActual = navigator.serviceWorker.controller;
      const swNuevo = navigator.serviceWorker.waiting;

      if (!swNuevo) return;

      swNuevo.addEventListener('statechange', () => {
        if (swNuevo.state === 'installed' && swActual) {
          mostrarActualizacion();
        }
      });
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/dev-dist/sw.js');
    }
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          {installPrompt && (
            <button onClick={handleInstallClick}>
              Instalar la aplicación
            </button>
          )}
          {isOffline && (
            <Alert severity="warning" sx={{ m: 2 }}>
              Estás sin conexión. Los datos se sincronizarán cuando tengas señal.
            </Alert>
          )}
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;