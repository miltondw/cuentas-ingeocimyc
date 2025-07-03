import { lazy } from "react";
import { Route } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
const PrivateRoute = lazy(() => import("./PrivateRoute"));
const ProfilePage = lazy(() => import("@/features/auth/pages/ProfilePage"));

function SharedRoutes() {
  return (
    <>
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
      </Route>
    </>
  );
}

export default SharedRoutes;
