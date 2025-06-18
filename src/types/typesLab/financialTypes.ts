/**
 * Tipos TypeScript para Gastos y Finanzas
 * Basado en la estructura de base de datos - tablas: gastos_empresa, gastos_proyectos, resumen_financiero
 */

// ================== TIPOS PARA CAMPOS DINÁMICOS ==================

export interface OtrosCampos {
  [key: string]: number | string | boolean;
}

// ================== INTERFACES PRINCIPALES ==================

export interface GastoEmpresa {
  gasto_empresa_id: number;
  mes?: string; // Formato ISO date string
  salarios?: number;
  luz?: number;
  agua?: number;
  arriendo?: number;
  internet?: number;
  salud?: number;
  otrosCampos?: OtrosCampos;
}

export interface GastoProyecto {
  gasto_proyecto_id: number;
  id?: number; // ID del proyecto relacionado
  camioneta?: number;
  campo?: number;
  obreros?: number;
  comidas?: number;
  otros?: number;
  peajes?: number;
  combustible?: number;
  hospedaje?: number;
  otrosCampos?: OtrosCampos;
}

export interface ResumenFinanciero {
  id: number;
  mes: string; // Formato YYYY-MM
  ingresos_totales: number;
  gastos_totales: number;
  utilidad_bruta: number;
  utilidad_neta: number;
  margen_utilidad: number;
  created_at: string;
  updatedAt: string;
}

// ================== DTOs PARA CREAR/ACTUALIZAR ==================

export interface CreateGastoEmpresaDto {
  mes?: string;
  salarios?: number;
  luz?: number;
  agua?: number;
  arriendo?: number;
  internet?: number;
  salud?: number;
  otrosCampos?: OtrosCampos;
}

export interface UpdateGastoEmpresaDto {
  mes?: string;
  salarios?: number;
  luz?: number;
  agua?: number;
  arriendo?: number;
  internet?: number;
  salud?: number;
  otrosCampos?: OtrosCampos;
}

export interface CreateGastoProyectoDto {
  id: number; // ID del proyecto (requerido)
  camioneta?: number;
  campo?: number;
  obreros?: number;
  comidas?: number;
  otros?: number;
  peajes?: number;
  combustible?: number;
  hospedaje?: number;
  otrosCampos?: OtrosCampos;
}

export interface UpdateGastoProyectoDto {
  camioneta?: number;
  campo?: number;
  obreros?: number;
  comidas?: number;
  otros?: number;
  peajes?: number;
  combustible?: number;
  hospedaje?: number;
  otrosCampos?: OtrosCampos;
}

export interface CreateResumenFinancieroDto {
  mes: string;
  ingresos_totales: number;
  gastos_totales: number;
  utilidad_bruta: number;
  utilidad_neta: number;
  margen_utilidad: number;
}

export interface UpdateResumenFinancieroDto {
  ingresos_totales?: number;
  gastos_totales?: number;
  utilidad_bruta?: number;
  utilidad_neta?: number;
  margen_utilidad?: number;
}

// ================== TIPOS DE RESPUESTA ==================

export interface GastoEmpresaResponse {
  gastoEmpresa: GastoEmpresa;
  message?: string;
}

export interface GastosEmpresaListResponse {
  gastosEmpresa: GastoEmpresa[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface GastoProyectoResponse {
  gastoProyecto: GastoProyecto;
  message?: string;
}

export interface GastosProyectoListResponse {
  gastosProyecto: GastoProyecto[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface ResumenFinancieroResponse {
  resumenFinanciero: ResumenFinanciero;
  message?: string;
}

export interface ResumenesFinancierosListResponse {
  resumenes: ResumenFinanciero[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ================== TIPOS COMPUESTOS Y ANÁLISIS ==================

export interface GastoProyectoDetallado extends GastoProyecto {
  proyecto?: {
    id: number;
    nombreProyecto: string;
    solicitante: string;
    fecha: string;
    costoServicio: number;
  };
  totalGastos: number;
  margenUtilidad: number;
}

export interface AnalisisFinanciero {
  periodo: string; // YYYY-MM o YYYY
  ingresosTotales: number;
  gastosTotales: number;
  utilidadBruta: number;
  utilidadNeta: number;
  margenUtilidad: number;
  gastosEmpresa: {
    total: number;
    desglose: GastoEmpresa;
  };
  gastosProyectos: {
    total: number;
    porProyecto: Array<{
      proyectoId: number;
      nombreProyecto: string;
      gastos: number;
    }>;
  };
  tendencia?: {
    ingresos: "creciente" | "decreciente" | "estable";
    gastos: "creciente" | "decreciente" | "estable";
    utilidad: "creciente" | "decreciente" | "estable";
  };
}

export interface ComparacionMensual {
  mesActual: ResumenFinanciero;
  mesAnterior?: ResumenFinanciero;
  variacion: {
    ingresos: number; // Porcentaje
    gastos: number;
    utilidad: number;
  };
}

// ================== FILTROS Y PARÁMETROS ==================

export interface GastoEmpresaFilters {
  mesDesde?: string;
  mesHasta?: string;
  conSalarios?: boolean;
  montoMin?: number;
  montoMax?: number;
}

export interface GastoProyectoFilters {
  proyectoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  montoMin?: number;
  montoMax?: number;
  tipoGasto?:
    | "camioneta"
    | "campo"
    | "obreros"
    | "comidas"
    | "otros"
    | "peajes"
    | "combustible"
    | "hospedaje";
}

export interface ResumenFinancieroFilters {
  mesDesde?: string;
  mesHasta?: string;
  margenMin?: number;
  margenMax?: number;
}

export interface GastoEmpresaQueryParams extends GastoEmpresaFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof GastoEmpresa;
  sortOrder?: "ASC" | "DESC";
}

export interface GastoProyectoQueryParams extends GastoProyectoFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof GastoProyecto;
  sortOrder?: "ASC" | "DESC";
  includeProyecto?: boolean;
}

export interface ResumenFinancieroQueryParams extends ResumenFinancieroFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof ResumenFinanciero;
  sortOrder?: "ASC" | "DESC";
}

// ================== ENUMS Y CONSTANTES ==================

export enum TipoGastoEmpresa {
  SALARIOS = "salarios",
  LUZ = "luz",
  AGUA = "agua",
  ARRIENDO = "arriendo",
  INTERNET = "internet",
  SALUD = "salud",
  OTROS = "otros",
}

export enum TipoGastoProyecto {
  CAMIONETA = "camioneta",
  CAMPO = "campo",
  OBREROS = "obreros",
  COMIDAS = "comidas",
  OTROS = "otros",
  PEAJES = "peajes",
  COMBUSTIBLE = "combustible",
  HOSPEDAJE = "hospedaje",
}

export const CATEGORIAS_GASTOS_EMPRESA = [
  "salarios",
  "luz",
  "agua",
  "arriendo",
  "internet",
  "salud",
] as const;

export const CATEGORIAS_GASTOS_PROYECTO = [
  "camioneta",
  "campo",
  "obreros",
  "comidas",
  "otros",
  "peajes",
  "combustible",
  "hospedaje",
] as const;
