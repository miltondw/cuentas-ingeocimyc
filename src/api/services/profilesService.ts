/**
 * Servicio para la gestión de perfiles de laboratorio usando la nueva API de NestJS
 * IMPORTANTE: Las rutas cambiaron de /api/projects/:id/profiles/* a /api/lab/profiles/*
 */
import api from "../index";
import type {
  Profile,
  ProfileBlow,
  CreateProfileRequest,
  UpdateProfileRequest,
  CreateBlowRequest,
  UpdateBlowRequest,
  ApiResponse,
  ProfileFilters,
  ProfilesListResponse,
} from "@/types/api";

export class ProfilesService {
  private readonly basePath = "/lab/profiles";

  /**
   * Obtener todos los perfiles de un proyecto con filtros y paginación
   */ async getProfiles(
    filters?: ProfileFilters
  ): Promise<ProfilesListResponse> {
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
   * Obtener un perfil por ID
   */
  async getProfile(id: number): Promise<Profile> {
    const response = await api.get<ApiResponse<Profile>>(
      `${this.basePath}/${id}`
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Perfil no encontrado");
    }
    return response.data.data;
  }
  /**
   * Crear un nuevo perfil
   */
  async createProfile(profileData: CreateProfileRequest): Promise<Profile> {
    const response = await api.post<ApiResponse<Profile>>(
      this.basePath,
      profileData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al crear el perfil");
    }
    return response.data.data;
  }
  /**
   * Actualizar un perfil existente
   */
  async updateProfile(
    id: number,
    profileData: UpdateProfileRequest
  ): Promise<Profile> {
    const response = await api.put<ApiResponse<Profile>>(
      `${this.basePath}/${id}`,
      profileData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al actualizar el perfil");
    }
    return response.data.data;
  }

  /**
   * Eliminar un perfil
   */
  async deleteProfile(id: number): Promise<void> {
    const response = await api.delete<ApiResponse>(`${this.basePath}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar el perfil");
    }
  }

  /**
   * Actualizar el estado de un perfil
   */
  async updateProfileStatus(
    id: number,
    status: "drilling" | "sampling" | "analyzing" | "completed" | "reported"
  ): Promise<Profile> {
    const response = await api.patch<ApiResponse<Profile>>(
      `${this.basePath}/${id}/status`,
      { status }
    );
    if (!response.data.data) {
      throw new Error(
        response.data.error || "Error al actualizar el estado del perfil"
      );
    }
    return response.data.data;
  }
  /**
   * Agregar datos de golpes a un perfil
   */
  async addBlowData(
    profileId: number,
    blowData: CreateBlowRequest
  ): Promise<ProfileBlow> {
    const response = await api.post<ApiResponse<ProfileBlow>>(
      `${this.basePath}/${profileId}/blows`,
      blowData
    );
    if (!response.data.data) {
      throw new Error(
        response.data.error || "Error al agregar datos de golpes"
      );
    }
    return response.data.data;
  }
  /**
   * Actualizar datos de golpes
   */
  async updateBlowData(
    profileId: number,
    blowId: number,
    blowData: UpdateBlowRequest
  ): Promise<ProfileBlow> {
    const response = await api.put<ApiResponse<ProfileBlow>>(
      `${this.basePath}/${profileId}/blows/${blowId}`,
      blowData
    );
    if (!response.data.data) {
      throw new Error(
        response.data.error || "Error al actualizar datos de golpes"
      );
    }
    return response.data.data;
  }
  /**
   * Eliminar datos de golpes
   */
  async deleteBlowData(profileId: number, blowId: number): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${profileId}/blows/${blowId}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error al eliminar datos de golpes"
      );
    }
  }

  /**
   * Obtener perfiles por profundidad
   */ async getProfilesByDepth(
    projectId: number,
    minDepth?: number,
    maxDepth?: number
  ): Promise<ProfilesListResponse> {
    const filters: ProfileFilters = {
      projectId,
      maxDepthMin: minDepth,
      maxDepthMax: maxDepth,
    };
    return this.getProfiles(filters);
  }
  /**
   * Buscar perfiles por número
   */
  async searchProfilesByNumber(
    projectId: number,
    soundingNumber: string
  ): Promise<ProfilesListResponse> {
    const filters: ProfileFilters = {
      projectId,
      soundingNumber,
    };
    return this.getProfiles(filters);
  }
  /**
   * Obtener perfiles por estado
   */
  async getProfilesByStatus(
    projectId: number,
    status: "drilling" | "sampling" | "analyzing" | "completed" | "reported"
  ): Promise<ProfilesListResponse> {
    const filters: ProfileFilters = {
      projectId,
      // Nota: status no está disponible en ProfileFilters actualmente
      // Se podría añadir o usar search
      search: status,
    };
    return this.getProfiles(filters);
  }
  /**
   * Obtener perfiles por tipo de suelo
   */
  async getProfilesBySoilType(
    projectId: number,
    soilType: string
  ): Promise<ProfilesListResponse> {
    const filters: ProfileFilters = {
      projectId,
      // Nota: soilType no está disponible en ProfileFilters actualmente
      // Se podría añadir o usar search
      search: soilType,
    };
    return this.getProfiles(filters);
  }
  /**
   * Obtener perfiles por rango de fechas
   */
  async getProfilesByDateRange(
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<ProfilesListResponse> {
    const filters: ProfileFilters = {
      projectId,
      startDate,
      endDate,
    };
    return this.getProfiles(filters);
  }

  /**
   * Generar reporte PDF de un perfil
   */
  async generateProfileReport(id: number): Promise<Blob> {
    const response = await api.get(`${this.basePath}/${id}/report/pdf`, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Exportar perfiles de un proyecto a Excel
   */
  async exportProfiles(
    projectId: number,
    filters?: Omit<ProfileFilters, "projectId">
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append("projectId", String(projectId));

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(
      `${this.basePath}/export/excel?${params.toString()}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}

// Instancia singleton del servicio
export const profilesService = new ProfilesService();
