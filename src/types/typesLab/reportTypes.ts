/**
 * Tipos TypeScript para Reportes e Informes del Laboratorio
 * Incluye tipos para generación de informes geotécnicos, SPT, CBR, etc.
 */

import type { TipoSuelo, ClasificacionSUCS, DocumentType } from "./labTypes";

// ================== TIPOS BASE PARA REPORTES ==================

export interface ReportTemplate {
  id: string;
  name: string;
  type: DocumentType;
  version: string;
  fields: ReportField[];
  layout: ReportLayout;
  createdAt: string;
  updatedAt: string;
}

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select" | "table" | "image";
  required: boolean;
  validation?: FieldValidation;
  options?: string[]; // Para campos select
  defaultValue?: unknown;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
}

export interface ReportLayout {
  header: LayoutSection;
  body: LayoutSection[];
  footer: LayoutSection;
  styles: ReportStyles;
}

export interface LayoutSection {
  id: string;
  type: "header" | "body" | "footer" | "table" | "chart" | "image" | "text";
  content: Record<string, unknown>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ReportStyles {
  fontSize: number;
  fontFamily: string;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
}

// ================== TIPOS ESPECÍFICOS DE INFORMES ==================

export interface InformeGeotecnico {
  id: number;
  proyecto_id: number;
  numero_informe: string;
  fecha_emision: string;
  solicitante: string;
  ubicacion_proyecto: string;
  objetivo: string;
  metodologia: string;
  resumen_ejecutivo: string;
  conclusiones: string;
  recomendaciones: string;
  limitaciones: string;
  referencias: string[];
  anexos: AnexoInforme[];
  estado: EstadoInforme;
  creado_por: string;
  revisado_por?: string;
  aprobado_por?: string;
  created_at: string;
  updated_at: string;
}

export interface InformeSPT {
  id: number;
  perfil_id: number;
  numero_sondeo: string;
  fecha_perforacion: string;
  metodo_perforacion: string;
  diametro_perforacion: number;
  profundidad_total: number;
  nivel_freatico?: number;
  resultados_spt: ResultadoSPT[];
  interpretacion: string;
  clasificacion_suelos: ClasificacionSueloPerfil[];
  parametros_geotecnicos: ParametrosGeotecnicos;
  graficos: GraficoSPT[];
}

export interface InformeCBR {
  id: number;
  apique_id: number;
  muestra_id: string;
  fecha_ensayo: string;
  descripcion_muestra: string;
  ubicacion_muestra: string;
  profundidad_muestra: number;
  procedimiento: string;
  resultados_compactacion: ResultadoCompactacion;
  resultados_cbr: ResultadoCBR;
  clasificacion_sucs: ClasificacionSUCS;
  observaciones: string;
}

// ================== TIPOS PARA RESULTADOS DE ENSAYOS ==================

export interface ResultadoSPT {
  profundidad: number;
  muestra: string;
  descripcion_suelo: string;
  golpes_6: number;
  golpes_12: number;
  golpes_18: number;
  n_spt: number;
  n_corregido?: number;
  recuperacion: number;
  nivel_agua?: boolean;
  observaciones?: string;
}

export interface ClasificacionSueloPerfil {
  profundidad_inicio: number;
  profundidad_fin: number;
  descripcion: string;
  tipo_suelo: TipoSuelo;
  clasificacion_sucs: ClasificacionSUCS;
  color: string;
  consistencia?: string;
  humedad?: "seco" | "húmedo" | "saturado";
  plasticidad?: "no_plástico" | "baja" | "media" | "alta";
}

export interface ParametrosGeotecnicos {
  angulo_friccion?: number;
  cohesion?: number;
  peso_unitario?: number;
  modulo_elasticidad?: number;
  coeficiente_poisson?: number;
  capacidad_portante?: number;
  factor_seguridad?: number;
}

export interface GraficoSPT {
  tipo: "perfil_suelo" | "n_spt" | "nivel_freatico";
  datos: Array<{
    x: number;
    y: number;
    label?: string;
  }>;
  configuracion: {
    titulo: string;
    eje_x: string;
    eje_y: string;
    escala: "lineal" | "logaritmica";
  };
}

export interface ResultadoCompactacion {
  densidad_maxima: number;
  humedad_optima: number;
  metodo: "proctor_estandar" | "proctor_modificado";
  puntos_curva: Array<{
    humedad: number;
    densidad: number;
  }>;
}

export interface ResultadoCBR {
  cbr_95: number;
  cbr_100: number;
  expansion: number;
  densidad_ensayo: number;
  humedad_ensayo: number;
  observaciones?: string;
}

// ================== TIPOS PARA ANEXOS Y DOCUMENTACIÓN ==================

export interface AnexoInforme {
  id: string;
  tipo: TipoAnexo;
  titulo: string;
  descripcion?: string;
  archivo_url?: string;
  contenido?: unknown;
  orden: number;
}

export enum TipoAnexo {
  REGISTRO_PERFORACION = "registro_perforacion",
  RESULTADOS_LABORATORIO = "resultados_laboratorio",
  FOTOGRAFIAS = "fotografias",
  PLANOS_UBICACION = "planos_ubicacion",
  CALCULOS = "calculos",
  GRAFICOS = "graficos",
  CERTIFICADOS = "certificados",
  OTROS = "otros",
}

export enum EstadoInforme {
  BORRADOR = "borrador",
  EN_REVISION = "en_revision",
  REVISADO = "revisado",
  APROBADO = "aprobado",
  ENTREGADO = "entregado",
}

// ================== DTOs PARA CREAR/ACTUALIZAR INFORMES ==================

export interface CreateInformeGeotecnicoDto {
  proyecto_id: number;
  numero_informe: string;
  fecha_emision: string;
  solicitante: string;
  ubicacion_proyecto: string;
  objetivo: string;
  metodologia: string;
  resumen_ejecutivo?: string;
  conclusiones?: string;
  recomendaciones?: string;
  limitaciones?: string;
  referencias?: string[];
  anexos?: Omit<AnexoInforme, "id">[];
}

export interface UpdateInformeGeotecnicoDto {
  numero_informe?: string;
  fecha_emision?: string;
  solicitante?: string;
  ubicacion_proyecto?: string;
  objetivo?: string;
  metodologia?: string;
  resumen_ejecutivo?: string;
  conclusiones?: string;
  recomendaciones?: string;
  limitaciones?: string;
  referencias?: string[];
  anexos?: AnexoInforme[];
}

export interface CreateInformeSPTDto {
  perfil_id: number;
  numero_sondeo: string;
  fecha_perforacion: string;
  metodo_perforacion: string;
  diametro_perforacion: number;
  profundidad_total: number;
  nivel_freatico?: number;
  resultados_spt: Omit<ResultadoSPT, "n_corregido">[];
  interpretacion?: string;
  clasificacion_suelos?: ClasificacionSueloPerfil[];
  parametros_geotecnicos?: ParametrosGeotecnicos;
}

export interface CreateInformeCBRDto {
  apique_id: number;
  muestra_id: string;
  fecha_ensayo: string;
  descripcion_muestra: string;
  ubicacion_muestra: string;
  profundidad_muestra: number;
  procedimiento: string;
  resultados_compactacion: ResultadoCompactacion;
  resultados_cbr: ResultadoCBR;
  clasificacion_sucs: ClasificacionSUCS;
  observaciones?: string;
}

// ================== TIPOS PARA GENERACIÓN DE REPORTES ==================

export interface ReportGenerationRequest {
  template_id: string;
  data: Record<string, unknown>;
  format: "pdf" | "docx" | "html";
  options?: ReportOptions;
}

export interface ReportOptions {
  includeAttachments?: boolean;
  watermark?: boolean;
  digitalSignature?: boolean;
  headerText?: string;
  footerText?: string;
  pageNumbers?: boolean;
  orientation?: "portrait" | "landscape";
  paperSize?: "A4" | "Letter" | "Legal";
}

export interface GeneratedReport {
  id: string;
  filename: string;
  format: string;
  size: number;
  url: string;
  createdAt: string;
  expiresAt?: string;
}

// ================== TIPOS PARA CONFIGURACIÓN DE REPORTES ==================

export interface ReportConfig {
  empresa: EmpresaInfo;
  formatos: FormatoConfig;
  firmas: FirmaConfig[];
  plantillas: PlantillaConfig[];
}

export interface EmpresaInfo {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  web?: string;
  logo?: string;
  sello?: string;
}

export interface FormatoConfig {
  fecha: string; // Formato de fecha (DD/MM/YYYY, MM/DD/YYYY, etc.)
  numero: string; // Formato de números decimales
  moneda: string; // Símbolo de moneda
  idioma: "es" | "en";
}

export interface FirmaConfig {
  id: string;
  nombre: string;
  cargo: string;
  profesion: string;
  registro_profesional: string;
  firma_digital?: string;
  sello_digital?: string;
  activa: boolean;
}

export interface PlantillaConfig {
  id: string;
  nombre: string;
  tipo: DocumentType;
  archivo: string;
  variables: string[];
  activa: boolean;
}

// ================== TIPOS PARA VALIDACIÓN DE INFORMES ==================

export interface ValidationRule {
  field: string;
  rule: "required" | "min" | "max" | "pattern" | "custom";
  value?: unknown;
  message: string;
}

export interface ReportValidation {
  rules: ValidationRule[];
  customValidators: Record<string, (value: unknown) => boolean>;
}

export interface ValidationReport {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: "error" | "warning";
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}
