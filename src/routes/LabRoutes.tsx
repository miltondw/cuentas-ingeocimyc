import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
const PrivateRoute = lazy(() => import("./PrivateRoute"));
const ProjectsDashboard = lazy(
  () => import("@/features/lab/pages/ProjectsDashboard")
);
const ProjectProfiles = lazy(
  () => import("@/features/lab/pages/services/PerfilesPage/ProjectProfiles")
);
const ProjectApiques = lazy(
  () => import("@/features/lab/pages/services/ApiquesPage/ProjectApiques")
);
const PerfilDetallesPage = lazy(
  () => import("@/features/lab/pages/services/PerfilesPage/PerfilDetallesPage")
);
const ApiqueDetallesPage = lazy(
  () => import("@/features/lab/pages/services/ApiquesPage/ApiqueDeatil")
);

const LabRoutes = () => {
  return (
    <>
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
    </>
  );
};

export default LabRoutes;
