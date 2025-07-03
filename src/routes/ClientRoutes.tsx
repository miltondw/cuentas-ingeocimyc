import { Route } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
import ClientHomePage from "@/features/client/pages/ClientHomePage";
import RequestMe from "@/features/client/pages/RequestMe";
import ClientRequestFormPage from "@/features/client/pages/ClientRequestFormPage";
import ClientServiceRequestDetailPage from "@/features/client/pages/ClientServiceRequestDetailPage";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "@/components/layout/MainLayout";

function ClientRoutes() {
  return (
    <>
      <Route element={<PrivateRoute requiredRoles={["client"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.CLIENT.HOME} element={<ClientHomePage />} />
          <Route path={ROUTES.CLIENT.REQUEST_ME} element={<RequestMe />} />
          <Route
            path={ROUTES.CLIENT.SOLICITUD}
            element={<ClientRequestFormPage />}
          />
          <Route
            path={ROUTES.CLIENT.EDIT_REQUEST}
            element={<ClientServiceRequestDetailPage />}
          />
        </Route>
      </Route>
    </>
  );
}

export default ClientRoutes;
