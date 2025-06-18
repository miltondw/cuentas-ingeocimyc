/**
 * Interfaces Financieras
 * @file financial.ts
 * @description Todas las interfaces relacionadas con finanzas, gastos y reportes
 */

// =============== GASTOS DE EMPRESA ===============
export interface CompanyExpense {
  id: number;
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  otrosCampos?: Record<string, string | number>;
  created_at: string;
  updated_at?: string;
}

export interface CreateCompanyExpenseRequest {
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  otrosCampos?: Record<string, string | number>;
}

export interface UpdateCompanyExpenseRequest {
  mes?: string;
  salarios?: number;
  luz?: number;
  agua?: number;
  arriendo?: number;
  internet?: number;
  salud?: number;
  otrosCampos?: Record<string, string | number>;
}

// =============== GASTOS DE PROYECTO ===============
export interface ProjectExpenseFinancial {
  id: number;
  proyectoId: number;
  camioneta: number;
  campo: number;
  obreros: number;
  comidas: number;
  otros: number;
  peajes: number;
  combustible: number;
  hospedaje: number;
  otrosCampos?: Record<string, string | number>;
  created_at: string;
  updated_at?: string;
}

export interface CreateProjectExpenseFinancialRequest {
  proyectoId: number;
  camioneta: number;
  campo: number;
  obreros: number;
  comidas: number;
  otros: number;
  peajes: number;
  combustible: number;
  hospedaje: number;
  otrosCampos?: Record<string, string | number>;
}

export interface UpdateProjectExpenseFinancialRequest {
  camioneta?: number;
  campo?: number;
  obreros?: number;
  comidas?: number;
  otros?: number;
  peajes?: number;
  combustible?: number;
  hospedaje?: number;
  otrosCampos?: Record<string, string | number>;
}

// =============== RESUMEN FINANCIERO ===============
export interface FinancialSummary {
  id: number;
  project_id: number;
  fecha: string;
  total_ingresos: number;
  total_gastos: number;
  utilidad: number;
  porcentaje_utilidad: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateFinancialSummaryRequest {
  project_id: number;
  fecha: string;
  total_ingresos: number;
  total_gastos: number;
}

export interface UpdateFinancialSummaryRequest {
  project_id?: number;
  fecha?: string;
  total_ingresos?: number;
  total_gastos?: number;
}

// =============== REPORTES FINANCIEROS ===============
export interface MonthlyFinancialReport {
  mes: string;
  año: number;
  ingresos: {
    total: number;
    proyectos: number;
    servicios: number;
    otros: number;
  };
  gastos: {
    total: number;
    empresa: number;
    proyectos: number;
    operacionales: number;
  };
  utilidad: {
    bruta: number;
    neta: number;
    margen: number;
  };
  proyectos: {
    activos: number;
    completados: number;
    nuevos: number;
  };
}

export interface YearlyFinancialReport {
  año: number;
  resumenAnual: {
    totalIngresos: number;
    totalGastos: number;
    utilidadNeta: number;
    margenUtilidad: number;
  };
  mesesReporte: MonthlyFinancialReport[];
  tendencias: {
    ingresosTrend: "creciente" | "decreciente" | "estable";
    gastosTrend: "creciente" | "decreciente" | "estable";
    utilidadTrend: "creciente" | "decreciente" | "estable";
  };
  proyecciones: {
    ingresosProyectados: number;
    gastosProyectados: number;
    utilidadProyectada: number;
  };
}

export interface ProjectFinancialAnalysis {
  projectId: number;
  nombreProyecto: string;
  costoTotal: number;
  abonos: number;
  saldoPendiente: number;
  gastosProyecto: number;
  utilidadBruta: number;
  utilidadNeta: number;
  margenUtilidad: number;
  roi: number; // Return on Investment
  estadoPago: "pendiente" | "parcial" | "completo";
  diasVencimiento?: number;
}

// =============== LISTAS Y RESPUESTAS ===============
export interface FinancialListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FinancialDashboard {
  resumenMensual: MonthlyFinancialReport;
  proyectosRecientes: ProjectFinancialAnalysis[];
  gastosRecientes: CompanyExpense[];
  indicadoresClaves: {
    ingresosMensuales: number;
    gastosMensuales: number;
    utilidadMensual: number;
    margenUtilidad: number;
    proyectosActivos: number;
    proyectosVencidos: number;
  };
  alertas: FinancialAlert[];
}

export interface FinancialAlert {
  id: string;
  tipo: "vencimiento" | "bajo_margen" | "gasto_alto" | "ingreso_bajo";
  severidad: "baja" | "media" | "alta" | "crítica";
  titulo: string;
  descripcion: string;
  fecha: string;
  accionRecomendada?: string;
}

// =============== FILTROS ===============
export interface CompanyExpenseFilters {
  // Período
  mes?: string;
  año?: number;
  startDate?: string;
  endDate?: string;

  // Rangos de gastos
  salariosMin?: number;
  salariosMax?: number;
  arriendoMin?: number;
  arriendoMax?: number;
  totalMin?: number;
  totalMax?: number;

  // Categorías específicas
  hasOtrosCampos?: boolean;

  // Ordenamiento
  sortBy?: "id" | "mes" | "salarios" | "arriendo" | "total" | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

export interface ProjectExpenseFinancialFilters {
  // Por proyecto
  proyectoId?: number;
  proyectoIds?: number[];

  // Rangos de gastos
  camionetaMin?: number;
  camionetaMax?: number;
  campoMin?: number;
  campoMax?: number;
  obrerosMin?: number;
  obrerosMax?: number;
  totalMin?: number;
  totalMax?: number;

  // Fechas (a través del proyecto)
  startDate?: string;
  endDate?: string;

  // Categorías específicas
  hasCombustible?: boolean;
  hasHospedaje?: boolean;
  hasOtrosCampos?: boolean;

  // Ordenamiento
  sortBy?: "id" | "proyectoId" | "camioneta" | "campo" | "total" | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

export interface FinancialSummaryFilters {
  // Por proyecto
  project_id?: number;
  project_ids?: number[];

  // Fechas
  fecha?: string;
  startDate?: string;
  endDate?: string;
  año?: number;
  mes?: number;

  // Rangos financieros
  ingresosMín?: number;
  ingresosMax?: number;
  gastosMín?: number;
  gastosMax?: number;
  utilidadMín?: number;
  utilidadMax?: number;
  margenMín?: number;
  margenMax?: number;

  // Filtros de rentabilidad
  soloRentables?: boolean;
  soloPerdidas?: boolean;

  // Ordenamiento
  sortBy?:
    | "id"
    | "fecha"
    | "total_ingresos"
    | "total_gastos"
    | "utilidad"
    | "porcentaje_utilidad";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

// =============== VALIDACIONES ===============
export interface FinancialValidationRules {
  companyExpense: {
    mes: {
      pattern: string;
      required: boolean;
    };
    amounts: {
      min: number;
      max: number;
      precision: number;
    };
  };
  projectExpense: {
    amounts: {
      min: number;
      max: number;
      precision: number;
    };
  };
  financialSummary: {
    amounts: {
      min: number;
      max: number;
      precision: number;
    };
    fecha: {
      format: string;
      required: boolean;
    };
  };
}
