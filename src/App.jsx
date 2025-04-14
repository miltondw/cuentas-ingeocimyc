import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/atoms/Navigation";
import { AuthProvider, useAuth } from "./api/AuthContext";
import Login from "./api/Login";
import Logout from "./api/Logout";
import GastosProject from "./components/cuentas/tablas/gasto-project";
import TablaGastosEmpresa from "./components/cuentas/tablas/gasto-mes";
import FormCreateMonth from "./components/cuentas/forms/form-create-month";
import FormCreateProject from "./components/cuentas/forms/form-create-project";
import TablaUtilidades from "./components/cuentas/tablas/TablaUtilidades";
import PrivateRoute from "./api/PrivateRoute";
import PerfilesDeSuelo from "./components/lab/components/PerfilDeSuelos";
import ProjectProfiles from "./components/lab/pages/ProjectProfiles";
import { Suspense } from "react";
import { CircularProgress, Box, Typography, Container, Alert, Button } from "@mui/material";
import ProjectsProfiles from "./components/lab/pages/ProjectsProfiles";

// Página de no autorizado (opcional, para cuando un usuario no tiene el rol requerido)
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

// Componente que redirecciona a /proyectos o /login según estado de autenticación
const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Navigate to="/proyectos" /> : <Navigate to="/login" />;
};

// Wrapper con el proveedor de autenticación
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

// Componente principal con rutas
const AppRoutes = () => {
  return (
    <Router>
      <Navigation />
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }>
        <Routes>
          {/* Ruta raíz con redirección inteligente */}
          <Route path="/" element={<RootRedirect />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas para laboratorio y perfiles */}
          <Route
            path="/proyectos-perfiles"
            element={
              <PrivateRoute>
                <ProjectsProfiles />
              </PrivateRoute>
            }
          />
          <Route
            path="/proyectos/:projectId/perfiles"
            element={
              <PrivateRoute>
                <ProjectProfiles />
              </PrivateRoute>
            }
          />
          <Route
            path="/proyectos/:projectId/perfil/:profileId"
            element={
              <PrivateRoute>
                <PerfilesDeSuelo />
              </PrivateRoute>
            }
          />
          <Route
            path="/proyectos/:projectId/perfil/nuevo"
            element={
              <PrivateRoute>
                <PerfilesDeSuelo />
              </PrivateRoute>
            }
          />

          {/* Rutas para creación y actualización de proyectos */}
          <Route
            path="/crear-proyecto"
            element={
              <PrivateRoute>
                <FormCreateProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/crear-proyecto/:id"
            element={
              <PrivateRoute>
                <FormCreateProject />
              </PrivateRoute>
            }
          />

          {/* Rutas para creación y actualización de gastos mensuales */}
          <Route
            path="/crear-gasto-mes"
            element={
              <PrivateRoute>
                <FormCreateMonth />
              </PrivateRoute>
            }
          />
          <Route
            path="/crear-gasto-mes/:id"
            element={
              <PrivateRoute>
                <FormCreateMonth />
              </PrivateRoute>
            }
          />

          {/* Rutas para visualización de Tablas */}
          <Route
            path="/proyectos"
            element={
              <PrivateRoute>
                <GastosProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/gastos"
            element={
              <PrivateRoute>
                <TablaGastosEmpresa />
              </PrivateRoute>
            }
          />
          <Route
            path="/utilidades"
            element={
              <PrivateRoute requiredRole="admin">
                <TablaUtilidades />
              </PrivateRoute>
            }
          />

          {/* Ruta de fallback para páginas no encontradas */}
          <Route path="*" element={
            <Container maxWidth="sm" sx={{ mt: 4 }}>
              <Alert severity="warning">
                <Typography variant="h6">Página no encontrada</Typography>
                <Typography variant="body1">
                  La página solicitada no existe.
                </Typography>
              </Alert>
            </Container>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return <AppWithAuth />;
}

export default App;