import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/utils/routes";
import type { UserRole } from "@/types/api";
import { PageLoadingFallback } from "@/components/ui/PageLoadingFallback";

// Componente que protege rutas requiriendo autenticación y opcionalmente validando el rol del usuario
export const PrivateRoute = ({
  requiredRoles,
}: {
  requiredRoles?: UserRole[];
}) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoadingFallback message="Cargando página..." />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
