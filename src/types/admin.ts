/**
 * Interfaces para Administración de Servicios
 * @file admin.ts
 * @description Tipos para el panel de administración de servicios y categorías
 */

// =============== CATEGORÍAS ===============
export interface ServiceCategory {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  services?: Service[];
}

export interface CreateCategoryRequest {
  code: string;
  name: string;
}

export interface UpdateCategoryRequest {
  code?: string;
  name?: string;
}

// =============== SERVICIOS ===============
export interface Service {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  additionalFields?: unknown[];
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateServiceRequest {
  categoryId: number;
  code: string;
  name: string;
}

export interface CreateCompleteServiceRequest {
  categoryId: number;
  code: string;
  name: string;
  additionalFields: CreateServiceAdditionalFieldRequest[];
}

export interface UpdateServiceRequest {
  categoryId?: number;
  code?: string;
  name?: string;
}

export interface UpdateCompleteServiceRequest {
  categoryId?: number;
  code?: string;
  name?: string;
  additionalFields?: CreateServiceAdditionalFieldRequest[];
}

// =============== CAMPOS ADICIONALES ===============
export type ServiceFieldType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "checkbox";

export interface ServiceAdditionalField {
  id: number;
  serviceId: number;
  fieldName: string;
  type: ServiceFieldType;
  required: boolean;
  options?: string[];
  dependsOnField?: string;
  dependsOnValue?: string;
  label?: string;
  displayOrder: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceAdditionalFieldRequest {
  fieldName: string;
  type: ServiceFieldType;
  required?: boolean;
  options?: string[];
  dependsOnField?: string;
  dependsOnValue?: string;
  label?: string;
  displayOrder?: number;
}

export interface UpdateServiceAdditionalFieldRequest {
  fieldName?: string;
  type?: ServiceFieldType;
  required?: boolean;
  options?: string[];
  dependsOnField?: string;
  dependsOnValue?: string;
  label?: string;
  displayOrder?: number;
}

// =============== RESPUESTAS DE LA API ===============
export interface AdminApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// =============== PARÁMETROS DE CONSULTA ===============
export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// =============== ESTADOS DE FORMULARIOS ===============
export interface CategoryFormData {
  code: string;
  name: string;
}

export interface ServiceFormData {
  categoryId: number;
  code: string;
  name: string;
  additionalFields: ServiceAdditionalFieldFormData[];
}

export interface ServiceAdditionalFieldFormData {
  fieldName: string;
  type: ServiceFieldType;
  required: boolean;
  options: string[];
  dependsOnField: string;
  dependsOnValue: string;
  label: string;
  displayOrder: number;
}

// =============== OPCIONES DE CAMPOS ===============
export const FIELD_TYPE_OPTIONS: { value: ServiceFieldType; label: string }[] =
  [
    { value: "text", label: "Texto" },
    { value: "number", label: "Número" },
    { value: "select", label: "Lista desplegable" },
    { value: "date", label: "Fecha" },
    { value: "checkbox", label: "Casilla de verificación" },
  ];

// =============== VALIDACIONES ===============
export const VALIDATION_RULES = {
  CATEGORY_CODE_MAX_LENGTH: 10,
  CATEGORY_NAME_MAX_LENGTH: 255,
  SERVICE_CODE_MAX_LENGTH: 10,
  SERVICE_NAME_MAX_LENGTH: 255,
  FIELD_NAME_PATTERN: /^[a-zA-Z][a-zA-Z0-9]*$/,
} as const;
