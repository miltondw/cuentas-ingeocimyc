/**
 * Tipos para el módulo financiero
 * Basados en la estructura real de la base de datos del backend
 */

// Tipos base de la tabla proyectos
export interface Project {
  id: number;
  fecha: string; // date
  solicitante: string;
  nombreProyecto: string;
  identificacion: string; // Identificación del solicitante
  obrero: string;
  costoServicio: number; // decimal(15,2)
  abono?: number; // decimal(15,2), default 0.00
  factura?: string;
  valorRetencion?: number; // decimal(10,2), default 0.00
  metodoDePago?: "efectivo" | "transferencia" | "cheque" | "credito";
}

// Tipos para gastos de proyectos (tabla separada)
export interface ProjectExpenses {
  gasto_proyecto_id?: number;
  id?: number;
  camioneta?: number; // decimal(15,2)
  campo?: number; // decimal(15,2)
  obreros?: number; // decimal(15,2)
  comidas?: number; // decimal(15,2)
  otros?: number; // decimal(15,2)
  peajes?: number; // decimal(15,2)
  combustible?: number; // decimal(15,2)
  hospedaje?: number; // decimal(15,2)
  otrosCampos?: Record<string, number>; // JSON field for additional expenses
}

// DTO para crear proyecto (sin IDs autogenerados)
export interface CreateProjectDto {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  identificacion: string;
  obrero: string;
  costoServicio: number;
  abono?: number;
  factura?: string;
  valorRetencion?: number;
  metodoDePago?: "efectivo" | "transferencia" | "cheque" | "credito";
}

// DTO para actualizar proyecto
export type UpdateProjectDto = Partial<CreateProjectDto>;

// DTO para crear gastos de proyecto
export interface CreateProjectExpensesDto {
  id: number;
  camioneta?: number;
  campo?: number;
  obreros?: number;
  comidas?: number;
  otros?: number;
  peajes?: number;
  combustible?: number;
  hospedaje?: number;
  otrosCampos?: Record<string, number>;
}

// Respuesta completa del proyecto con gastos
export interface ProjectWithExpenses extends Project {
  expenses?: ProjectExpenses;
}

// Tipos para filtros y paginación
export interface ProjectFilters {
  solicitante?: string;
  nombreProyecto?: string;
  identificacion: string;
  obrero?: string;
  metodoDePago?: "efectivo" | "transferencia" | "cheque" | "credito";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "fecha" | "nombreProyecto" | "solicitante" | "costoServicio";
  sortOrder?: "ASC" | "DESC";
}

// Tipos de métodos de pago
export type PaymentMethod = "efectivo" | "transferencia" | "cheque" | "credito";

// Para compatibilidad temporal con el componente existente
export interface ExtraExpense {
  description: string;
  amount: number;
}

export interface ProjectDetails {
  id: number;
  name: string;
  location: string;
  client: string;
  expenses?: ProjectExpenses;
  valuation: number;
  porcentaje_utilidad: number;
  utilidad: number;
  monto_total: number;
  presupuesto: number;
  categoria: ProjectCategory;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  created_at?: string;
  updated_at?: string;
}

export type ProjectCategory =
  | "Laboratorio"
  | "Topografía"
  | "Estructural"
  | "Consultoría"
  | "Otros";

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  totalValue: number;
  byCategory: Record<ProjectCategory, number>;
  recentProjects: ProjectDetails[];
}
