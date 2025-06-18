/**
 * Punto de entrada para todos los tipos del módulo de Laboratorio
 * Re-exporta todas las interfaces y tipos de los módulos específicos
 */

// ================== TIPOS PRINCIPALES ==================
export * from "./apiquesTypes";
export * from "./perfilesTypes";
export * from "./proyectosTypes";
export * from "./financialTypes";
export * from "./labTypes";
export * from "./reportTypes";

// ================== RE-EXPORTACIONES ESPECÍFICAS ==================

// Apiques
export type {
  Apique,
  CreateApiqueDto,
  UpdateApiqueDto,
  ApiqueResponse,
  ApiquesListResponse,
  ApiqueFilters,
  ApiqueQueryParams,
} from "./apiquesTypes";

// Perfiles y entidades relacionadas
export type {
  Perfil,
  Profile,
  Blow,
  Layer,
  ProfileData,
  CreatePerfilDto,
  UpdatePerfilDto,
  CreateProfileDto,
  UpdateProfileDto,
  CreateBlowDto,
  UpdateBlowDto,
  CreateLayerDto,
  UpdateLayerDto,
  PerfilWithBlows,
  ProfileWithBlows,
  ApiqueWithLayers,
  SPTCalculation,
  SPTReport,
} from "./perfilesTypes";

// Proyectos
export type {
  Proyecto,
  CreateProyectoDto,
  UpdateProyectoDto,
  ProyectoResponse,
  ProyectosListResponse,
  ProyectoWithDetails,
  ProyectoSummary,
  ProyectoStats,
  MetodoPago,
  EstadoProyecto,
} from "./proyectosTypes";

// Finanzas
export type {
  GastoEmpresa,
  GastoProyecto,
  ResumenFinanciero,
  OtrosCampos,
  CreateGastoEmpresaDto,
  UpdateGastoEmpresaDto,
  CreateGastoProyectoDto,
  UpdateGastoProyectoDto,
  GastoProyectoDetallado,
  AnalisisFinanciero,
  ComparacionMensual,
  TipoGastoEmpresa,
  TipoGastoProyecto,
} from "./financialTypes";

// Tipos generales
export type {
  ApiResponse,
  PaginatedResponse,
  BaseFilters,
  PaginationParams,
  QueryParams,
  Coordinates,
  Location,
  FileUpload,
  UploadedFile,
  DocumentInfo,
  Muestra,
  EnsayoBase,
  Notification,
  LabSettings,
  AuditLog,
  ValidationError,
  ValidationResult,
  DocumentType,
  DocumentStatus,
  TipoEnsayo,
  TipoSuelo,
  ClasificacionSUCS,
  EstadoMuestra,
  EstadoEnsayo,
  NotificationType,
  NotificationPriority,
  AuditAction,
} from "./labTypes";

// Reportes e informes
export type {
  ReportTemplate,
  ReportField,
  ReportLayout,
  InformeGeotecnico,
  InformeSPT,
  InformeCBR,
  ResultadoSPT,
  ClasificacionSueloPerfil,
  ParametrosGeotecnicos,
  ResultadoCompactacion,
  ResultadoCBR,
  AnexoInforme,
  CreateInformeGeotecnicoDto,
  CreateInformeSPTDto,
  CreateInformeCBRDto,
  ReportGenerationRequest,
  GeneratedReport,
  ReportConfig,
  EmpresaInfo,
  FirmaConfig,
  ValidationReport,
  TipoAnexo,
  EstadoInforme,
} from "./reportTypes";

// ================== TIPOS UTILITARIOS ==================
export type { DeepPartial, RequiredFields, OptionalFields } from "./labTypes";

// ================== CONSTANTES ==================
export {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_SORT_ORDER,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "./labTypes";

export {
  CATEGORIAS_GASTOS_EMPRESA,
  CATEGORIAS_GASTOS_PROYECTO,
} from "./financialTypes";
