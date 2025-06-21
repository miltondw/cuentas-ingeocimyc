/**
 * Interfaces de Sistema y Utilidades
 * @file system.ts
 * @description Interfaces para respuestas de API, paginación, errores y sistema
 */

// =============== RESPUESTAS DE API GENÉRICAS ===============
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters?: Record<string, string | number | boolean>;
  sort?: {
    field: string;
    direction: "ASC" | "DESC";
  };
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
  method: string;
}

// =============== PAGINACIÓN Y FILTROS BASE ===============
export interface PaginationParams {
  page?: number; // Página actual (default: 1)
  limit?: number; // Elementos por página (default: 10, max: 100)
  sortBy?: string; // Campo para ordenar
  sortOrder?: "ASC" | "DESC"; // Dirección del orden (default: 'DESC')
}

export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface DateRangeFilter {
  startDate?: string; // ISO date (YYYY-MM-DD)
  endDate?: string; // ISO date (YYYY-MM-DD)
}

// =============== HEALTH CHECK Y SISTEMA ===============
export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database?: {
    status: "connected" | "disconnected";
    latency?: number;
  };
  services?: {
    name: string;
    status: "up" | "down";
    lastCheck: string;
  }[];
}

export interface APIRootResponse {
  name: string;
  version: string;
  description: string;
  environment: string;
  timestamp: string;
  status: string;
  docs: string;
  endpoints: {
    auth: string;
    projects: string;
    serviceRequests: string;
    lab: string;
    services: string;
    health: string;
  };
  config: {
    port: string;
    nodeEnv: string;
    renderUrl: string;
    isProduction: boolean;
  };
}

// =============== PDF INTERFACES ===============
export interface PDFGenerationRequest {
  serviceRequestId: number;
  template?: string;
  options?: PDFOptions;
}

export interface PDFOptions {
  format?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  header?: {
    height: string;
    contents: string;
  };
  footer?: {
    height: string;
    contents: string;
  };
}

export interface PDFGenerationResponse {
  success: boolean;
  message: string;
  filePath?: string;
  size?: number;
  downloadUrl?: string;
}

// =============== SERVICIOS INTERFACES ===============
export interface Service {
  service_id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  has_additional_fields?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ServiceCategory {
  category_id: number;
  name: string;
  description?: string;
  services?: Service[];
}

export interface ServiceInstance {
  instance_id: number;
  request_id: number;
  service_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface ServiceAdditionalField {
  field_id: number;
  service_id: number;
  field_name: string;
  field_type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string;
  default_value?: string;
  order?: number;
}

export interface ServiceAdditionalValue {
  value_id: number;
  instance_id: number;
  field_id: number;
  value: string;
}

// =============== FILTROS DE SERVICIOS ===============
export interface ServiceFilters {
  // Categoría
  category_id?: number;
  categoryName?: string;

  // Precio
  priceMin?: number;
  priceMax?: number;

  // Campos adicionales
  hasAdditionalFields?: boolean;

  // Estado
  isActive?: boolean;

  // Búsqueda
  search?: string; // Busca en name y description
  nameContains?: string;
  descriptionContains?: string;

  // Ordenamiento
  sortBy?: "service_id" | "name" | "price" | "category_id" | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

// =============== CONSTANTES Y ENUMS ===============
export enum UserRole {
  ADMIN = "admin",
  LAB = "lab",
  CLIENT = "client",
}

export enum ProjectStatus {
  ACTIVE = "activo",
  COMPLETED = "completado",
  CANCELLED = "cancelado",
  PAUSED = "pausado",
}

export enum ServiceRequestStatus {
  PENDING = "pendiente",
  IN_PROCESS = "en proceso",
  COMPLETED = "completado",
  CANCELLED = "cancelado",
}

// =============== ENDPOINTS CONSTANTES ===============
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    SESSIONS: "/auth/sessions",
    REFRESH: "/auth/refresh",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  PROJECTS: {
    LIST: "/projects",
    CREATE: "/projects",
    DETAIL: (id: number) => `/projects/${id}`,
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
    SUMMARY: "/projects/summary",
    EXPENSES: (id: number) => `/projects/${id}/expenses`,
    PAYMENTS: (id: number) => `/projects/${id}/payment`,
  },
  APIQUES: {
    LIST: "/lab/apiques",
    CREATE: "/lab/apiques",
    BY_PROJECT: (projectId: number) => `/lab/apiques/project/${projectId}`,
    DETAIL: (projectId: number, apiqueId: number) =>
      `/lab/apiques/${projectId}/${apiqueId}`,
    UPDATE: (projectId: number, apiqueId: number) =>
      `/lab/apiques/${projectId}/${apiqueId}`,
    DELETE: (projectId: number, apiqueId: number) =>
      `/lab/apiques/${projectId}/${apiqueId}`,
    STATISTICS: (projectId: number) =>
      `/lab/apiques/project/${projectId}/statistics`,
  },
  PROFILES: {
    LIST: "/lab/profiles",
    CREATE: "/lab/profiles",
    BY_PROJECT: (projectId: number) => `/lab/profiles/project/${projectId}`,
    BY_SOUNDING: (projectId: number, soundingNumber: string) =>
      `/lab/profiles/project/${projectId}/sounding/${soundingNumber}`,
    DETAIL: (id: number) => `/lab/profiles/${id}`,
    UPDATE: (id: number) => `/lab/profiles/${id}`,
    DELETE: (id: number) => `/lab/profiles/${id}`,
    ADD_BLOW: (profileId: number) => `/lab/profiles/${profileId}/blows`,
  },
  SERVICE_REQUESTS: {
    LIST: "/service-requests",
    CREATE: "/service-requests",
    DETAIL: (id: number) => `/service-requests/${id}`,
    UPDATE: (id: number) => `/service-requests/${id}`,
    DELETE: (id: number) => `/service-requests/${id}`,
  },
  SERVICES: {
    LIST: "/services",
    CREATE: "/services",
    DETAIL: (id: number) => `/services/${id}`,
    UPDATE: (id: number) => `/services/${id}`,
    DELETE: (id: number) => `/services/${id}`,
    CATEGORIES: "/services/categories",
  },
  FINANCIAL: {
    EXPENSES: "/gastos-mes/expenses",
    SUMMARIES: "/gastos-mes/summaries",
    RESUMEN: "/resumen",
  },
  PDF: {
    SERVICE_REQUEST: (id: number) => `/pdf/service-request/${id}`,
    PREVIEW: (id: number) => `/pdf/service-request/${id}/preview`,
    REGENERATE: (id: number) => `/pdf/service-request/${id}/regenerate`,
  },
  SYSTEM: {
    HEALTH: "/health",
    ROOT: "/",
  },
} as const;

// =============== TIPOS DE UTILIDAD ===============
export type SortOrder = "ASC" | "DESC";
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig {
  method: ApiMethod;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

// =============== TIPOS DE VALIDACIÓN ===============
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// =============== CONFIGURACIÓN DE LA APP ===============
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  auth: {
    tokenKey: string;
    refreshKey: string;
    rememberMeKey: string;
    sessionTimeout: number;
  };
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  validation: {
    enableClientSide: boolean;
    enableServerSide: boolean;
  };
}
