/**
 * Tipos TypeScript generales para el módulo de Laboratorio
 * Incluye tipos comunes, utilidades y enums generales
 */

// ================== TIPOS GENERALES DE RESPUESTA ==================

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  status: "success" | "error" | "warning";
  timestamp?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ================== TIPOS PARA FILTROS Y BÚSQUEDAS ==================

export interface BaseFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface QueryParams extends BaseFilters, PaginationParams {
  [key: string]: string | number | boolean | undefined;
}

// ================== TIPOS PARA COORDENADAS Y UBICACIÓN ==================

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface Location {
  name?: string;
  address?: string;
  coordinates?: Coordinates;
  description?: string;
}

// ================== TIPOS PARA ARCHIVOS Y DOCUMENTOS ==================

export interface FileUpload {
  file: File;
  description?: string;
  category?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string;
  description?: string;
  category?: string;
}

export interface DocumentInfo {
  id: number;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  files?: UploadedFile[];
}

// ================== ENUMS GENERALES ==================

export enum DocumentType {
  INFORME_GEOTECNICO = "informe_geotecnico",
  INFORME_SPT = "informe_spt",
  INFORME_CBR = "informe_cbr",
  INFORME_APIQUE = "informe_apique",
  CERTIFICADO_CALIDAD = "certificado_calidad",
  PLANO_UBICACION = "plano_ubicacion",
  FOTOGRAFIA = "fotografia",
  OTROS = "otros",
}

export enum DocumentStatus {
  BORRADOR = "borrador",
  EN_REVISION = "en_revision",
  APROBADO = "aprobado",
  ENTREGADO = "entregado",
  RECHAZADO = "rechazado",
}

export enum TipoEnsayo {
  SPT = "spt",
  CBR = "cbr",
  GRANULOMETRIA = "granulometria",
  LIMITES_ATTERBERG = "limites_atterberg",
  DENSIDAD = "densidad",
  HUMEDAD = "humedad",
  TRIAXIAL = "triaxial",
  CONSOLIDACION = "consolidacion",
  PERMEABILIDAD = "permeabilidad",
}

export enum TipoSuelo {
  ARCILLA = "arcilla",
  LIMO = "limo",
  ARENA = "arena",
  GRAVA = "grava",
  ROCA = "roca",
  ORGANICO = "organico",
  RELLENO = "relleno",
}

export enum ClasificacionSUCS {
  GW = "GW", // Grava bien gradada
  GP = "GP", // Grava mal gradada
  GM = "GM", // Grava limosa
  GC = "GC", // Grava arcillosa
  SW = "SW", // Arena bien gradada
  SP = "SP", // Arena mal gradada
  SM = "SM", // Arena limosa
  SC = "SC", // Arena arcillosa
  ML = "ML", // Limo inorgánico
  CL = "CL", // Arcilla inorgánica de baja plasticidad
  OL = "OL", // Limo orgánico
  MH = "MH", // Limo inorgánico de alta plasticidad
  CH = "CH", // Arcilla inorgánica de alta plasticidad
  OH = "OH", // Arcilla orgánica
  PT = "PT", // Turba
}

// ================== TIPOS PARA ENSAYOS Y MUESTRAS ==================

export interface Muestra {
  id: string;
  proyecto_id: number;
  perfil_id?: number;
  apique_id?: number;
  profundidad: number;
  descripcion?: string;
  tipo_suelo?: TipoSuelo;
  clasificacion_sucs?: ClasificacionSUCS;
  fecha_extraccion: string;
  estado: EstadoMuestra;
  observaciones?: string;
}

export interface EnsayoBase {
  id: number;
  muestra_id: string;
  tipo_ensayo: TipoEnsayo;
  fecha_ensayo: string;
  realizado_por?: string;
  estado: EstadoEnsayo;
  observaciones?: string;
  resultados: Record<string, unknown>;
}

export enum EstadoMuestra {
  EXTRAIDA = "extraida",
  EN_LABORATORIO = "en_laboratorio",
  EN_ENSAYO = "en_ensayo",
  ENSAYADA = "ensayada",
  ARCHIVADA = "archivada",
}

export enum EstadoEnsayo {
  PENDIENTE = "pendiente",
  EN_PROCESO = "en_proceso",
  COMPLETADO = "completado",
  REVISADO = "revisado",
  APROBADO = "aprobado",
}

// ================== TIPOS PARA NOTIFICACIONES ==================

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  userId?: number;
  relatedEntity?: {
    type: "proyecto" | "perfil" | "apique" | "ensayo";
    id: number;
  };
}

export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  SUCCESS = "success",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// ================== TIPOS PARA CONFIGURACIÓN ==================

export interface LabSettings {
  empresa: {
    nombre: string;
    nit: string;
    direccion: string;
    telefono: string;
    email: string;
    logo?: string;
  };
  reportes: {
    plantillas: {
      [key in DocumentType]?: string;
    };
    firmaDigital: boolean;
    marcaAgua: boolean;
  };
  calidad: {
    controlCalidad: boolean;
    dobleVerificacion: boolean;
    requiereAprobacion: boolean;
  };
}

// ================== TIPOS UTILITARIOS ==================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ================== CONSTANTES ==================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SORT_ORDER = "DESC";

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ================== TIPOS PARA VALIDACIÓN ==================

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ================== TIPOS PARA AUDITORÍA ==================

export interface AuditLog {
  id: number;
  action: AuditAction;
  entity: string;
  entityId: number;
  userId?: number;
  userName?: string;
  changes?: Record<
    string,
    {
      before: unknown;
      after: unknown;
    }
  >;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  VIEW = "view",
  EXPORT = "export",
  IMPORT = "import",
  LOGIN = "login",
  LOGOUT = "logout",
}
