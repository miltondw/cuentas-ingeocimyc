/**
 * Constantes y utilidades para el enrutamiento de la aplicación
 * Centraliza las rutas para facilitar cambios y evitar hardcoding de strings
 *
 * Este archivo exporta:
 * - ROUTES: Constantes para todas las rutas de la aplicación
 * - RouteParams: Tipos para los parámetros de rutas
 * - buildUrl: Función para construir URLs con parámetros
 * - matchRoute: Función para comparar rutas con patrones
 * - extractParams: Función para extraer parámetros de una URL
 */

// Tipos para los parámetros de rutas
export type RouteParams = {
  projectId?: string;
  profileId?: string;
  apiqueId?: string;
  id?: string;
};

// Constantes para rutas
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  LOGOUT: "/logout",
  REGISTER: "/register",
  UNAUTHORIZED: "/unauthorized",
  PROFILE: "/profile",
  CLIENT: "/cliente",
  ADMIN: {
    // Rutas existentes
    PROJECTS: "/proyectos",
    EXPENSES: "/gastos",
    CREATE_PROJECT: "/crear-proyecto",
    CREATE_PROJECT_EDIT: "/crear-proyecto/:id",
    CREATE_MONTH_EXPENSE: "/crear-gasto-mes",
    CREATE_MONTH_EXPENSE_EDIT: "/crear-gasto-mes/:id",
    UTILITIES: "/utilidades",
    // Nuevas rutas del panel de administración
    DASHBOARD: "/admin",
    CATEGORIES: "/admin/categories",
    SERVICES: "/admin/services",
    SERVICE_NEW: "/admin/services/new",
    SERVICE_DETAIL: "/admin/services/:id",
    SERVICE_EDIT: "/admin/services/:id/edit",
  },
  LAB: {
    PROJECTS: "/lab/proyectos",
    PROJECT_DETAIL: "/lab/proyectos/:projectId",
    PROFILES: "/lab/proyectos/:projectId/perfiles",
    PROFILE_DETAIL: "/lab/proyectos/:projectId/perfil/:profileId",
    NEW_PROFILE: "/lab/proyectos/:projectId/perfil/nuevo",
    APIQUES: "/lab/proyectos/:projectId/apiques",
    APIQUE_DETAIL: "/lab/proyectos/:projectId/apique/:apiqueId",
    NEW_APIQUE: "/lab/proyectos/:projectId/apique/nuevo",
  },
} as const;

/**
 * Función auxiliar para construir URLs con parámetros de forma tipada
 * @example
 * // Genera "/lab/proyectos/123/perfil/456"
 * buildUrl(ROUTES.LAB.PROFILE_DETAIL, { projectId: "123", profileId: "456" });
 */
export function buildUrl<P extends keyof RouteParams>(
  path: string,
  params: Pick<RouteParams, P>
): string {
  let url = path;

  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });

  return url;
}

/**
 * Verifica si una ruta coincide con un patrón que contiene parámetros
 * @example
 * // Devuelve true
 * matchRoute("/lab/proyectos/123/perfiles", ROUTES.LAB.PROFILES);
 */
export function matchRoute(currentPath: string, routePattern: string): boolean {
  // Convertir el patrón de ruta a una expresión regular
  const pattern = routePattern
    .replace(/:[a-zA-Z]+/g, "[^/]+") // Reemplazar :param con [^/]+ (cualquier cosa excepto /)
    .replace(/\//g, "\\/"); // Escapar las barras

  const regex = new RegExp(`^${pattern}$`);
  return regex.test(currentPath);
}

/**
 * Extrae los parámetros de una ruta
 * @example
 * // Devuelve { projectId: "123", profileId: "456" }
 * extractParams("/lab/proyectos/123/perfil/456", ROUTES.LAB.PROFILE_DETAIL);
 */
export function extractParams(
  currentPath: string,
  routePattern: string
): Record<string, string> {
  const params: Record<string, string> = {};

  // Dividir las rutas por segmentos
  const patternSegments = routePattern.split("/");
  const pathSegments = currentPath.split("/");

  // Recorrer cada segmento y extraer los parámetros
  patternSegments.forEach((segment, index) => {
    if (segment.startsWith(":")) {
      const paramName = segment.substring(1);
      params[paramName] = pathSegments[index];
    }
  });

  return params;
}

/**
 * Hook personalizado para trabajar con parámetros de ruta tipados
 * para usar con useParams de react-router-dom
 *
 * @example
 * // Uso en un componente:
 *
 * // Importar el hook
 * import { useTypedParams } from '@/utils/routes';
 *
 * // En el componente
 * function ProfileDetails() {
 *   // Obtener los parámetros con tipos correctos
 *   const { projectId, profileId } = useTypedParams<'projectId' | 'profileId'>();
 *
 *   // projectId y profileId tienen tipo string
 *   return <div>Proyecto: {projectId}, Perfil: {profileId}</div>;
 * }
 */
export function useTypedParams<K extends keyof RouteParams>() {
  // Esta función es solo para proveer tipados. La implementación real usará useParams de react-router.
  // El cliente debe importar useParams de react-router y usar esta solo como tipo.
  return {} as Pick<RouteParams, K>;
}
