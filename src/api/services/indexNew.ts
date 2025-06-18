/**
 * Servicios de API - Índice principal
 * @file services/index.ts
 * @description Exporta todos los servicios de API organizados
 */

// Servicios principales
export { projectsService, ProjectsService } from "./projectsServiceNew";
export { apiquesService, ApiquesService } from "./apiquesServiceNew";
export { profilesService, ProfilesService } from "./profilesServiceNew";

// Servicios legacy (para compatibilidad)
export { profilesService as legacyProfilesService } from "./profilesService";

// Re-exportar tipos principales para conveniencia
export type {
  // Proyectos
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectExpense,
  ProjectFilters,

  // Apiques
  Apique,
  ApiqueLayer,
  CreateApiqueRequest,
  UpdateApiqueRequest,
  ApiqueFilters,

  // Perfiles
  Profile,
  ProfileBlow,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateBlowRequest,
  ProfileFilters,

  // Respuestas
  ApiResponse,
  PaginatedResponse,
  ProjectsListResponse,
  ApiquesListResponse,
  ProfilesListResponse,
} from "@/types/api";

/**
 * Configuración de servicios
 */
export const SERVICES_CONFIG = {
  // URLs base para cada servicio
  BASE_URLS: {
    PROJECTS: "/projects",
    APIQUES: "/lab/apiques",
    PROFILES: "/lab/profiles",
    AUTH: "/auth",
    SERVICE_REQUESTS: "/service-requests",
  },

  // Configuración de paginación por defecto
  DEFAULT_PAGINATION: {
    page: 1,
    limit: 20,
    sortOrder: "DESC" as const,
  },

  // Timeouts por servicio (en milisegundos)
  TIMEOUTS: {
    DEFAULT: 10000,
    FILE_UPLOAD: 30000,
    BULK_OPERATIONS: 60000,
  },

  // Configuración de reintentos
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error: any) => {
      return error.response?.status >= 500 || !error.response;
    },
  },
} as const;

/**
 * Utilidades compartidas para servicios
 */
export const ServiceUtils = {
  /**
   * Construir parámetros de URL desde filtros
   */
  buildUrlParams: (filters: Record<string, any>): URLSearchParams => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params;
  },

  /**
   * Validar ID de entidad
   */
  validateEntityId: (id: any, entityName: string = "entidad"): number => {
    const numId = parseInt(String(id), 10);

    if (isNaN(numId) || numId <= 0) {
      throw new Error(`ID de ${entityName} inválido: ${id}`);
    }

    return numId;
  },

  /**
   * Formatear fecha para API
   */
  formatDateForAPI: (date: Date | string): string => {
    if (typeof date === "string") {
      return date.split("T")[0]; // Extraer solo YYYY-MM-DD
    }
    return date.toISOString().split("T")[0];
  },

  /**
   * Parsear respuesta de error
   */
  parseErrorResponse: (error: any): string => {
    if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        return error.response.data.message.join(", ");
      }
      return error.response.data.message;
    }

    if (error.message) {
      return error.message;
    }

    return "Error desconocido en el servidor";
  },

  /**
   * Validar filtros de paginación
   */
  validatePaginationFilters: (filters: any): void => {
    if (filters.page !== undefined) {
      const page = parseInt(String(filters.page), 10);
      if (isNaN(page) || page < 1) {
        throw new Error("El número de página debe ser mayor a 0");
      }
    }

    if (filters.limit !== undefined) {
      const limit = parseInt(String(filters.limit), 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new Error("El límite debe estar entre 1 y 100");
      }
    }

    if (filters.sortOrder !== undefined) {
      if (!["ASC", "DESC"].includes(filters.sortOrder)) {
        throw new Error("El orden debe ser ASC o DESC");
      }
    }
  },
};

/**
 * Interceptores de respuesta comunes
 */
export const ResponseInterceptors = {
  /**
   * Interceptor para manejar errores de autenticación
   */
  authErrorHandler: (error: any) => {
    if (error.response?.status === 401) {
      // Redirigir al login o refrescar token
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },

  /**
   * Interceptor para logging de requests
   */
  requestLogger: (config: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }
    return config;
  },

  /**
   * Interceptor para logging de responses
   */
  responseLogger: (response: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
};

/**
 * Validadores comunes
 */
export const CommonValidators = {
  /**
   * Validar email
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar teléfono colombiano
   */
  colombianPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+?57)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  /**
   * Validar fecha
   */
  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  },

  /**
   * Validar valor monetario
   */
  currency: (value: string | number): boolean => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return !isNaN(numValue) && numValue >= 0;
  },

  /**
   * Validar profundidad
   */
  depth: (depth: string): boolean => {
    const depthRegex = /^\d+\.?\d*$/;
    return depthRegex.test(depth) && parseFloat(depth) > 0;
  },
};

/**
 * Constantes de servicios
 */
export const SERVICE_CONSTANTS = {
  // Estados de proyecto
  PROJECT_STATUSES: ["activo", "completado", "cancelado", "pausado"] as const,

  // Estados de solicitud de servicio
  SERVICE_REQUEST_STATUSES: [
    "pendiente",
    "en_proceso",
    "completada",
    "cancelada",
  ] as const,

  // Métodos de pago
  PAYMENT_METHODS: ["efectivo", "transferencia", "cheque", "credito"] as const,

  // Roles de usuario
  USER_ROLES: ["admin", "lab", "client"] as const,

  // Configuración SPT
  SPT_CONFIG: {
    DEPTH_INCREMENT: 0.45,
    DEPTH_LEVELS: 14,
    DEFAULT_BLOWS: {
      blows6: 0,
      blows12: 0,
      blows18: 0,
    },
  },

  // Límites de validación
  VALIDATION_LIMITS: {
    PROJECT_NAME_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 1000,
    OBSERVATION_MAX_LENGTH: 500,
    PHONE_MAX_LENGTH: 20,
    EMAIL_MAX_LENGTH: 255,
  },
} as const;
