import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PageLoadingFallback } from "@/components/ui/PageLoadingFallback";
import { ROUTES } from "@/utils/routes";
import type { UserRole } from "@/types/api";

// Layout principal
const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
const AuthLayout = lazy(() => import("@/components/layout/AuthLayout"));
const _CardLayout = lazy(() => import("@/components/layout/CardLayout"));

// Componente de carga
const LoadingFallback = () => {
  return <PageLoadingFallback message="Cargando página..." />;
};

// Componentes de autenticación
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const LogoutPage = lazy(() => import("@/features/auth/pages/LogoutPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/features/auth/pages/ProfilePage"));

// Páginas comunes
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));
const UnauthorizedPage = lazy(
  () => import("@/components/common/UnauthorizedPage")
);

// Páginas de cliente
const ClientRequestFormPage = lazy(
  () => import("@/features/client/pages/ClientRequestFormPage")
);

// Páginas de laboratorio
const ProjectsDashboard = lazy(
  () => import("@/features/lab/pages/ProjectsDashboard")
);
const ProjectProfiles = lazy(
  () => import("@/features/lab/pages/ProjectProfiles")
);
const ProjectApiques = lazy(
  () => import("@/features/lab/pages/ProjectApiques")
);
const PerfilDetallesPage = lazy(
  () => import("@/features/lab/pages/PerfilDetallesPage")
);
const ApiqueDetallesPage = lazy(
  () => import("@/features/lab/pages/ApiqueDetallesPage")
);

// Páginas financieras/admin
const GastosProjectPage = lazy(
  () => import("@/features/projects/components/TablaGastosProject")
);
const GastosMensualesPage = lazy(
  () => import("@/features/financial/pages/GastosMensualesPage")
);
const CreateProjectPage = lazy(
  () => import("@/features/financial/pages/CreateProjectPage")
);
const CreateMonthExpensePage = lazy(
  () => import("@/features/financial/pages/CreateMonthExpensePage")
);
const TablaUtilidadesPage = lazy(
  () => import("@/features/financial/pages/TablaUtilidadesPage")
);

// Tipos para rutas protegidas
type PrivateRouteProps = {
  requiredRoles?: UserRole[];
};

/**
 * Componente que protege rutas requiriendo autenticación
 * y opcionalmente validando el rol del usuario
 *
 * @param requiredRoles - Roles permitidos para acceder a la ruta
 */
const PrivateRoute = ({ requiredRoles }: PrivateRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

// Constantes definidas en utils/routes.ts

/**
 * Componente que redirecciona al usuario dependiendo de su rol
 * - Usuarios no autenticados: página de login
 * - Administradores: dashboard de proyectos/finanzas
 * - Usuarios de laboratorio: dashboard de proyectos de laboratorio
 */
const AuthRedirect = () => {
  const { user } = useAuth();
  return user ? (
    <Navigate
      to={user.role === "admin" ? ROUTES.ADMIN.PROJECTS : ROUTES.LAB.PROJECTS}
      replace
    />
  ) : (
    <Navigate to={ROUTES.LOGIN} replace />
  );
};

// Para tipos y utilidades de rutas, ver utils/routes.ts

/**
 * Componente principal que define todas las rutas de la aplicación
 *
 * Organizado por secciones:
 * 1. Rutas públicas (autenticación y formularios de cliente)
 * 2. Rutas protegidas compartidas (perfil de usuario)
 * 3. Rutas protegidas para administradores (finanzas y administración)
 * 4. Rutas protegidas para laboratorio (seguimiento de perfiles y apiques)
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path={ROUTES.HOME} element={<AuthRedirect />} />
        {/* Rutas públicas - Autenticación */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        </Route>
        {/* Ruta pública - Formulario de cliente */}
        <Route path={ROUTES.CLIENT} element={<ClientRequestFormPage />} />
        {/* Rutas protegidas - Compartidas para todos los usuarios autenticados */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>
        </Route>
        {/* Rutas protegidas - Admin */}
        <Route element={<PrivateRoute requiredRoles={["admin"]} />}>
          <Route element={<MainLayout />}>
            <Route
              path={ROUTES.ADMIN.PROJECTS}
              element={<GastosProjectPage />}
            />
            <Route
              path={ROUTES.ADMIN.EXPENSES}
              element={<GastosMensualesPage />}
            />
            <Route
              path={ROUTES.ADMIN.CREATE_PROJECT}
              element={<CreateProjectPage />}
            />
            <Route
              path={ROUTES.ADMIN.CREATE_PROJECT_EDIT}
              element={<CreateProjectPage />}
            />
            <Route
              path={ROUTES.ADMIN.CREATE_MONTH_EXPENSE}
              element={<CreateMonthExpensePage />}
            />
            <Route
              path={ROUTES.ADMIN.CREATE_MONTH_EXPENSE_EDIT}
              element={<CreateMonthExpensePage />}
            />
            <Route
              path={ROUTES.ADMIN.UTILITIES}
              element={<TablaUtilidadesPage />}
            />
          </Route>{" "}
        </Route>

        {/* Rutas protegidas - Laboratorio */}
        <Route element={<PrivateRoute requiredRoles={["admin", "lab"]} />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.LAB.PROJECTS}>
              <Route index element={<ProjectsDashboard />} />
              <Route path=":projectId">
                <Route index element={<Navigate to="perfiles" replace />} />
                <Route path="perfiles" element={<ProjectProfiles />} />
                <Route path="perfil">
                  <Route path=":profileId" element={<PerfilDetallesPage />} />
                  <Route path="nuevo" element={<PerfilDetallesPage />} />
                </Route>
                <Route path="apiques" element={<ProjectApiques />} />
                <Route path="apique">
                  <Route path=":apiqueId" element={<ApiqueDetallesPage />} />
                  <Route path="nuevo" element={<ApiqueDetallesPage />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
        {/* Ruta de fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
