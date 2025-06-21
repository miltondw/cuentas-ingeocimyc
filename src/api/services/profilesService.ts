/**
 * Servicio para la gestión de perfiles SPT
 * @file profilesService.ts
 * @description Servicio actualizado con interfaces organizadas
 */

import api from "../index";
import type {
  Profile,
  ProfileBlow,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateBlowRequest,
  UpdateBlowRequest,
  ProfilesListResponse,
  ProfileFilters,
  BlowFilters,
  ProfileStatistics,
  SPTAnalysis,
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";

export class ProfilesService {
  private readonly basePath = "/lab/profiles";

  // =============== MÉTODOS DE PERFILES ===============

  /**
   * Obtener todos los perfiles con filtros
   */
  async getProfiles(filters?: ProfileFilters): Promise<ProfilesListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ProfilesListResponse>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener perfiles de un proyecto específico
   */
  async getProfilesByProject(
    projectId: number,
    filters?: ProfileFilters
  ): Promise<ProfilesListResponse> {
    const params = new URLSearchParams();
    params.append("projectId", String(projectId));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ProfilesListResponse>(
      `${this.basePath}/project/${projectId}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener un perfil por ID
   */
  async getById(id: number): Promise<ApiResponse<Profile>> {
    const response = await api.get<ApiResponse<Profile>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Obtener perfil por número de sondeo
   */
  async getBySoundingNumber(
    projectId: number,
    soundingNumber: string
  ): Promise<ApiResponse<Profile>> {
    const response = await api.get<ApiResponse<Profile>>(
      `${this.basePath}/project/${projectId}/sounding/${soundingNumber}`
    );
    return response.data;
  }

  /**
   * Crear un nuevo perfil
   */
  async create(
    profileData: CreateProfileRequest
  ): Promise<ApiResponse<Profile>> {
    const response = await api.post<ApiResponse<Profile>>(
      this.basePath,
      profileData
    );
    return response.data;
  }

  /**
   * Actualizar un perfil existente
   */
  async update(
    id: number,
    profileData: UpdateProfileRequest
  ): Promise<ApiResponse<Profile>> {
    const response = await api.put<ApiResponse<Profile>>(
      `${this.basePath}/${id}`,
      profileData
    );
    return response.data;
  }

  /**
   * Eliminar un perfil
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  // =============== MÉTODOS DE GOLPES (BLOWS) ===============

  /**
   * Obtener golpes de un perfil con filtros
   */
  async getBlows(
    profileId: number,
    filters?: BlowFilters
  ): Promise<PaginatedResponse<ProfileBlow>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedResponse<ProfileBlow>>(
      `${this.basePath}/${profileId}/blows?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Crear un nuevo golpe en un perfil
   */
  async createBlow(
    profileId: number,
    blowData: CreateBlowRequest
  ): Promise<ApiResponse<ProfileBlow>> {
    const response = await api.post<ApiResponse<ProfileBlow>>(
      `${this.basePath}/${profileId}/blows`,
      blowData
    );
    return response.data;
  }

  /**
   * Actualizar un golpe existente
   */
  async updateBlow(
    profileId: number,
    blowId: number,
    blowData: UpdateBlowRequest
  ): Promise<ApiResponse<ProfileBlow>> {
    const response = await api.put<ApiResponse<ProfileBlow>>(
      `${this.basePath}/${profileId}/blows/${blowId}`,
      blowData
    );
    return response.data;
  }

  /**
   * Eliminar un golpe
   */
  async deleteBlow(
    profileId: number,
    blowId: number
  ): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${profileId}/blows/${blowId}`
    );
    return response.data;
  }

  // =============== MÉTODOS DE ANÁLISIS Y ESTADÍSTICAS ===============

  /**
   * Obtener estadísticas de perfiles de un proyecto
   */
  async getStatistics(
    projectId: number
  ): Promise<ApiResponse<ProfileStatistics>> {
    const response = await api.get<ApiResponse<ProfileStatistics>>(
      `${this.basePath}/project/${projectId}/statistics`
    );
    return response.data;
  }

  /**
   * Obtener análisis SPT de un perfil
   */
  async getSPTAnalysis(profileId: number): Promise<ApiResponse<SPTAnalysis>> {
    const response = await api.get<ApiResponse<SPTAnalysis>>(
      `${this.basePath}/${profileId}/spt-analysis`
    );
    return response.data;
  }

  // =============== MÉTODOS DE UTILIDAD ===============

  /**
   * Validar datos de perfil antes de enviar
   */
  validateProfileData(data: CreateProfileRequest | UpdateProfileRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ("soundingNumber" in data && !data.soundingNumber?.trim()) {
      errors.push("El número de sondeo es requerido");
    }

    if ("waterLevel" in data && !data.waterLevel?.trim()) {
      errors.push("El nivel freático es requerido");
    }

    if ("profileDate" in data && !data.profileDate) {
      errors.push("La fecha del perfil es requerida");
    }

    if (
      "samplesNumber" in data &&
      (data.samplesNumber === undefined || data.samplesNumber < 0)
    ) {
      errors.push("El número de muestras debe ser un número válido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar datos de golpe antes de enviar
   */
  validateBlowData(data: CreateBlowRequest | UpdateBlowRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ("depth" in data && !data.depth?.trim()) {
      errors.push("La profundidad es requerida");
    }

    if ("blows6" in data && (data.blows6 === undefined || data.blows6 < 0)) {
      errors.push('Los golpes a 6" deben ser un número válido');
    }

    if ("blows12" in data && (data.blows12 === undefined || data.blows12 < 0)) {
      errors.push('Los golpes a 12" deben ser un número válido');
    }

    if ("blows18" in data && (data.blows18 === undefined || data.blows18 < 0)) {
      errors.push('Los golpes a 18" deben ser un número válido');
    }

    if ("n" in data && (data.n === undefined || data.n < 0)) {
      errors.push("El valor N debe ser un número válido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular valor N basado en golpes 12" y 18"
   */
  calculateNValue(blows12: number, blows18: number): number {
    return blows12 + blows18;
  }

  /**
   * Determinar consistencia del suelo basada en valor N
   */
  getSoilConsistency(nValue: number): string {
    if (nValue < 4) return "muy blanda";
    if (nValue < 8) return "blanda";
    if (nValue < 15) return "media";
    if (nValue < 30) return "firme";
    if (nValue < 50) return "muy firme";
    return "dura";
  }

  /**
   * Estimar capacidad portante basada en valor N
   */
  estimateBearingCapacity(nValue: number): number {
    // Fórmula simplificada: qa = N * 12 kPa (para suelos granulares)
    return nValue * 12;
  }
}

// Instancia singleton del servicio
export const profilesService = new ProfilesService();
export default profilesService;
