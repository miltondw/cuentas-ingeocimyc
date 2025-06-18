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
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  tipoServicio: string;
  descripcion: string;
  ubicacionProyecto: string;
  fechaSolicitud: string;
  status: ServiceRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequestRequest {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  tipoServicio: string;
  descripcion: string;
  ubicacionProyecto: string;
}

export interface UpdateServiceRequestRequest {
  nombre?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  tipoServicio?: string;
  descripcion?: string;
  ubicacionProyecto?: string;
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
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: ServiceType[];
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
