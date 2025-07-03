import { lazy } from "react";
import { Route } from "react-router-dom";
const NotFoundPage = lazy(() => import("@/components/common/NotFoundPage"));

function FallbackRoutes() {
  return <Route path="*" element={<NotFoundPage />} />;
}

export default FallbackRoutes;
