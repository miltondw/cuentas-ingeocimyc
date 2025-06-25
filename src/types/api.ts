/**
 * API Interfaces for INGEOCIMYC Frontend
 * @file api.ts
 * @description Punto de entrada principal para todas las interfaces de API
 * Centralized TypeScript interfaces for API consumption
 * Updated based on real API data verification
 */

// =============== RESPONSE DTO ESTANDARIZADO ===============

/**
 * Estructura de respuesta estandarizada del backend
 * Todos los endpoints devuelven esta estructura
 */
export interface ResponseDto<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp?: string;
  path?: string;
}

// =============== RE-EXPORTS DE MÓDULOS ESPECIALIZADOS ===============

// Autenticación y usuarios
export type {
  UserRole,
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  UserDto,
  UserSession,
  DeviceInfo,
  LogoutRequest,
  LogoutResponse,
  ChangePasswordResponse,
  UserProfile,
  AuthLog,
  FailedLoginAttempt,
  SecurityReport,
} from "./auth";

// Proyectos
export type {
  ProjectStatus,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectExpense,
  CreateProjectExpenseRequest,
  UpdateProjectExpenseRequest,
  ProjectsListResponse,
  ProjectSummary,
  MonthlyProjectStats,
  PaymentRequest,
  ProjectFilters,
  ProjectExpenseFilters,
} from "./projects";

// Apiques
export type {
  Apique,
  ApiqueLayer,
  CreateApiqueRequest,
  UpdateApiqueRequest,
  CreateApiqueLayerRequest,
  UpdateApiqueLayerRequest,
  ApiquesListResponse,
  ProjectWithApiques,
  ApiqueWithLayers,
  ApiqueStatistics,
  ApiqueFilters,
  ApiqueLayerFilters,
  ApiqueValidationRules,
  LayerValidationRules,
  CreateApiqueDto,
  UpdateApiqueDto,
} from "./apiques";

// Perfiles
export type {
  Profile,
  ProfileBlow,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateBlowRequest,
  UpdateBlowRequest,
  ProfilesListResponse,
  ProjectWithProfiles,
  ProfileWithBlows,
  ProfileStatistics,
  SPTAnalysis,
  BlowAnalysis,
  SPTSummary,
  SoilClassification,
  ProfileFilters,
  BlowFilters,
  ProfileValidationRules,
  BlowValidationRules,
  SPTConfig,
  CreateProfileDto,
  UpdateProfileDto,
  CreateBlowDto,
  UpdateBlowDto,
} from "./profiles";

// Solicitudes de servicio
export type {
  ServiceRequestStatus,
  ServiceRequest,
  CreateServiceRequestRequest,
  UpdateServiceRequestRequest,
  ServiceRequestsListResponse,
  ServiceRequestSummary,
  MonthlyServiceStats,
  ServiceTypeStats,
  ServiceRequestFilters,
  ServiceType,
  ServiceCategory,
  ServiceRequestValidationRules,
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from "./serviceRequests";

// Financiero
export type {
  CompanyExpense,
  CreateCompanyExpenseRequest,
  UpdateCompanyExpenseRequest,
  ProjectExpenseFinancial,
  CreateProjectExpenseFinancialRequest,
  UpdateProjectExpenseFinancialRequest,
  FinancialSummary,
  CreateFinancialSummaryRequest,
  UpdateFinancialSummaryRequest,
  MonthlyFinancialReport,
  YearlyFinancialReport,
  ProjectFinancialAnalysis,
  FinancialListResponse,
  FinancialDashboard,
  FinancialAlert,
  CompanyExpenseFilters,
  ProjectExpenseFinancialFilters,
  FinancialSummaryFilters,
  FinancialValidationRules,
} from "./financial";

// Sistema y utilidades
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  PaginationParams,
  BaseFilters,
  DateRangeFilter,
  HealthCheckResponse,
  APIRootResponse,
  PDFGenerationRequest,
  PDFOptions,
  PDFGenerationResponse,
  Service,
  ServiceCategory as SystemServiceCategory,
  ServiceInstance,
  ServiceAdditionalField,
  ServiceAdditionalValue,
  ServiceFilters,
  SortOrder,
  ApiMethod,
  RequestConfig,
  ValidationError,
  ValidationResult,
  AppConfig,
} from "./system";

// Enums y constantes (solo exportar una vez)
export { API_ENDPOINTS } from "./system";

// =============== FILTROS UNIFICADOS ===============

// Importar tipos necesarios para las interfaces locales
import type { BaseFilters, SortOrder, ValidationError } from "./system";

/**
 * Filtros comunes que se pueden usar en múltiples endpoints
 */
export interface CommonFilters extends BaseFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Parámetros de paginación estándar
 */
export interface StandardPagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

/**
 * Respuesta estándar con paginación
 */
export interface StandardListResponse<T> {
  data: T[];
  pagination: StandardPagination;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: SortOrder;
  };
}

// =============== TIPOS DE UTILIDAD ADICIONALES ===============

/**
 * Tipo para IDs de entidades
 */
export type EntityId = number | string;

/**
 * Tipo para fechas ISO
 */
export type ISODate = string;

/**
 * Tipo para valores monetarios (siempre string en la API)
 */
export type MoneyValue = string;

/**
 * Tipo para estados booleanos que pueden venir como 0/1 de la API
 */
export type BooleanFlag = boolean | 0 | 1;

/**
 * Tipo para respuestas de operaciones CRUD
 */
export interface CrudResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

/**
 * Tipo para operaciones de eliminación
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
  deletedId: EntityId;
}

// =============== METADATA DE INTERFACES ===============

/**
 * Información sobre la versión de las interfaces
 */
export const INTERFACES_METADATA = {
  version: "2.0.0",
  lastUpdated: "2025-06-18",
  description: "Interfaces TypeScript verificadas con datos reales de la API",
  changes: [
    "Reorganizado en módulos específicos",
    "Añadidos filtros completos para todas las entidades",
    "Corregidas interfaces de Project con campos reales",
    "Añadidas validaciones y reglas de negocio",
    "Separadas interfaces de sistema y utilidades",
  ],
} as const;
