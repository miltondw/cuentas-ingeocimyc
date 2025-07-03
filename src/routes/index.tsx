import { Route, Routes } from "react-router-dom";

import AuthRedirect from "./AuthRedirect";
import PublicRoutes from "./PublicRoutes";
import ClientRoutes from "./ClientRoutes";
import SharedRoutes from "./SharedRoutes";
import AdminRoutes from "./AdminRoutes";
import LabRoutes from "./LabRoutes";
import FallbackRoutes from "./FallbackRoutes";

import { ROUTES } from "@/utils/routes";

const AppRoutes = () => (
  <Routes>
    <Route path={ROUTES.HOME} element={<AuthRedirect />} />
    {PublicRoutes()}
    {ClientRoutes()}
    {SharedRoutes()}
    {AdminRoutes()}
    {LabRoutes()}
    {FallbackRoutes()}
  </Routes>
);

export default AppRoutes;
