import React, { lazy } from "react";

// Funciones de lazy loading con preloading mejorado
export const createLazyComponent = <
  T extends React.ComponentType<Record<string, unknown>>
>(
  importFn: () => Promise<{ default: T }>,
  preload = false
) => {
  const Component = lazy(importFn);

  if (preload && typeof window !== "undefined") {
    // Precargar el componente después de que la página esté cargada
    const timer = setTimeout(() => {
      importFn().catch(() => {
        // Silenciar errores de precarga
      });
      clearTimeout(timer);
    }, 100);
  }

  return Component;
};

// Lazy loading para páginas principales
export const LazyLogin = createLazyComponent(
  () => import("../api/Login"),
  true
);

export const LazyLogout = createLazyComponent(() => import("../api/Logout"));

// Lazy loading para componentes de cuentas
export const LazyGastosProject = createLazyComponent(
  () => import("../components/cuentas/tablas/gasto-project")
);

export const LazyTablaGastosEmpresa = createLazyComponent(
  () => import("../components/cuentas/tablas/gasto-mes")
);

export const LazyFormCreateMonth = createLazyComponent(
  () => import("../components/cuentas/forms/CreateMonth")
);

export const LazyFormCreateProject = createLazyComponent(
  () => import("../components/cuentas/forms/CreateProject")
);

export const LazyTablaUtilidades = createLazyComponent(
  () => import("../components/cuentas/tablas/TablaUtilidades")
);

// Lazy loading para componentes de laboratorio
export const LazyProjectsDashboard = createLazyComponent(
  () => import("../components/lab/pages/ProjectsDashboard"),
  true
);

export const LazyProjectProfiles = createLazyComponent(
  () => import("../components/lab/pages/ProjectProfiles")
);

export const LazyProjectApiques = createLazyComponent(
  () => import("../components/lab/pages/ProjectApiques")
);

export const LazyPerfilDeSuelos = createLazyComponent(
  () => import("../components/lab/components/PerfilDeSuelos/PerfilDeSuelos")
);

export const LazyApiquesDeSuelos = createLazyComponent(
  () => import("../components/lab/components/ApiquesDeSuelos/ApiquesDeSuelos")
);

// Lazy loading para componentes de cliente
export const LazyClientForm = createLazyComponent(
  () => import("../components/client/components/ClientForm/ClientForm")
);

// Funciones de preload bajo demanda
export const preloadComponents = {
  lab: () => {
    import("../components/lab/pages/ProjectsDashboard").catch(() => {});
    import("../components/lab/pages/ProjectProfiles").catch(() => {});
    import("../components/lab/pages/ProjectApiques").catch(() => {});
    import("../components/lab/components/PerfilDeSuelos/PerfilDeSuelos").catch(
      () => {}
    );
    import(
      "../components/lab/components/ApiquesDeSuelos/ApiquesDeSuelos"
    ).catch(() => {});
  },

  cuentas: () => {
    import("../components/cuentas/tablas/gasto-project").catch(() => {});
    import("../components/cuentas/tablas/gasto-mes").catch(() => {});
    import("../components/cuentas/tablas/TablaUtilidades").catch(() => {});
  },

  client: () => {
    import("../components/client/components/ClientForm/ClientForm").catch(
      () => {}
    );
  },
};

export default {
  LazyLogin,
  LazyLogout,
  LazyGastosProject,
  LazyTablaGastosEmpresa,
  LazyFormCreateMonth,
  LazyFormCreateProject,
  LazyTablaUtilidades,
  LazyProjectsDashboard,
  LazyProjectProfiles,
  LazyProjectApiques,
  LazyPerfilDeSuelos,
  LazyApiquesDeSuelos,
  LazyClientForm,
  preloadComponents,
};
