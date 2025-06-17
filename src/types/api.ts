/**
 * Tipos TypeScript para la API actualizada de NestJS
 * Basado en la documentación API_COMPLETE.md y AUTH_SYSTEM_UPDATE_2025.md
 */

// ================== TIPOS BASE ==================

export type UserRole = "admin" | "lab" | "client";

export interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  lastLogin?: string;
  isActive?: boolean;
  // Campos de seguridad actualizados 2025
  lastDevice?: string;
  lastIp?: string;
  failedAttempts?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  // Campos de seguridad actualizados 2025
  sessionId?: string;
  deviceInfo?: {
    deviceName: string;
    browser: string;
    os: string;
    isNew: boolean;
  };
}

// ================== AUTH ENDPOINTS ==================

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  jwt2?: string; // Para crear admin
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  logoutAllDevices?: boolean;
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  deviceInfo: {
    deviceName: string;
    browser: string;
    os: string;
    ip: string;
  };
  isCurrentSession: boolean;
}

// ================== FILTROS Y PAGINACIÓN ==================

export interface PaginationParams {
  page?: number; // Página actual (default: 1)
  limit?: number; // Elementos por página (default: 10, max: 100)
  sortBy?: string; // Campo para ordenar
  sortOrder?: "ASC" | "DESC"; // Dirección del orden (default: 'DESC')
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

// ================== SERVICE REQUESTS ==================

export interface ServiceRequestFilters extends PaginationParams {
  status?: "pendiente" | "en_progreso" | "completado" | "cancelado";
  name?: string;
  email?: string;
  serviceType?: string;
  startDate?: string; // ISO date (YYYY-MM-DD)
  endDate?: string; // ISO date (YYYY-MM-DD)
  location?: string;
}

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
  status: "pendiente" | "en_progreso" | "completado" | "cancelado";
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequestDto {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  tipoServicio: string;
  descripcion: string;
  ubicacionProyecto: string;
}

// ================== PROJECTS ==================

export interface ProjectFilters extends PaginationParams {
  status?: "activo" | "completado" | "suspendido" | "cancelado";
  solicitante?: string;
  nombreProyecto?: string;
  obrero?: string;
  startDate?: string;
  endDate?: string;
  metodoDePago?: "efectivo" | "transferencia" | "cheque" | "credito";
}

export interface Project {
  proyecto_id: number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  valor_contrato?: number;
  estado?: "activo" | "completado" | "suspendido" | "cancelado";
  cliente_id?: number;
}

// ================== LAB ENTITIES ==================

export interface Apique {
  apique_id: number;
  apique: number;
  proyecto_id: number;
  location?: string;
  depth?: number;
  date?: string;
  cbr_unaltered?: boolean;
  depth_tomo?: number;
  molde?: number;
}

export interface Profile {
  profile_id: number;
  profile: number;
  proyecto_id: number;
  location?: string;
  depth?: number;
  date?: string;
}

export interface Blow {
  blow_id: number;
  profile_id: number;
  depth: number;
  blows6: number;
  blows12: number;
  blows18: number;
  n: number;
  observation?: string;
}

export interface Layer {
  layer_id: number;
  apique_id: number;
  depth_from: number;
  depth_to: number;
  description?: string;
  color?: string;
  texture?: string;
  humidity?: string;
  aashto?: string;
  sucs?: string;
  observation?: string;
}

// ================== FINANCIAL ENTITIES ==================

export interface GastoEmpresa {
  gasto_empresa_id: number;
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  otros_campos?: Record<string, string | number>;
}

export interface GastoProyecto {
  gasto_proyecto_id: number;
  proyecto_id: number;
  camioneta: number;
  campo: number;
  obreros: number;
  comidas: number;
  otros: number;
  peajes: number;
  combustible: number;
  hospedaje: number;
  otros_campos?: Record<string, string | number>;
}

export interface ResumenFinanciero {
  id: number;
  proyecto_id: number;
  fecha: string;
  total_ingresos: number;
  total_gastos: number;
  utilidad: number;
  porcentaje_utilidad: number;
}

// ================== SERVICES ENTITIES ==================

export interface Service {
  service_id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  has_additional_fields?: boolean;
}

export interface ServiceCategory {
  category_id: number;
  name: string;
  description?: string;
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

// ================== API RESPONSES ==================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// ================== SECURITY ENTITIES ==================

export interface AuthLog {
  id: number;
  userId: number;
  eventType:
    | "login"
    | "logout"
    | "failed_login"
    | "password_change"
    | "token_refresh";
  success: boolean;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  details?: string;
  createdAt: string;
}

export interface FailedLoginAttempt {
  id: number;
  email: string;
  ipAddress: string;
  attempts: number;
  lastAttempt: string;
  blocked: boolean;
  blockedUntil?: string;
}

export interface SecurityReport {
  totalUsers: number;
  activeSessions: number;
  failedLoginAttempts: number;
  blockedAccounts: number;
  suspiciousActivities: number;
  recentLogins: AuthLog[];
}
