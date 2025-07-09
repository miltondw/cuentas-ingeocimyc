/**
 * Tipos de proyectos financieros
 */

// =============== DATOS DE FORMULARIO ===============
export interface ProjectFormData {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  finances: ProjectFinanceForm[];
  expenses: ProjectExpenseForm[];
}

export interface ProjectFinanceForm {
  obrero: string;
  costoServicio: number;
  abono: number;
  factura: string;
  valorRetencion: number;
  metodoDePago: "efectivo" | "transferencia" | "cheque" | "credito";
  estado: string;
}

export interface ProjectExpenseForm {
  camioneta: number;
  campo: number;
  obreros: number;
  comidas: number;
  otros: number;
  peajes: number;
  combustible: number;
  hospedaje: number;
  otrosCampos: Record<string, number>;
}

// =============== DTOs PARA API ===============
export interface CreateProjectDto {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  finances: import("@/types/typesProject/projectTypes").ProjectFinance[];
  expenses: import("@/types/typesProject/projectTypes").CreateProjectExpensesDto[];
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id: number;
}
