/**
 * Interfaces de Apiques
 * @file apiques.ts
 * @description Todas las interfaces relacionadas con apiques (test pits) y capas
 */

import type { Project } from "./projects";

// =============== APIQUE INTERFACES ===============
export interface Apique {
  id: number;
  projectId: number;
  apique: number;
  location: string;
  depth: string;
  date: string;
  cbr_unaltered: number;
  depth_tomo: string;
  molde: number;
  created_at: string;
  updated_at: string;
  project?: Project;
  layers?: ApiqueLayer[];
}

export interface ApiqueLayer {
  id: number;
  apiqueId: number;
  layerNumber: number;
  thickness: string;
  sampleId?: string;
  observation?: string;
}

// =============== CREATE/UPDATE INTERFACES ===============
export interface CreateApiqueRequest {
  projectId: number;
  apique: number;
  location: string;
  depth: string;
  date: string;
  cbr_unaltered: number;
  depth_tomo: string;
  molde: number;
}

export interface UpdateApiqueRequest {
  apique?: number;
  location?: string;
  depth?: string;
  date?: string;
  cbr_unaltered?: number;
  depth_tomo?: string;
  molde?: number;
}

export interface CreateApiqueLayerRequest {
  apiqueId: number;
  layerNumber: number;
  thickness: string;
  sampleId?: string;
  observation?: string;
}

export interface UpdateApiqueLayerRequest {
  layerNumber?: number;
  thickness?: string;
  sampleId?: string;
  observation?: string;
}

// =============== LISTAS Y RESPUESTAS ===============
export interface ApiquesListResponse {
  data: Apique[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectWithApiques {
  proyecto_id: number;
  nombre_proyecto: string;
  solicitante: string;
  obrero: string;
  fecha: string;
  estado: string;
  total_apiques: number;
  apiques: ApiqueWithLayers[];
}

export interface ApiqueWithLayers {
  apique_id: number;
  apique: number;
  location: string;
  depth: string;
  date: string;
  cbr_unaltered: number;
  depth_tomo: string;
  molde: number;
  total_layers: number;
  layers: ApiqueLayer[];
}

export interface ApiqueStatistics {
  projectId: number;
  totalApiques: number;
  averageDepth: number;
  maxDepth: number;
  minDepth: number;
  totalLayers: number;
  averageLayersPerApique: number;
  cbrDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  depthDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

// =============== FILTROS ===============
export interface ApiqueFilters {
  // Por proyecto
  projectId?: number;
  projectIds?: number[];

  // Número de apique
  apique?: number;
  apiqueMin?: number;
  apiqueMax?: number;

  // Ubicación
  location?: string;
  locationContains?: string;

  // Profundidad
  depth?: string;
  depthMin?: number;
  depthMax?: number;

  // Fechas
  date?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // CBR
  cbrMin?: number;
  cbrMax?: number;

  // Profundidad de toma
  depthTomoMin?: number;
  depthTomoMax?: number;

  // Molde
  molde?: number;
  moldeMin?: number;
  moldeMax?: number;

  // Filtros de capas
  hasLayers?: boolean;
  minLayers?: number;
  maxLayers?: number;

  // Búsqueda general
  search?: string;

  // Ordenamiento
  sortBy?:
    | "id"
    | "apique"
    | "location"
    | "depth"
    | "date"
    | "cbr_unaltered"
    | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

export interface ApiqueLayerFilters {
  // Por apique
  apiqueId?: number;
  apiqueIds?: number[];

  // Número de capa
  layerNumber?: number;
  layerNumberMin?: number;
  layerNumberMax?: number;

  // Espesor
  thickness?: string;
  thicknessMin?: number;
  thicknessMax?: number;

  // Muestra
  sampleId?: string;
  hasSampleId?: boolean;

  // Observaciones
  hasObservation?: boolean;
  observationContains?: string;

  // Búsqueda general
  search?: string;

  // Ordenamiento
  sortBy?: "id" | "layerNumber" | "thickness" | "sampleId";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

// =============== VALIDACIONES ===============
export interface ApiqueValidationRules {
  apique: {
    min: number;
    max: number;
    required: boolean;
  };
  location: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  depth: {
    pattern: string; // Regex para validar formato
    required: boolean;
  };
  cbr_unaltered: {
    min: number;
    max: number;
    required: boolean;
  };
  depth_tomo: {
    pattern: string;
    required: boolean;
  };
  molde: {
    min: number;
    max: number;
    required: boolean;
  };
}

export interface LayerValidationRules {
  layerNumber: {
    min: number;
    max: number;
    required: boolean;
  };
  thickness: {
    pattern: string;
    min: number;
    required: boolean;
  };
  sampleId: {
    pattern: string;
    maxLength: number;
    required: boolean;
  };
  observation: {
    maxLength: number;
    required: boolean;
  };
}

// =============== DTOs (Para compatibilidad) ===============
export type CreateApiqueDto = CreateApiqueRequest;
export type UpdateApiqueDto = UpdateApiqueRequest;
