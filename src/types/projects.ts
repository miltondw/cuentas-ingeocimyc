/**
 * Interfaces de Proyectos
 * @file projects.ts
 * @description Todas las interfaces relacionadas con proyectos y gastos
 */

// =============== TIPOS BASE ===============
export enum ProjectStatus {
  ACTIVO = "activo",
  COMPLETADO = "completado",
  CANCELADO = "cancelado",
  PAUSADO = "pausado",
}

// =============== PROYECTO INTERFACES ===============
import type { ProjectFinance } from "./typesProject/projectTypes";
export interface Project {
  id: number;
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  identificacion: string;
  finanzas: ProjectFinance[]; // <-- Añadido para reflejar la respuesta real de la API
  expenses?: ProjectExpense[];
  // Los siguientes campos pueden ser agregados por aplanamiento en el frontend, pero no son obligatorios en la respuesta original:
  obrero?: string;
  costoServicio?: string | number;
  abono?: string | number;
  factura?: string;
  valorRetencion?: string | number;
  valor_iva?: number;
  valor_re?: number;
  metodoDePago?: string;
  estado?: ProjectStatus | string;
  created_at?: string;
}

export interface CreateProjectRequest {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  identificacion: string;
  obrero: string;
  costoServicio: string;
  abono: string;
  factura?: string;
  valorRetencion?: string;
  valor_iva?: number;
  valor_re?: number;
  metodoDePago: string;
  estado: ProjectStatus;
}

export interface UpdateProjectRequest {
  fecha?: string;
  solicitante?: string;
  nombreProyecto?: string;
  identificacion: string;
  obrero?: string;
  costoServicio?: string;
  abono?: string;
  factura?: string;
  valorRetencion?: string;
  valor_iva?: number;
  valor_re?: number;
  metodoDePago?: string;
  estado?: ProjectStatus;
}

// =============== GASTOS DE PROYECTO ===============
export interface ProjectExpense {
  id: number;
  proyectoId: number;
  camioneta: string;
  campo: string;
  obreros: string;
  comidas: string;
  otros: string;
  peajes: string;
  combustible: string;
  hospedaje: string;
  otrosCampos: Record<string, number> | null;
}

export interface CreateProjectExpenseRequest {
  proyectoId: number;
  camioneta: string;
  campo: string;
  obreros: string;
  comidas: string;
  otros: string;
  peajes: string;
  combustible: string;
  hospedaje: string;
  otrosCampos?: Record<string, number>;
}

export interface UpdateProjectExpenseRequest {
  camioneta?: string;
  campo?: string;
  obreros?: string;
  comidas?: string;
  otros?: string;
  peajes?: string;
  combustible?: string;
  hospedaje?: string;
  otrosCampos?: Record<string, number>;
}

// =============== LISTAS Y RESPUESTAS ===============
export interface ProjectsListResponse {
  data: Project[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: string;
  totalPayments: string;
  pendingAmount: string;
  monthlyStats: MonthlyProjectStats[];
}

export interface MonthlyProjectStats {
  month: string;
  count: number;
  value: string;
}

// =============== PAGOS ===============
export interface PaymentRequest {
  amount: string;
  date: string;
  method: string;
  description?: string;
}

// =============== FILTROS ===============
export interface ProjectFilters {
  // Estados
  status?: ProjectStatus | ProjectStatus[];

  // Fechas
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // Búsqueda por texto
  search?: string; // Búsqueda general
  solicitante?: string;
  nombreProyecto?: string;
  identificacion: string;
  obrero?: string;

  // Métodos de pago
  metodoDePago?: "efectivo" | "transferencia" | "cheque" | "credito";

  // Rangos de valores monetarios
  minCostoServicio?: number;
  maxCostoServicio?: number;
  minAbono?: number;
  maxAbono?: number;

  // Filtros de retención e impuestos
  hasRetencion?: boolean; // Si tiene valor de retención > 0
  hasIva?: boolean; // Si tiene IVA > 0

  // Filtros booleanos
  hasFactura?: boolean; // Si tiene número de factura
  hasExpenses?: boolean; // Si tiene gastos asociados

  // Ordenamiento
  sortBy?:
    | "id"
    | "fecha"
    | "solicitante"
    | "nombreProyecto"
    | "costoServicio"
    | "abono"
    | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;

  // Índice de cadena para compatibilidad con useUrlFilters
  [key: string]: string | number | boolean | undefined | string[];
}

export interface ProjectExpenseFilters {
  // Por proyecto
  proyectoId?: number;
  proyectoIds?: number[];

  // Rangos de gastos
  minCamioneta?: number;
  maxCamioneta?: number;
  minCampo?: number;
  maxCampo?: number;
  minObreros?: number;
  maxObreros?: number;

  // Filtros de gastos específicos
  hasCombustible?: boolean;
  hasHospedaje?: boolean;
  hasPeajes?: boolean;
  hasOtros?: boolean;

  // Rangos de totales
  minTotal?: number;
  maxTotal?: number;

  // Ordenamiento
  sortBy?: "id" | "proyectoId" | "camioneta" | "campo" | "total";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

// =============== VALORES POR DEFECTO ===============
export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  status: undefined,
  startDate: undefined,
  endDate: undefined,
  search: undefined,
  solicitante: undefined,
  nombreProyecto: undefined,
  identificacion: "",
  obrero: undefined,
  metodoDePago: undefined,
  minCostoServicio: undefined,
  maxCostoServicio: undefined,
  minAbono: undefined,
  maxAbono: undefined,
  hasRetencion: undefined,
  hasIva: undefined,
  hasFactura: undefined,
  hasExpenses: undefined,
  sortBy: "fecha",
  sortOrder: "DESC",
  page: 1,
  limit: 10,
};
