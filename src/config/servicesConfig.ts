/**
 * Configuración y constantes de servicios
 * @file config/servicesConfig.ts
 */

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
  },
} as const;

/**
 * Constantes de servicios
 */
export const SERVICE_CONSTANTS = {
  // Estados de proyecto
  PROJECT_STATUSES: ["activo", "completado", "cancelado", "pausado"] as const,

  // Estados de solicitud de servicio
  SERVICE_REQUEST_STATUSES: [
    "pendiente",
    "en proceso",
    "completado",
    "cancelado",
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
