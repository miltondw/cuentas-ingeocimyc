/**
 * Interfaces de Solicitudes de Servicio
 * @file serviceRequests.ts
 * @description Todas las interfaces relacionadas con solicitudes de servicio
 */

// =============== TIPOS BASE ===============
export type ServiceRequestStatus =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "cancelada";

// =============== SOLICITUD DE SERVICIO INTERFACES ===============
export interface ServiceRequest {
  id: number;
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
  // Mantener campos antiguos por compatibilidad (deprecados)
  /** @deprecated usar name */
  nombre?: string;
  /** @deprecated usar nameProject */
  empresa?: string;
  /** @deprecated usar phone */
  telefono?: string;
  /** @deprecated usar description */
  descripcion?: string;
  /** @deprecated usar location */
  ubicacionProyecto?: string;
  /** @deprecated */
  tipoServicio?: string;
  /** @deprecated */
  fechaSolicitud?: string;
}

// =============== INTERFACES DE SERVICIO SELECCIONADO ===============
export interface ServiceAdditionalFieldValue {
  fieldId: string;
  value: string | number | boolean;
}

export interface ServiceInstance {
  instanceId: string; // UUID generado
  quantity: number;
  additionalData?: ServiceAdditionalFieldValue[];
  notes?: string;
}

// Para la UI interna
export interface SelectedService {
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  basePrice?: number;
  instances: ServiceInstance[];
  totalQuantity: number; // Suma de todas las cantidades de instancias
}

// Para enviar al backend
export interface BackendServiceRequest {
  serviceId: number;
  quantity: number;
  additionalValues?: Array<{
    fieldName: string;
    fieldValue: string;
  }>;
}

export interface CreateServiceRequestRequest {
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
  selectedServices: BackendServiceRequest[];
}

// Para la UI interna (mantenemos la estructura anterior para compatibilidad)
export interface InternalServiceRequestData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  nameProject: string;
  identification: string;
  selectedServices: SelectedService[];
  descripcion: string;
  ubicacionProyecto: string;
}

export interface UpdateServiceRequestRequest {
  name?: string;
  nameProject?: string;
  location?: string;
  identification?: string;
  phone?: string;
  email?: string;
  description?: string;
  selectedServices?: BackendServiceRequest[];
  status?: ServiceRequestStatus;
}

// =============== LISTAS Y RESPUESTAS ===============
export interface ServiceRequestsListResponse {
  data: ServiceRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceRequestSummary {
  totalRequests: number;
  pendingRequests: number;
  inProcessRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  monthlyStats: MonthlyServiceStats[];
  serviceTypeStats: ServiceTypeStats[];
}

export interface MonthlyServiceStats {
  month: string;
  count: number;
  completed: number;
  pending: number;
}

export interface ServiceTypeStats {
  serviceType: string;
  count: number;
  percentage: number;
}

// =============== FILTROS ===============
export interface ServiceRequestFilters {
  // Estado
  status?: ServiceRequestStatus | ServiceRequestStatus[];

  // Tipo de servicio
  tipoServicio?: string;
  tipoServicioContains?: string;

  // Fechas
  fechaSolicitud?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // Búsqueda por cliente
  nombre?: string;
  nombreContains?: string;
  email?: string;
  emailContains?: string;
  telefono?: string;

  // Empresa
  empresa?: string;
  empresaContains?: string;
  hasEmpresa?: boolean;

  // Ubicación
  ubicacionProyecto?: string;
  ubicacionContains?: string;

  // Descripción
  descripcionContains?: string;

  // Búsqueda general
  search?: string; // Busca en nombre, email, empresa, descripción

  // Ordenamiento
  sortBy?:
    | "id"
    | "nombre"
    | "email"
    | "empresa"
    | "tipoServicio"
    | "fechaSolicitud"
    | "status"
    | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

// =============== TIPOS DE SERVICIO ===============
export interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration?: string;
  basePrice?: number;
  isActive: boolean;
  hasAdditionalFields?: boolean;
  additionalFields?: ServiceAdditionalField[];
}

export interface ServiceAdditionalField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required: boolean;
  options?: string[]; // Para campos tipo select
  placeholder?: string;
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
}

// =============== VALIDACIONES ===============
export interface ServiceRequestValidationRules {
  nombre: {
    minLength: number;
    maxLength: number;
    pattern: string;
    required: boolean;
  };
  email: {
    pattern: string;
    maxLength: number;
    required: boolean;
  };
  telefono: {
    pattern: string;
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  empresa: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  tipoServicio: {
    allowedValues: string[];
    required: boolean;
  };
  descripcion: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  ubicacionProyecto: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
}

// =============== DTOs (Para compatibilidad) ===============
export type CreateServiceRequestDto = CreateServiceRequestRequest;
export type UpdateServiceRequestDto = UpdateServiceRequestRequest;

// =============== NUEVA API STRUCTURE ===============
export interface APIServiceCategory {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updatedAt: string;
}

export interface APIServiceAdditionalField {
  id: number;
  serviceId: number;
  fieldName: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[] | null;
  dependsOnField?: string | null;
  dependsOnValue?: string | null;
  label: string;
  created_at: string;
  updatedAt: string;
}

export interface APIService {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  created_at: string;
  updatedAt: string;
  category: APIServiceCategory;
  additionalFields: APIServiceAdditionalField[];
}

// Helper types para el formulario
export interface ProcessedServiceCategory {
  id: string;
  name: string;
  description: string;
  code: string;
  services: ProcessedService[];
}

export interface ProcessedService {
  id: string;
  name: string;
  description?: string;
  code: string;
  categoryId: string;
  categoryName: string;
  hasAdditionalFields: boolean;
  additionalFields: ProcessedServiceField[];
}

export interface ProcessedServiceField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[];
  dependsOnField?: string;
  dependsOnValue?: string;
}

// Alias para compatibilidad con código anterior
export type ServiceCategory = APIServiceCategory;
