/**
 * Tipos de proyectos financieros
 */

// =============== DATOS DE FORMULARIO ===============
export interface ProjectFormData {
  // Información básica del proyecto
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  obrero: string;
  costoServicio: number;
  abono: number;
  factura: string;
  metodoDePago: string;
  valorRetencion: number;

  // Gastos del proyecto
  gastos: {
    camioneta: number;
    campo: number;
    obreros: number;
    comidas: number;
    otros: number;
    peajes: number;
    combustible: number;
    hospedaje: number;
    otrosCampos: Record<string, number>;
  };
}

// =============== DTOs PARA API ===============
export interface CreateProjectDto {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  obrero: string;
  costoServicio: number;
  abono: number;
  factura: string;
  metodoDePago: string;
  valorRetencion: number;
  gastos: {
    camioneta: number;
    campo: number;
    obreros: number;
    comidas: number;
    otros: number;
    peajes: number;
    combustible: number;
    hospedaje: number;
    otrosCampos?: Record<string, number>;
  };
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  id: number;
}
