/* eslint-disable react/prop-types */
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./api/AuthContext";
import { CircularProgress, Box, Typography, Container, Alert, Button } from "@mui/material";
import Navigation from "./components/atoms/Navigation";
import ProjectApiques from "./components/lab/pages/ProjectApiques";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
// Componentes de carga perezosa
const Login = lazy(() => import("./api/Login"));
const Logout = lazy(() => import("./api/Logout"));
const GastosProject = lazy(() => import("./components/cuentas/tablas/gasto-project"));
const TablaGastosEmpresa = lazy(() => import("./components/cuentas/tablas/gasto-mes"));
const FormCreateMonth = lazy(() => import("./components/cuentas/forms/form-create-month"));
const FormCreateProject = lazy(() => import("./components/cuentas/forms/form-create-project"));
const TablaUtilidades = lazy(() => import("./components/cuentas/tablas/TablaUtilidades"));
const PerfilesDeSuelo = lazy(() => import("./components/lab/components/PerfilDeSuelos"));
const ProjectProfiles = lazy(() => import("./components/lab/pages/ProjectProfiles"));
const ProjectsDashboard = lazy(() => import("./components/lab/pages/ProjectsDashboard"));
const ApiquesDeSuelos = lazy(() => import("./components/lab/components/ApiquesDeSuelos"));

// Componentes comunes
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
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
const PrivateRouteWrapper = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingFallback />;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) return <Unauthorized />;

  return children || <Outlet />;
};

// Gestión de rutas de autenticación
const AuthRedirect = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/proyectos" replace /> : <Navigate to="/login" replace />;
};

// Configuración principal de rutas
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<AuthRedirect />} />

    {/* Rutas públicas */}
    <Route path="/login" element={<Login />} />
    <Route path="/logout" element={<Logout />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Rutas protegidas */}
    <Route element={<PrivateRouteWrapper><MainLayout /></PrivateRouteWrapper>}>
      {/* Gestión principal */}
      <Route path="/proyectos" element={<GastosProject />} />
      <Route path="/gastos" element={<TablaGastosEmpresa />} />

      {/* CRUD Proyectos */}
      <Route path="/crear-proyecto" element={<FormCreateProject />} />
      <Route path="/crear-proyecto/:id" element={<FormCreateProject />} />

      {/* CRUD Gastos */}
      <Route path="/crear-gasto-mes" element={<FormCreateMonth />} />
      <Route path="/crear-gasto-mes/:id" element={<FormCreateMonth />} />

      {/* Administración */}
      <Route path="/utilidades" element={<PrivateRouteWrapper requiredRole="admin"><TablaUtilidades /></PrivateRouteWrapper>} />

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
const App = () => (
  <ThemeProvider theme={theme}>
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <AppRoutes />
        </Suspense>
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;