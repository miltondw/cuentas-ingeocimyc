/**
 * Tipos para el formulario de creación de proyectos
 */
import { ProjectStatus } from "@/types/projects";
import type { SimpleAssay } from "@/features/lab/pages/ProjectsDashboard/types/ProjectsDashboard.types";
import type { PaymentMethod } from "@/types/typesProject/projectTypes";

export interface ProjectFormData {
  basicInfo: {
    nombreProyecto: string;
    solicitante: string;
    identificacion: string;
    fecha: string;
    estado: ProjectStatus;
  };
  finances: {
    obrero: string;
    costoServicio: number;
    abono: number;
    factura: string;
    valorRetencion: number;
    metodoDePago: PaymentMethod;
  };
  expenses: {
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
  assays: AssayFormItem[];
}

export interface AssayFormItem {
  id: number;
  code: string;
  name: string;
  categoryId?: number;
  categoryName?: string;
}

export interface AssayCategory {
  id: number;
  code: string;
  name: string;
}

export interface AssayWithCategory extends SimpleAssay {
  category: AssayCategory;
}

export interface AssaysByCategory {
  category: AssayCategory;
  ensayos: SimpleAssay[];
}

export interface ExtraField {
  id: string;
  description: string;
  value: number;
}

export interface ServiceRequestSummary {
  id: number;
  nameProject: string;
  name: string; // cliente
  identification: string;
  status: string;
  createdAt: string;
  servicesCount: number;
}

/**
 * Interfaz para manejar las diferentes estructuras que pueden tener los ensayos asignados
 * desde la respuesta de la API del proyecto
 */
export interface AssayResponseItem {
  id?: number;
  assayId?: number;
  name?: string;
  code?: string;
  status?: string;
  assay?: {
    id: number;
    code?: string;
    name?: string;
    categories?: Array<{ id: number; name: string }>;
  };
}
