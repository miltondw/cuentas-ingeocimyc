/**
 * Servicio para la gestión de proyectos usando la nueva API de NestJS
 */
import { CreateProjectDto } from "@/features/financial";
import api from "../index";
import type {
  Project,
  ProjectFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types/api";

export class ProjectsService {
  private readonly basePath = "/projects";

  /**
   * Obtener todos los proyectos con filtros y paginación
   */
  async getProjects(
    filters?: ProjectFilters
  ): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedResponse<Project>>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener un proyecto por ID
   */
  async getProject(id: number): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(
      `${this.basePath}/${id}`
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Proyecto no encontrado");
    }
    return response.data.data;
  }

  /**
   * Crear un nuevo proyecto
   */
  async createProject(projectData: CreateProjectDto): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>(
      this.basePath,
      projectData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al crear el proyecto");
    }
    return response.data.data;
  }

  /**
   * Actualizar un proyecto existente
   */
  async updateProject(
    id: number,
    projectData: Partial<CreateProjectDto>
  ): Promise<Project> {
    const response = await api.put<ApiResponse<Project>>(
      `${this.basePath}/${id}`,
      projectData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al actualizar el proyecto");
    }
    return response.data.data;
  }

  /**
   * Eliminar un proyecto (solo admin)
   */
  async deleteProject(id: number): Promise<void> {
    const response = await api.delete<ApiResponse>(`${this.basePath}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error al eliminar el proyecto");
    }
  }
  /**
   * Obtener resumen financiero de un proyecto
   */
  async getProjectFinancialSummary(id: number): Promise<{
    costoTotal: number;
    abonoTotal: number;
    saldoPendiente: number;
    porcentajeAbono: number;
  }> {
    const response = await api.get<
      ApiResponse<{
        costoTotal: number;
        abonoTotal: number;
        saldoPendiente: number;
        porcentajeAbono: number;
      }>
    >(`${this.basePath}/${id}/resumen`);
    if (!response.data.data) {
      throw new Error(
        response.data.error || "Error al obtener resumen financiero"
      );
    }
    return response.data.data;
  }

  /**
   * Obtener número de perfiles de un proyecto
   */
  async getProjectProfilesCount(projectId: string): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>(
        `${this.basePath}/${projectId}/profiles/count`
      );
      return response.data.data?.count || 0;
    } catch (error) {
      console.warn(
        `Error getting profiles count for project ${projectId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Obtener número de apiques de un proyecto
   */
  async getProjectApiquesCount(projectId: string): Promise<number> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>(
        `${this.basePath}/${projectId}/apiques/count`
      );
      return response.data.data?.count || 0;
    } catch (error) {
      console.warn(
        `Error getting apiques count for project ${projectId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Buscar proyectos por término de búsqueda
   */
  async searchProjects(
    query: string,
    filters?: Omit<ProjectFilters, "nombreProyecto">
  ): Promise<PaginatedResponse<Project>> {
    const searchFilters: ProjectFilters = {
      ...filters,
      nombreProyecto: query,
    };
    return this.getProjects(searchFilters);
  }

  /**
   * Obtener proyectos por solicitante
   */
  async getProjectsBySolicitante(
    solicitante: string,
    filters?: Omit<ProjectFilters, "solicitante">
  ): Promise<PaginatedResponse<Project>> {
    const projectFilters: ProjectFilters = {
      ...filters,
      solicitante,
    };
    return this.getProjects(projectFilters);
  }

  /**
   * Obtener proyectos por rango de fechas
   */
  async getProjectsByDateRange(
    startDate: string,
    endDate: string,
    filters?: Omit<ProjectFilters, "startDate" | "endDate">
  ): Promise<PaginatedResponse<Project>> {
    const dateFilters: ProjectFilters = {
      ...filters,
      startDate,
      endDate,
    };
    return this.getProjects(dateFilters);
  }
}

// Instancia singleton del servicio
export const projectsService = new ProjectsService();
