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
  updatedAt: string;
  selectedServices: SelectedService[];
}

// =============== INTERFACES DE SERVICIO SELECCIONADO ===============
export interface SelectedService {
  id: number;
  requestId: number;
  serviceId: number;
  quantity: number;
  created_at: string;
  service: ServiceInfo;
  additionalValues: AdditionalValue[];
  serviceName?: string;
  serviceDescription?: string;
  instances?: ServiceInstance[];
  totalQuantity?: number;
}

export interface ServiceInfo {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  created_at: string;
  updatedAt: string;
  // Agregado para la UI:
  additionalFields?: AdditionalField[];
  category?: {
    id?: number;
    code?: string;
    name?: string;
    created_at?: string;
    updatedAt?: string;
  };
}

// Campo adicional para formularios dinámicos en la UI
export interface AdditionalField {
  id: number;
  label: string;
  fieldName: string;
  type?: string;
  options?: string[];
  required?: boolean;
  dependsOnField?: string | null;
  dependsOnValue?: string | null;
  displayOrder?: number;
}

// --- Utilidad para valores adicionales planos (sin id, selectedServiceId, created_at) ---
export type PlainAdditionalValue = Pick<
  AdditionalValue,
  "fieldName" | "fieldValue"
>;

// --- Ajuste de AdditionalValue para la UI (campos opcionales) ---
export interface AdditionalValue {
  id?: number;
  selectedServiceId?: number;
  fieldName: string;
  fieldValue: string;
  created_at?: string;
}

// --- ServiceInstance solo acepta AdditionalValue[] ---
// (Eliminado: definición anterior de ServiceInstance para evitar duplicados)

// --- ServiceInstance extendido para UI avanzada ---
export interface ServiceInstance {
  instanceId?: string;
  quantity?: number;
  notes?: string;
  additionalData?: Array<{ fieldId: string; value: string | number | boolean }>;

  additionalValues?: AdditionalValue[];
}

/**
 * UISelectedService
 * Extiende SelectedService y permite campos extendidos para la UI (serviceInstances, additionalValues, service flexible)
 * Usar este tipo en la UI para manipular servicios seleccionados.
 */
export interface UISelectedService
  extends Omit<SelectedService, "service" | "additionalValues"> {
  service: ServiceInfo & { [key: string]: unknown };
  additionalValues?: AdditionalValue[];
  serviceInstances?: ServiceInstance[];
}

/**
 * EditableServiceRequest
 * Para formularios de edición en la UI (sin selectedServices)
 */
export type EditableServiceRequest = Omit<ServiceRequest, "selectedServices">;

/**
 * ServiceItemProps
 * Props para el componente ServiceItem en la UI
 */
export interface ServiceItemProps {
  sel: UISelectedService;
  idx: number;
  onServiceChange: (
    idx: number,
    key: keyof UISelectedService,
    value: unknown
  ) => void;
  onAdditionalValueChange: (
    idx: number,
    instanceIdx: number,
    fieldId: number,
    value: string
  ) => void;
  onAddInstance: (serviceIdx: number) => void;
  onRemoveInstance: (serviceIdx: number, instanceIdx: number) => void;
  onDuplicateInstance: (serviceIdx: number, instanceIdx: number) => void;
  onRemoveService: (serviceIdx: number) => void;
}

// --- Para enviar al backend: solo los campos permitidos ---
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

/**
 * APIServiceAdditionalField
 * Unificada y compatible con AdditionalField y la API real.
 * - options?: string[] | null; // Permite ambos casos (API y UI)
 * - name: nombre de campo en la API (equivale a fieldName en la UI)
 * - label: etiqueta visible
 * - Otros campos para dependencias y orden
 */
export interface APIServiceAdditionalField {
  id: number;
  serviceId: number;
  name: string; // Nombre de campo en la API (equivale a fieldName en la UI)
  fieldName?: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[] | null;
  dependsOnField?: string | null;
  dependsOnValue?: string | null;
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
export interface AdminServiceRequest {
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
  updatedAt: string;
  selectedServices: AdminSelectedService[];
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
    additionalFields: AdditionalField[];
  };
  serviceInstances: ServiceInstance[];
  additionalValues: AdditionalValue[];
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

// Helper type for string or number
export type StringOrNumber = string | number;

// =============== INTERFACE PARA FORMULARIOS INTERNOS (COMPATIBILIDAD) ===============
// Todos los campos opcionales excepto selectedServices para máxima flexibilidad
export interface InternalServiceRequestData {
  nombre?: string;
  name?: string;
  nameProject?: string;
  ubicacionProyecto?: string;
  location?: string;
  identification?: string;
  telefono?: string;
  phone?: string;
  email?: string;
  empresa?: string;
  description?: string;
  descripcion?: string;
  selectedServices: Array<InternalSelectedService>;
}

// Compatibilidad para servicios seleccionados en formularios (todos los campos opcionales)
export interface InternalSelectedService {
  id?: StringOrNumber;
  serviceId?: StringOrNumber;
  quantity?: number;
  service?: ServiceInfo;
  additionalValues?: AdditionalValue[];
  serviceName?: string;
  totalQuantity?: number;
  instances?: InternalServiceInstance[];
}

// Instancias de servicio para compatibilidad con UI (todos los campos opcionales)
export interface InternalServiceInstance {
  instanceId?: string;
  quantity?: number;
  notes?: string;
  additionalData?: Array<{ fieldId: string; value: string | number | boolean }>;
  additionalValues?: AdditionalValue[];
}
