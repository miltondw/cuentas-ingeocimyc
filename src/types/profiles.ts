/**
 * Interfaces de Perfiles
 * @file profiles.ts
 * @description Todas las interfaces relacionadas con perfiles SPT y golpes
 */

import type { Project } from "./projects";

// =============== PERFIL INTERFACES ===============
export interface Profile {
  id: number;
  projectId: number;
  soundingNumber: string;
  waterLevel: string;
  profileDate: string;
  samplesNumber: number;
  location?: string;
  created_at: string;
  updatedAt: string;
  project?: Project;
  blows?: ProfileBlow[];
}

export interface ProfileBlow {
  id: number;
  profileId: number;
  depth: string;
  blows6: number;
  blows12: number;
  blows18: number;
  n: number;
  observation?: string;
}

// =============== CREATE/UPDATE INTERFACES ===============
export interface CreateProfileRequest {
  projectId: number;
  soundingNumber: string;
  waterLevel: string;
  profileDate: string;
  samplesNumber: number;
  location?: string;
}

export interface UpdateProfileRequest {
  soundingNumber?: string;
  waterLevel?: string;
  profileDate?: string;
  samplesNumber?: number;
  location?: string;
}

export interface CreateBlowRequest {
  profileId: number;
  depth: string;
  blows6: number;
  blows12: number;
  blows18: number;
  n: number;
  observation?: string;
}

export interface UpdateBlowRequest {
  depth?: string;
  blows6?: number;
  blows12?: number;
  blows18?: number;
  n?: number;
  observation?: string;
}

// =============== LISTAS Y RESPUESTAS ===============
export interface ProfilesListResponse {
  data: Profile[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectWithProfiles {
  proyecto_id: number;
  nombre_proyecto: string;
  solicitante: string;
  obrero: string;
  fecha: string;
  estado: string;
  total_profiles: number;
  profiles: ProfileWithBlows[];
}

export interface ProfileWithBlows {
  profile_id: number;
  soundingNumber: string;
  waterLevel: string;
  profileDate: string;
  samplesNumber: number;
  location?: string;
  total_blows: number;
  blows: ProfileBlow[];
}

export interface ProfileStatistics {
  projectId: number;
  totalProfiles: number;
  totalBlows: number;
  averageBlowsPerProfile: number;
  maxDepth: number;
  minDepth: number;
  averageWaterLevel: number;
  nValueDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  depthDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  monthlyDistribution: {
    month: string;
    count: number;
  }[];
}

// =============== ANÁLISIS SPT ===============
export interface SPTAnalysis {
  profileId: number;
  soundingNumber: string;
  totalDepth: number;
  waterLevel: number;
  blowsAnalysis: BlowAnalysis[];
  summary: SPTSummary;
  recommendations: string[];
  soilClassification: SoilClassification[];
}

export interface BlowAnalysis {
  depth: number;
  n: number;
  consistency:
    | "muy blanda"
    | "blanda"
    | "media"
    | "firme"
    | "muy firme"
    | "dura";
  bearingCapacity: number;
  recommendation: string;
}

export interface SPTSummary {
  averageN: number;
  maxN: number;
  minN: number;
  consistencyProfile: string;
  recommendedFoundationDepth: number;
  estimatedBearingCapacity: number;
}

export interface SoilClassification {
  depth: number;
  soilType: string;
  description: string;
  plasticity?: string;
  density?: string;
}

// =============== FILTROS ===============
export interface ProfileFilters {
  // Por proyecto
  projectId?: number;
  projectIds?: number[];

  // Número de sondeo
  soundingNumber?: string;
  soundingNumberContains?: string;

  // Nivel freático
  waterLevel?: string;
  waterLevelMin?: number;
  waterLevelMax?: number;

  // Fechas
  profileDate?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // Muestras
  samplesNumber?: number;
  samplesNumberMin?: number;
  samplesNumberMax?: number;

  // Ubicación
  location?: string;
  locationContains?: string;
  hasLocation?: boolean;

  // Filtros de golpes
  hasBlows?: boolean;
  minBlows?: number;
  maxBlows?: number;

  // Profundidad máxima
  maxDepthMin?: number;
  maxDepthMax?: number;

  // Valores N
  nValueMin?: number;
  nValueMax?: number;
  averageNMin?: number;
  averageNMax?: number;

  // Búsqueda general
  search?: string;

  // Ordenamiento
  sortBy?:
    | "id"
    | "soundingNumber"
    | "waterLevel"
    | "profileDate"
    | "samplesNumber"
    | "created_at";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

export interface BlowFilters {
  // Por perfil
  profileId?: number;
  profileIds?: number[];

  // Profundidad
  depth?: string;
  depthMin?: number;
  depthMax?: number;

  // Golpes individuales
  blows6Min?: number;
  blows6Max?: number;
  blows12Min?: number;
  blows12Max?: number;
  blows18Min?: number;
  blows18Max?: number;

  // Valor N
  n?: number;
  nMin?: number;
  nMax?: number;

  // Observaciones
  hasObservation?: boolean;
  observationContains?: string;

  // Búsqueda general
  search?: string;

  // Ordenamiento
  sortBy?: "id" | "depth" | "blows6" | "blows12" | "blows18" | "n";
  sortOrder?: "ASC" | "DESC";

  // Paginación
  page?: number;
  limit?: number;
}

// =============== VALIDACIONES ===============
export interface ProfileValidationRules {
  soundingNumber: {
    pattern: string;
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  waterLevel: {
    pattern: string;
    required: boolean;
  };
  profileDate: {
    format: string;
    required: boolean;
  };
  samplesNumber: {
    min: number;
    max: number;
    required: boolean;
  };
  location: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
}

export interface BlowValidationRules {
  depth: {
    pattern: string;
    min: number;
    max: number;
    required: boolean;
  };
  blows6: {
    min: number;
    max: number;
    required: boolean;
  };
  blows12: {
    min: number;
    max: number;
    required: boolean;
  };
  blows18: {
    min: number;
    max: number;
    required: boolean;
  };
  n: {
    min: number;
    max: number;
    calculated: boolean;
  };
  observation: {
    maxLength: number;
    required: boolean;
  };
}

// =============== CONFIGURACIÓN SPT ===============
export interface SPTConfig {
  depthIncrement: number; // 0.45m típicamente
  depthLevels: number; // 14 niveles típicamente
  defaultBlows: {
    blows6: number;
    blows12: number;
    blows18: number;
  };
  consistencyRanges: {
    [key: string]: {
      min: number;
      max: number;
      description: string;
    };
  };
}

// =============== DTOs (Para compatibilidad) ===============
export type CreateProfileDto = CreateProfileRequest;
export type UpdateProfileDto = UpdateProfileRequest;
export type CreateBlowDto = CreateBlowRequest;
export type UpdateBlowDto = UpdateBlowRequest;
