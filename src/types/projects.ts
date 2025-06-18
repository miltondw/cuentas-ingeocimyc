/**
 * Interfaces de Proyectos
 * @file projects.ts
 * @description Todas las interfaces relacionadas con proyectos y gastos
 */

// =============== TIPOS BASE ===============
export type ProjectStatus = "activo" | "completado" | "cancelado" | "pausado";

// =============== PROYECTO INTERFACES ===============
export interface Project {
  id: number;
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  obrero: string;
  costoServicio: string;
  abono: string;
  factura: string; // Puede estar vacío "" pero siempre presente
  valorRetencion: string; // Puede ser "0.00" pero siempre presente
  valor_iva: number;
  valor_re: number;
  metodoDePago: string;
  estado: ProjectStatus;
  created_at: string;
  expenses?: ProjectExpense[];
}

export interface CreateProjectRequest {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
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
