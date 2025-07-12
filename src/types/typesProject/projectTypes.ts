/**
 * Tipos para el módulo financiero
 * Basados en la estructura real de la base de datos del backend
 */

// Tipos base de la tabla proyectos
// DEPRECATED: Usar el tipo Project de '@/types/projects' en todo el frontend
// export interface Project {
//   id: number;
//   fecha: string; // date
//   solicitante: string;
//   nombreProyecto: string;
//   finanzas: ProjectFinance[];
//   expenses: CreateProjectExpensesDto[];
// }

// Nuevo tipo para finanzas
export interface ProjectFinance {
  obrero: string;
  costoServicio: number;
  abono: number;
  factura: string;
  valorRetencion: number;
  metodoDePago: "efectivo" | "transferencia" | "cheque" | "credito";
  estado: string;
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
  finances: ProjectFinance[];
  expenses: CreateProjectExpensesDto[];
}

// DTO para actualizar proyecto
export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id?: number;
}

// DTO para crear gastos de proyecto
export interface CreateProjectExpensesDto {
  project_id?: number;
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
import type { Project as MainProject } from "@/types/projects";
export interface ProjectWithExpenses extends MainProject {
  gastos: ProjectExpenses;
}

// Tipos para filtros y paginación
export interface ProjectFilters {
  solicitante?: string;
  nombreProyecto?: string;
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

// Estadísticas de proyectos
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalExpenses: number;
}
