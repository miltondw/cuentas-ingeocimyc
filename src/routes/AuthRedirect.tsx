import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/utils/routes";

/**
 * Redirecciona al usuario dependiendo de su rol
 * - Usuarios no autenticados: login
 * - Administradores: dashboard admin
 * - Usuarios de laboratorio: dashboard laboratorio
 * - Usuarios cliente: home de cliente
 */
const AuthRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role === "admin")
    return <Navigate to={ROUTES.ADMIN.PROJECTS} replace />;
  if (user.role === "lab") return <Navigate to={ROUTES.LAB.PROJECTS} replace />;
  if (user.role === "client")
    return <Navigate to={ROUTES.CLIENT.REQUEST_ME} replace />;
  // fallback
  return <Navigate to={ROUTES.LOGIN} replace />;
};

export default AuthRedirect;
