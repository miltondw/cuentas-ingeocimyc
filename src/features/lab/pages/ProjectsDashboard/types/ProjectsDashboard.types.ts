// Respuesta paginada de proyectos de laboratorio
import { ProjectAssayStatus, ProjectStatus } from "@/types/system";
export interface LabProjectsResponse {
  data: LabProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalApiques: number;
    totalProfiles: number;
    projectsWithApiques: number;
    projectsWithProfiles: number;
  };
}
// Re-exporta los tipos para uso en los módulos del dashboard
export type { LabProjectFilters } from "@/types/labFilters";
export type { ColumnConfig } from "@/components/common/DataTable";

export interface LocalSearchInputs {
  search: string;
  nombreProyecto: string;
  solicitante: string;
}

export interface EstadoOption {
  value: string;
  label: string;
}

export interface BooleanFilterOption {
  value: string;
  label: string;
}

export interface NumericFilterField {
  key: string;
  label: string;
}

export interface AssayCategory {
  id: number;
  code: string;
  name: string;
}

// Ensayo simple (como lo retorna /lab/assays/by-category)
export interface SimpleAssay {
  id: number;
  code: string;
  name: string;
}

// Categoría de ensayo (como lo retorna /lab/assays/by-category)
export interface AssayCategoryApi {
  id: number;
  code: string;
  name: string;
}

// Respuesta de /lab/assays/by-category
export interface AssaysByCategoryApi {
  category: AssayCategoryApi;
  ensayos: SimpleAssay[];
}

// Ensayo completo (usado en proyectos, con categorías)
export interface Assay {
  id: number;
  code: string;
  name: string;
  categories?: AssayCategory[];
  category?: AssayCategory | null;
}

// Info de asignación de ensayo a un proyecto
export interface AssayInfo {
  id: number;
  assignedAt?: string;
  status?: ProjectAssayStatus;
  name?: string; // Para compatibilidad con SimpleAssay
  code?: string;
  assay?: Assay;
}

export interface LabProject {
  proyecto_id: number;
  nombre_proyecto: string;
  solicitante: string;
  fecha: string;
  total_apiques: number;
  total_profiles: number;
  created_at: string;
  estado: ProjectStatus; // Campo global del proyecto
  identificacion?: string; // Nuevo campo agregado
  assigned_assays: AssayInfo[];
  apique_ids: number[];
  profile_ids: number[];
  // ...otros campos si los hay
}
