/**
 * Filtros para la API de laboratorio
 */

import type { BaseFilters } from "@/lib/axios/apiClient";

// =============== FILTROS PARA PROYECTOS DE LABORATORIO ===============
export interface LabProjectFilters extends BaseFilters {
  // Filtros de búsqueda
  nombreProyecto?: string;
  solicitante?: string;
  obrero?: string;

  // Filtros de estado
  estado?: "todos" | "activo" | "completado" | "cancelado" | "pausado";

  // Filtros de fecha
  startDate?: string; // Formato: YYYY-MM-DD
  endDate?: string; // Formato: YYYY-MM-DD

  // Filtros de conteo
  hasApiques?: boolean; // true: con apiques, false: sin apiques
  hasProfiles?: boolean; // true: con perfiles, false: sin perfiles
  minApiques?: number; // Mínimo número de apiques
  maxApiques?: number; // Máximo número de apiques
  minProfiles?: number; // Mínimo número de perfiles
  maxProfiles?: number; // Máximo número de perfiles

  // Paginación y ordenamiento
  page?: number; // Página actual (default: 1)
  limit?: number; // Elementos por página (default: 10)
  sortBy?:
    | "proyecto_id"
    | "nombre_proyecto"
    | "solicitante"
    | "fecha"
    | "estado"
    | "total_apiques"
    | "total_profiles";
  sortOrder?: "ASC" | "DESC"; // Orden (default: DESC)

  // Hacer que sea compatible con Record<string, FilterValue>
  [key: string]: string | number | boolean | undefined | null;
}

// =============== FILTROS PARA APIQUES ===============
export interface ApiquesFilters extends BaseFilters {
  // Filtro principal (requerido para la API específica de apiques por proyecto)
  projectId?: number;

  // Filtros de muestra
  sampleNumber?: string; // Número de muestra
  apique?: number; // Número del apique
  depth?: string; // Profundidad específica
  minDepth?: number; // Profundidad mínima
  maxDepth?: number; // Profundidad máxima

  // Filtros de ubicación
  location?: string; // Ubicación de la muestra

  // Filtros de fecha
  collectionDate?: string; // Fecha de recolección (ISO)
  date?: string; // Alias para collectionDate
  startDate?: string; // Rango de fechas
  endDate?: string;

  // Filtros de estado/características
  cbr_unaltered?: boolean; // Si tiene CBR inalterado
  molde?: number; // Número de molde
  hasLayers?: boolean; // Si tiene capas
  minLayers?: number; // Número mínimo de capas
  maxLayers?: number; // Número máximo de capas

  // Campos de ordenamiento disponibles
  sortBy?:
    | "apique_id"
    | "apique"
    | "location"
    | "depth"
    | "date"
    | "cbr_unaltered"
    | "total_layers"
    | "created_at"
    | "updated_at";

  // Hacer que sea compatible con Record<string, FilterValue>
  [key: string]: string | number | boolean | undefined | null;
}

// =============== FILTROS PARA PROFILES ===============
export interface ProfilesFilters extends BaseFilters {
  // Filtro principal (requerido para la API específica de profiles por proyecto)
  projectId?: number;

  // Filtros de perfil
  soundingNumber?: string; // Número del sondeo
  profileNumber?: string; // Alias para soundingNumber
  waterLevel?: string; // Nivel de agua
  samplesNumber?: number; // Número de muestras

  // Filtros de ubicación
  location?: string; // Ubicación del perfil

  // Filtros de fecha
  profileDate?: string; // Fecha del perfil (ISO)
  startDate?: string; // Rango de fechas
  endDate?: string;

  // Filtros de características
  hasBlows?: boolean; // Si tiene golpes SPT
  minBlows?: number; // Número mínimo de golpes
  maxBlows?: number; // Número máximo de golpes

  // Campos de ordenamiento disponibles
  sortBy?:
    | "id"
    | "soundingNumber"
    | "waterLevel"
    | "profileDate"
    | "samplesNumber"
    | "location"
    | "created_at"
    | "updatedAt";

  // Hacer que sea compatible con Record<string, FilterValue>
  [key: string]: string | number | boolean | undefined | null;
}

// =============== TIPOS ÚTILES PARA URL PARAMS ===============
export type FilterValue = string | number | boolean | undefined | null;

export interface UrlParamsState {
  [key: string]: FilterValue;
}

// =============== VALORES POR DEFECTO ===============
export const DEFAULT_LAB_PROJECT_FILTERS: LabProjectFilters = {
  page: 1,
  limit: 10,
  sortBy: "fecha",
  sortOrder: "DESC",
  estado: "todos",
};

export const DEFAULT_APIQUES_FILTERS: ApiquesFilters = {
  page: 1,
  limit: 10,
  sortBy: "date",
  sortOrder: "DESC",
};

export const DEFAULT_PROFILES_FILTERS: ProfilesFilters = {
  page: 1,
  limit: 10,
  sortBy: "profileDate",
  sortOrder: "DESC",
};
