// Respuesta paginada de proyectos de laboratorio
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

export interface Assay {
  id: number;
  code: string;
  name: string;
  categories: AssayCategory[];
  category?: AssayCategory | null; // Para compatibilidad con la UI
}

export interface AssayInfo {
  id: number;
  assignedAt: string;
  status: string;
  assay: Assay;
}

export interface LabProject {
  proyecto_id: number;
  nombre_proyecto: string;
  solicitante: string;
  fecha: string;
  total_apiques: number;
  total_profiles: number;
  created_at: string;
  assigned_assays: AssayInfo[];
  apique_ids: number[];
  profile_ids: number[];
  // ...otros campos si los hay
}
