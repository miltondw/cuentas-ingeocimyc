import { lazy } from "react";
import { Route } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
const MainLayout = lazy(() => import("@/components/layout/MainLayout"));
const PrivateRoute = lazy(() => import("./PrivateRoute"));
const GastosProjectPage = lazy(
  () => import("@/features/financial/components/TablaGastosProject")
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
const AdminDashboardPage = lazy(
  () => import("@/features/admin/pages/AdminDashboardPage")
);
const CategoriesManagementPage = lazy(
  () => import("@/features/admin/pages/CategoriesManagementPage")
);
const ServicesManagementPage = lazy(
  () => import("@/features/admin/pages/ServicesManagementPage")
);
const ServiceFormPage = lazy(
  () => import("@/features/admin/pages/ServiceFormPage")
);
const ServiceRequestsManagementPage = lazy(
  () => import("@/features/admin/pages/ServiceRequestsManagementPage")
);
const ServiceDetailPage = lazy(
  () => import("@/features/admin/pages/ServiceDetailPage")
);
const ServiceRequestEditPage = lazy(
  () => import("@/features/admin/pages/ServiceRequestDetailPage")
);

function AdminRoutes() {
  return (
    <>
      <Route element={<PrivateRoute requiredRoles={["admin"]} />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.ADMIN.PROJECTS} element={<GastosProjectPage />} />
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
          <Route
            path={ROUTES.ADMIN.DASHBOARD}
            element={<AdminDashboardPage />}
          />
          <Route
            path={ROUTES.ADMIN.CATEGORIES}
            element={<CategoriesManagementPage />}
          />
          <Route
            path={ROUTES.ADMIN.SERVICES}
            element={<ServicesManagementPage />}
          />
          <Route
            path={ROUTES.ADMIN.SERVICE_NEW}
            element={<ServiceFormPage />}
          />
          <Route
            path={ROUTES.ADMIN.SERVICE_EDIT}
            element={<ServiceFormPage />}
          />
          <Route
            path={ROUTES.ADMIN.SERVICE_REQUESTS}
            element={<ServiceRequestsManagementPage />}
          />
          <Route
            path={ROUTES.ADMIN.SERVICE_DETAIL}
            element={<ServiceDetailPage />}
          />
          <Route
            path={ROUTES.ADMIN.SERVICE_REQUEST_EDIT}
            element={<ServiceRequestEditPage />}
          />
        </Route>
      </Route>
    </>
  );
}

export default AdminRoutes;
