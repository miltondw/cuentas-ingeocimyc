/**
 * Servicio para la gestión de apiques de laboratorio usando la nueva API de NestJS
 * IMPORTANTE: Las rutas cambiaron de /api/projects/:id/apiques/* a /api/lab/apiques/*
 */
import api from "../index";
import type {
  Apique,
  CreateApiqueDto,
  ApiquesFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types/api";

export class ApiquesService {
  private readonly basePath = "/lab/apiques";

  /**
   * Obtener todos los apiques de un proyecto con filtros y paginación
   */
  async getApiques(
    filters: ApiquesFilters
  ): Promise<PaginatedResponse<Apique>> {
    const params = new URLSearchParams();

    // projectId es requerido
    if (!filters.projectId) {
      throw new Error("El ID del proyecto es requerido");
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<Apique>>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener un apique por ID
   */
  async getApique(id: number): Promise<Apique> {
    const response = await api.get<ApiResponse<Apique>>(
      `${this.basePath}/${id}`
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Apique no encontrado");
    }
    return response.data.data;
  }

  /**
   * Crear un nuevo apique
   */
  async createApique(apiqueData: CreateApiqueDto): Promise<Apique> {
    const response = await api.post<ApiResponse<Apique>>(
      this.basePath,
      apiqueData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al crear el apique");
    }
    return response.data.data;
  }

  /**
   * Actualizar un apique existente
   */
  async updateApique(
    id: number,
    apiqueData: Partial<CreateApiqueDto>
  ): Promise<Apique> {
    const response = await api.put<ApiResponse<Apique>>(
      `${this.basePath}/${id}`,
      apiqueData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al actualizar el apique");
    }
    return response.data.data;
  }

  /**
   * Eliminar un apique
   */
  async deleteApique(id: number): Promise<void> {
    const response = await api.delete<ApiResponse>(`${this.basePath}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar el apique");
    }
  }

  /**
   * Actualizar el estado de un apique
   */
  async updateApiqueStatus(
    id: number,
    status: "collected" | "analyzing" | "completed" | "reported"
  ): Promise<Apique> {
    const response = await api.patch<ApiResponse<Apique>>(
      `${this.basePath}/${id}/status`,
      { status }
    );
    if (!response.data.data) {
      throw new Error(
        response.data.error || "Error al actualizar el estado del apique"
      );
    }
    return response.data.data;
  }

  /**
   * Obtener apiques por profundidad
   */
  async getApiquesByDepth(
    projectId: number,
    minDepth?: number,
    maxDepth?: number
  ): Promise<PaginatedResponse<Apique>> {
    const filters: ApiquesFilters = {
      projectId,
      minDepth,
      maxDepth,
    };
    return this.getApiques(filters);
  }

  /**
   * Buscar apiques por número de muestra
   */
  async searchApiquesBySampleNumber(
    projectId: number,
    sampleNumber: string
  ): Promise<PaginatedResponse<Apique>> {
    const filters: ApiquesFilters = {
      projectId,
      sampleNumber,
    };
    return this.getApiques(filters);
  }

  /**
   * Obtener apiques por estado
   */
  async getApiquesByStatus(
    projectId: number,
    status: "collected" | "analyzing" | "completed" | "reported"
  ): Promise<PaginatedResponse<Apique>> {
    const filters: ApiquesFilters = {
      projectId,
      status,
    };
    return this.getApiques(filters);
  }

  /**
   * Obtener apiques por rango de fechas
   */
  async getApiquesByDateRange(
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<PaginatedResponse<Apique>> {
    const filters: ApiquesFilters = {
      projectId,
      collectionDate: startDate,
      analysisDate: endDate,
    };
    return this.getApiques(filters);
  }

  /**
   * Generar reporte PDF de un apique
   */
  async generateApiqueReport(id: number): Promise<Blob> {
    const response = await api.get(`${this.basePath}/${id}/report/pdf`, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Exportar apiques de un proyecto a Excel
   */
  async exportApiques(
    projectId: number,
    filters?: Omit<ApiquesFilters, "projectId">
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
export const apiquesService = new ApiquesService();
