/**
 * Tipos TypeScript para Proyectos
 * Basado en la estructura de base de datos - tabla: proyectos
 */

// ================== INTERFACE PRINCIPAL ==================

export interface Proyecto {
  id: number;
  fecha: string; // Formato ISO date string
  solicitante: string;
  nombreProyecto: string;
  obrero: string;
  costoServicio: number;
  abono?: number;
  factura?: string;
  valorRetencion?: number;
  metodoDePago?: string;
}

// ================== DTOs PARA CREAR/ACTUALIZAR ==================

export interface CreateProyectoDto {
  fecha: string;
  solicitante: string;
  nombreProyecto: string;
  obrero: string;
  costoServicio: number;
  abono?: number;
  factura?: string;
  valorRetencion?: number;
  metodoDePago?: string;
}

export interface UpdateProyectoDto {
  fecha?: string;
  solicitante?: string;
  nombreProyecto?: string;
  obrero?: string;
  costoServicio?: number;
  abono?: number;
  factura?: string;
  valorRetencion?: number;
  metodoDePago?: string;
}

// ================== TIPOS DE RESPUESTA ==================

export interface ProyectoResponse {
  proyecto: Proyecto;
  message?: string;
}

export interface ProyectosListResponse {
  proyectos: Proyecto[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ================== TIPOS COMPUESTOS ==================

export interface ProyectoWithDetails extends Proyecto {
  perfiles?: Array<{
    id: number;
    sounding_number: string;
    location?: string;
    depth?: number;
    profile_date?: string;
  }>;
  apiques?: Array<{
    apique_id: number;
    apique?: number;
    location?: string;
    depth?: number;
    date?: string;
  }>;
  gastos?: Array<{
    gasto_proyecto_id: number;
    camioneta?: number;
    campo?: number;
    obreros?: number;
    comidas?: number;
    otros?: number;
    peajes?: number;
    combustible?: number;
    hospedaje?: number;
  }>;
}

export interface ProyectoSummary {
  id: number;
  nombreProyecto: string;
  solicitante: string;
  fecha: string;
  costoServicio: number;
  abono?: number;
  saldo: number;
  perfilesCount?: number;
  apiquesCount?: number;
  estado: "pendiente" | "en_proceso" | "completado" | "facturado";
}

// ================== FILTROS Y PARÁMETROS ==================

export interface ProyectoFilters {
  solicitante?: string;
  nombreProyecto?: string;
  obrero?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  costoMin?: number;
  costoMax?: number;
  metodoDePago?: string;
  conSaldo?: boolean; // Para filtrar proyectos con saldo pendiente
}

export interface ProyectoQueryParams extends ProyectoFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Proyecto;
  sortOrder?: "ASC" | "DESC";
  includeDetails?: boolean;
}

// ================== TIPOS PARA ESTADÍSTICAS ==================

export interface ProyectoStats {
  totalProyectos: number;
  ingresosTotales: number;
  abonosTotales: number;
  saldoPendiente: number;
  proyectosPorMes: Array<{
    mes: string;
    cantidad: number;
    ingresos: number;
  }>;
  clientesFrecuentes: Array<{
    solicitante: string;
    proyectos: number;
    ingresoTotal: number;
  }>;
}

// ================== ENUMS Y CONSTANTES ==================

export enum MetodoPago {
  EFECTIVO = "efectivo",
  TRANSFERENCIA = "transferencia",
  CHEQUE = "cheque",
  CREDITO = "credito",
}

export enum EstadoProyecto {
  PENDIENTE = "pendiente",
  EN_PROCESO = "en_proceso",
  COMPLETADO = "completado",
  FACTURADO = "facturado",
}
