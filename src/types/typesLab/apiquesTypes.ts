/**
 * Tipos TypeScript para Apiques (Calicatas de prueba)
 * Basado en la estructura de base de datos - tabla: apiques
 */

// ================== INTERFACE PRINCIPAL ==================

export interface Apique {
  apique_id: number;
  apique?: number; // Número identificador del apique
  id: number; // ID del proyecto relacionado
  location?: string;
  depth?: number; // Profundidad total en metros
  date?: string; // Formato ISO date string
  cbr_unaltered?: boolean; // Indica si tiene CBR inalterado
  depth_tomo?: number; // Profundidad de toma de muestra
  molde?: number;
}

// ================== DTOs PARA CREAR/ACTUALIZAR ==================

export interface CreateApiqueDto {
  apique?: number;
  id: number; // ID del proyecto (requerido)
  location?: string;
  depth?: number;
  date?: string;
  cbr_unaltered?: boolean;
  depth_tomo?: number;
  molde?: number;
}

export interface UpdateApiqueDto {
  apique?: number;
  location?: string;
  depth?: number;
  date?: string;
  cbr_unaltered?: boolean;
  depth_tomo?: number;
  molde?: number;
}

// ================== TIPOS DE RESPUESTA ==================

export interface ApiqueResponse {
  apique: Apique;
  message?: string;
}

export interface ApiquesListResponse {
  apiques: Apique[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

// ================== FILTROS Y PARÁMETROS ==================

export interface ApiqueFilters {
  projectId?: number;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  depthMin?: number;
  depthMax?: number;
  cbrUnaltered?: boolean;
}

export interface ApiqueQueryParams extends ApiqueFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Apique;
  sortOrder?: "ASC" | "DESC";
}
