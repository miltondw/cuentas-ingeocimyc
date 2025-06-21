/**
 * Interfaces de Solicitudes de Servicio
 * @file serviceRequests.ts
 * @description Todas las interfaces relacionadas con solicitudes de servicio
 */

// =============== TIPOS BASE ===============
export type ServiceRequestStatus =
  | "pendiente"
  | "en proceso"
  | "completado"
  | "cancelado";

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
  name: string; // Cambiado de fieldName a name para coincidir con la API real
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[] | null;
  dependsOnField?: string | null;
  dependsOnValue?: string | null;
  label: string;
  displayOrder?: number;
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

// =============== INTERFACES PARA ADMINISTRACIÓN ===============

// Interface completa de solicitud de servicio con servicios seleccionados
export interface AdminServiceRequest extends ServiceRequest {
  selectedServices: AdminSelectedService[];
  updatedAt: string;
}

// Interface para servicio seleccionado en administración
export interface AdminSelectedService {
  id: number;
  requestId: number;
  serviceId: number;
  quantity: number;
  created_at: string;
  service: {
    id: number;
    categoryId: number;
    code: string;
    name: string;
    created_at: string;
    updatedAt: string;
    category: {
      id: number;
      code: string;
      name: string;
      created_at: string;
      updatedAt: string;
    };
    additionalFields: APIServiceAdditionalField[];
  };
  serviceInstances: unknown[]; // Para futuras extensiones
  additionalValues: AdminAdditionalValue[];
}

// Interface para valores adicionales en administración
export interface AdminAdditionalValue {
  id: number;
  selectedServiceId: number;
  fieldName: string;
  fieldValue: string;
  created_at: string;
}

// Interface para respuesta de lista de solicitudes en administración
export interface AdminServiceRequestsListResponse {
  data: AdminServiceRequest[];
  total: number;
  page: number;
  limit: number;
}

// Interface para actualizar el estado de una solicitud (solo para administración)
export interface UpdateServiceRequestStatusRequest {
  status?: ServiceRequestStatus;
  // Campos adicionales que se podrían actualizar en administración
  description?: string;
  // No permitir cambiar datos del cliente por seguridad
}

// Interface para filtros de administración (estructura independiente para la nueva API)
export interface AdminServiceRequestFilters {
  // Estados
  status?: ServiceRequestStatus | ServiceRequestStatus[];

  // Filtros por campos específicos de la nueva estructura
  name?: string;
  nameContains?: string;
  nameProject?: string;
  nameProjectContains?: string;
  identification?: string;
  email?: string;
  emailContains?: string;
  phone?: string;
  location?: string;
  locationContains?: string;
  description?: string;
  descriptionContains?: string;

  // Filtros adicionales para administración
  categoryId?: number;
  serviceId?: number;
  hasAdditionalData?: boolean;

  // Fechas
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // Búsqueda general
  search?: string; // Busca en name, email, nameProject, description

  // Ordenamiento por nuevos campos
  sortBy?:
    | "id"
    | "name"
    | "nameProject"
    | "email"
    | "phone"
    | "identification"
    | "location"
    | "status"
    | "created_at"
    | "updated_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}
