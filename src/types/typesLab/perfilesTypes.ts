/**
 * Tipos TypeScript para Perfiles (Sondeos geotécnicos)
 * Basado en la estructura de base de datos - tablas: perfiles, profiles, blows, layers
 */

// ================== TIPOS PARA DATOS JSON ==================

export interface ProfileData {
  soilType?: string;
  waterContent?: number;
  plasticLimit?: number;
  liquidLimit?: number;
  plasticitIndex?: number;
  classification?: string;
  [key: string]: unknown; // Para campos adicionales dinámicos
}

// ================== INTERFACES PRINCIPALES ==================

export interface Perfil {
  id: number;
  project_id: number;
  profile_date?: string; // Formato ISO date string
  samples_number?: number;
  sounding_number: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  depth?: number;
  water_level?: number;
  observations?: string;
  profile_data?: ProfileData; // JSON field
  created_at: string;
  updated_at: string;
}

export interface Profile {
  profile_id: number;
  project_id: number;
  sounding_number: string;
  water_level?: string;
  profile_date?: string; // Formato ISO date string
  samples_number?: number;
  created_at: string;
  updated_at: string;
  location?: string;
}

export interface Blow {
  blow_id: number;
  profile_id: number;
  depth: number;
  blows6?: number;
  blows12?: number;
  blows18?: number;
  n?: number; // Número de golpes total
  observation?: string;
}

export interface Layer {
  layer_id: number;
  apique_id: number;
  layer_number: number;
  thickness: number; // Espesor en metros
  sample_id?: string;
  observation?: string;
}

// ================== DTOs PARA CREAR/ACTUALIZAR ==================

export interface CreatePerfilDto {
  project_id: number;
  profile_date?: string;
  samples_number?: number;
  sounding_number: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  depth?: number;
  water_level?: number;
  observations?: string;
  profile_data?: ProfileData;
}

export interface UpdatePerfilDto {
  profile_date?: string;
  samples_number?: number;
  sounding_number?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  depth?: number;
  water_level?: number;
  observations?: string;
  profile_data?: ProfileData;
}

export interface CreateProfileDto {
  project_id: number;
  sounding_number: string;
  water_level?: string;
  profile_date?: string;
  samples_number?: number;
  location?: string;
}

export interface UpdateProfileDto {
  sounding_number?: string;
  water_level?: string;
  profile_date?: string;
  samples_number?: number;
  location?: string;
}

export interface CreateBlowDto {
  profile_id: number;
  depth: number;
  blows6?: number;
  blows12?: number;
  blows18?: number;
  n?: number;
  observation?: string;
}

export interface UpdateBlowDto {
  depth?: number;
  blows6?: number;
  blows12?: number;
  blows18?: number;
  n?: number;
  observation?: string;
}

export interface CreateLayerDto {
  apique_id: number;
  layer_number: number;
  thickness: number;
  sample_id?: string;
  observation?: string;
}

export interface UpdateLayerDto {
  layer_number?: number;
  thickness?: number;
  sample_id?: string;
  observation?: string;
}

// ================== TIPOS DE RESPUESTA ==================

export interface PerfilResponse {
  perfil: Perfil;
  message?: string;
}

export interface PerfilesListResponse {
  perfiles: Perfil[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface ProfileResponse {
  profile: Profile;
  message?: string;
}

export interface ProfilesListResponse {
  profiles: Profile[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface BlowResponse {
  blow: Blow;
  message?: string;
}

export interface BlowsListResponse {
  blows: Blow[];
  total: number;
  message?: string;
}

export interface LayerResponse {
  layer: Layer;
  message?: string;
}

export interface LayersListResponse {
  layers: Layer[];
  total: number;
  message?: string;
}

// ================== TIPOS COMPUESTOS ==================

export interface PerfilWithBlows extends Perfil {
  blows?: Blow[];
}

export interface ProfileWithBlows extends Profile {
  blows?: Blow[];
}

export interface ApiqueWithLayers {
  apique_id: number;
  apique?: number;
  id: number;
  location?: string;
  depth?: number;
  date?: string;
  cbr_unaltered?: boolean;
  depth_tomo?: number;
  molde?: number;
  layers?: Layer[];
}

// ================== FILTROS Y PARÁMETROS ==================

export interface PerfilFilters {
  projectId?: number;
  soundingNumber?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  depthMin?: number;
  depthMax?: number;
  waterLevelMin?: number;
  waterLevelMax?: number;
}

export interface ProfileFilters {
  projectId?: number;
  soundingNumber?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BlowFilters {
  profileId?: number;
  depthMin?: number;
  depthMax?: number;
  nMin?: number;
  nMax?: number;
}

export interface LayerFilters {
  apiqueId?: number;
  layerNumber?: number;
  thicknessMin?: number;
  thicknessMax?: number;
  sampleId?: string;
}

export interface PerfilQueryParams extends PerfilFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Perfil;
  sortOrder?: "ASC" | "DESC";
  includeBlows?: boolean;
}

export interface ProfileQueryParams extends ProfileFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Profile;
  sortOrder?: "ASC" | "DESC";
  includeBlows?: boolean;
}

export interface BlowQueryParams extends BlowFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Blow;
  sortOrder?: "ASC" | "DESC";
}

export interface LayerQueryParams extends LayerFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Layer;
  sortOrder?: "ASC" | "DESC";
}

// ================== TIPOS PARA CÁLCULOS SPT ==================

export interface SPTCalculation {
  depth: number;
  n_value: number;
  classification?: string;
  density?: string;
  strength?: string;
}

export interface SPTReport {
  profile_id: number;
  sounding_number: string;
  calculations: SPTCalculation[];
  summary?: {
    averageN: number;
    maxN: number;
    minN: number;
    soilClassification: string;
  };
}
