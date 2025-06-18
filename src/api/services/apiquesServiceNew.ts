/**
 * Servicio para la gestión de apiques
 * @file apiquesService.ts
 * @description Servicio actualizado con interfaces organizadas
 */

import api from "../index";
import type {
  Apique,
  ApiqueLayer,
  CreateApiqueRequest,
  UpdateApiqueRequest,
  CreateApiqueLayerRequest,
  UpdateApiqueLayerRequest,
  ApiquesListResponse,
  ApiqueFilters,
  ApiqueLayerFilters,
  ApiqueStatistics,
  ProjectWithApiques,
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";

export class ApiquesService {
  private readonly basePath = "/lab/apiques";

  // =============== MÉTODOS DE APIQUES ===============

  /**
   * Obtener todos los apiques con filtros
   */
  async getApiques(filters?: ApiqueFilters): Promise<ApiquesListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ApiquesListResponse>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener apiques de un proyecto específico
   */
  async getByProject(
    projectId: number,
    filters?: ApiqueFilters
  ): Promise<ApiquesListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<ApiquesListResponse>(
      `${this.basePath}/project/${projectId}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener un apique por ID
   */
  async getById(id: number): Promise<ApiResponse<Apique>> {
    const response = await api.get<ApiResponse<Apique>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Obtener apique específico de un proyecto
   */
  async getByProjectAndApique(
    projectId: number,
    apiqueId: number
  ): Promise<ApiResponse<Apique>> {
    const response = await api.get<ApiResponse<Apique>>(
      `${this.basePath}/${projectId}/${apiqueId}`
    );
    return response.data;
  }

  /**
   * Crear un nuevo apique
   */
  async create(apiqueData: CreateApiqueRequest): Promise<ApiResponse<Apique>> {
    const response = await api.post<ApiResponse<Apique>>(
      this.basePath,
      apiqueData
    );
    return response.data;
  }

  /**
   * Actualizar un apique existente
   */
  async update(
    id: number,
    apiqueData: UpdateApiqueRequest
  ): Promise<ApiResponse<Apique>> {
    const response = await api.put<ApiResponse<Apique>>(
      `${this.basePath}/${id}`,
      apiqueData
    );
    return response.data;
  }

  /**
   * Actualizar apique por proyecto y número
   */
  async updateByProjectAndApique(
    projectId: number,
    apiqueId: number,
    apiqueData: UpdateApiqueRequest
  ): Promise<ApiResponse<Apique>> {
    const response = await api.put<ApiResponse<Apique>>(
      `${this.basePath}/${projectId}/${apiqueId}`,
      apiqueData
    );
    return response.data;
  }

  /**
   * Eliminar un apique
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Eliminar apique por proyecto y número
   */
  async deleteByProjectAndApique(
    projectId: number,
    apiqueId: number
  ): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${projectId}/${apiqueId}`
    );
    return response.data;
  }

  // =============== MÉTODOS DE CAPAS (LAYERS) ===============

  /**
   * Obtener capas de un apique con filtros
   */
  async getLayers(
    apiqueId: number,
    filters?: ApiqueLayerFilters
  ): Promise<PaginatedResponse<ApiqueLayer>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedResponse<ApiqueLayer>>(
      `${this.basePath}/${apiqueId}/layers?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Crear una nueva capa en un apique
   */
  async createLayer(
    apiqueId: number,
    layerData: CreateApiqueLayerRequest
  ): Promise<ApiResponse<ApiqueLayer>> {
    const response = await api.post<ApiResponse<ApiqueLayer>>(
      `${this.basePath}/${apiqueId}/layers`,
      layerData
    );
    return response.data;
  }

  /**
   * Actualizar una capa existente
   */
  async updateLayer(
    apiqueId: number,
    layerId: number,
    layerData: UpdateApiqueLayerRequest
  ): Promise<ApiResponse<ApiqueLayer>> {
    const response = await api.put<ApiResponse<ApiqueLayer>>(
      `${this.basePath}/${apiqueId}/layers/${layerId}`,
      layerData
    );
    return response.data;
  }

  /**
   * Eliminar una capa
   */
  async deleteLayer(
    apiqueId: number,
    layerId: number
  ): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${apiqueId}/layers/${layerId}`
    );
    return response.data;
  }

  // =============== MÉTODOS DE ANÁLISIS Y ESTADÍSTICAS ===============

  /**
   * Obtener estadísticas de apiques de un proyecto
   */
  async getStatistics(
    projectId: number
  ): Promise<ApiResponse<ApiqueStatistics>> {
    const response = await api.get<ApiResponse<ApiqueStatistics>>(
      `${this.basePath}/project/${projectId}/statistics`
    );
    return response.data;
  }

  /**
   * Obtener proyecto completo con apiques
   */
  async getProjectWithApiques(
    projectId: number
  ): Promise<ApiResponse<ProjectWithApiques>> {
    const response = await api.get<ApiResponse<ProjectWithApiques>>(
      `${this.basePath}/project/${projectId}/complete`
    );
    return response.data;
  }

  // =============== MÉTODOS DE UTILIDAD ===============

  /**
   * Validar datos de apique antes de enviar
   */
  validateApiqueData(data: CreateApiqueRequest | UpdateApiqueRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ("apique" in data && (data.apique === undefined || data.apique <= 0)) {
      errors.push("El número de apique debe ser mayor a 0");
    }

    if ("location" in data && !data.location?.trim()) {
      errors.push("La ubicación es requerida");
    }

    if ("depth" in data && !data.depth?.trim()) {
      errors.push("La profundidad es requerida");
    }

    if ("date" in data && !data.date) {
      errors.push("La fecha es requerida");
    }

    if (
      "cbr_unaltered" in data &&
      (data.cbr_unaltered === undefined || data.cbr_unaltered < 0)
    ) {
      errors.push("El valor CBR debe ser un número válido");
    }

    if ("depth_tomo" in data && !data.depth_tomo?.trim()) {
      errors.push("La profundidad de toma es requerida");
    }

    if ("molde" in data && (data.molde === undefined || data.molde <= 0)) {
      errors.push("El número de molde debe ser mayor a 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar datos de capa antes de enviar
   */
  validateLayerData(
    data: CreateApiqueLayerRequest | UpdateApiqueLayerRequest
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      "layerNumber" in data &&
      (data.layerNumber === undefined || data.layerNumber <= 0)
    ) {
      errors.push("El número de capa debe ser mayor a 0");
    }

    if ("thickness" in data && !data.thickness?.trim()) {
      errors.push("El espesor de la capa es requerido");
    }

    const thickness = parseFloat(data.thickness || "0");
    if (isNaN(thickness) || thickness <= 0) {
      errors.push("El espesor debe ser un número mayor a 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular profundidad total basada en capas
   */
  calculateTotalDepth(layers: ApiqueLayer[]): number {
    return layers.reduce((total, layer) => {
      const thickness = parseFloat(layer.thickness) || 0;
      return total + thickness;
    }, 0);
  }

  /**
   * Generar ID de muestra automático
   */
  generateSampleId(
    projectId: number,
    apiqueNumber: number,
    layerNumber: number
  ): string {
    return `P${projectId}-A${apiqueNumber}-L${layerNumber}`;
  }

  /**
   * Validar formato de profundidad
   */
  validateDepthFormat(depth: string): boolean {
    // Acepta formatos como "1.50", "2.0", "0.75", etc.
    const depthRegex = /^\d+\.?\d*$/;
    return depthRegex.test(depth) && parseFloat(depth) > 0;
  }

  /**
   * Convertir profundidad a formato estándar
   */
  formatDepth(depth: number): string {
    return depth.toFixed(2);
  }

  /**
   * Clasificar CBR según valores estándar
   */
  classifyCBR(cbrValue: number): string {
    if (cbrValue < 3) return "Muy pobre";
    if (cbrValue < 7) return "Pobre";
    if (cbrValue < 20) return "Regular";
    if (cbrValue < 50) return "Bueno";
    return "Excelente";
  }
}

// Instancia singleton del servicio
export const apiquesService = new ApiquesService();
export default apiquesService;
