/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.avif" {
  const content: string;
  export default content;
}

declare module "*.ico" {
  const content: string;
  export default content;
}

declare module "*.bmp" {
  const content: string;
  export default content;
}

declare module "*.pdf" {
  const src: string;
  export default src;
}

// Archivos de datos
declare module "*.json" {
  const content: Record<string, unknown>;
  export default content;
}

declare module "*.csv" {
  const content: string;
  export default content;
}

declare module "*.yaml" {
  const content: Record<string, unknown>;
  export default content;
}

declare module "*.yml" {
  const content: Record<string, unknown>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: "development" | "production" | "staging";
  readonly VITE_AUTH_ENABLED: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_RETRY_COUNT: string;
  readonly VITE_CACHE_TTL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_ENABLE_MOCK_API: string;
  readonly VITE_ENABLE_PWA: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  // Variables específicas de ingeocimyc
  readonly VITE_INITIAL_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Tipos personalizados para la aplicación
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

type Nullable<T> = T | null;

type Optional<T> = T | undefined;

type ValueOf<T> = T[keyof T];

// Utilidades para React
type ReactChildren = {
  children?: import("react").ReactNode;
};

type WithClassName = {
  className?: string;
};

// Tipo para ayudar con el typesafety de las rutas
type AppRoutes =
  | "/"
  | "/login"
  | "/logout"
  | "/register"
  | "/unauthorized"
  | "/cliente"
  | "/profile"
  | "/proyectos"
  | "/gastos"
  | "/crear-proyecto"
  | "/crear-proyecto/:id"
  | "/crear-gasto-mes"
  | "/crear-gasto-mes/:id"
  | "/utilidades"
  | "/lab/proyectos"
  | "/lab/proyectos/:projectId"
  | "/lab/proyectos/:projectId/perfiles"
  | "/lab/proyectos/:projectId/perfil/:profileId"
  | "/lab/proyectos/:projectId/perfil/nuevo"
  | "/lab/proyectos/:projectId/apiques"
  | "/lab/proyectos/:projectId/apique/:apiqueId"
  | "/lab/proyectos/:projectId/apique/nuevo";

// Tipos para manejo de errores
type ApiError = {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
};

// Tipos para paginación
type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

// Tipos para filtros comunes
type DateRangeFilter = {
  startDate?: string;
  endDate?: string;
};

// Util para distinguir entre diferentes tipos de error
interface NetworkError extends Error {
  isNetworkError: true;
}

interface ValidationError extends Error {
  isValidationError: true;
  fields: Record<string, string[]>;
}

// Declaración para Window con propiedades personalizadas
declare interface Window {
  __INITIAL_DATA__?: unknown;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (...args: unknown[]) => unknown;
}
