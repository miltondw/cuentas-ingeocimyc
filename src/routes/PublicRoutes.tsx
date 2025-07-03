import { Route } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
import AuthLayout from "@/components/layout/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import LogoutPage from "@/features/auth/pages/LogoutPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import UnauthorizedPage from "@/components/common/UnauthorizedPage";
import ClientRequestFormPage from "@/features/client/pages/ClientRequestFormPage";

function PublicRoutes() {
  return (
    <>
      {/* Rutas públicas - Autenticación */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      </Route>
      {/* Ruta pública - Formulario de cliente */}
      <Route
        path={ROUTES.CLIENT.SOLICITUD}
        element={<ClientRequestFormPage />}
      />
    </>
  );
}

export default PublicRoutes;
