import { apiClient } from "@/lib/axios/apiClient";
import type { Project, ApiResponse } from "@/types/api";
import type { CreateProjectDto, UpdateProjectDto } from "../types";

/**
 * Servicio para gestión de proyectos
 * Reemplaza las llamadas a la API antigua con la nueva estructura
 */
export const projectsService = {
  /**
   * Obtener todos los proyectos
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects");
    return response.data;
  },

  /**
   * Obtener un proyecto por ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/projects/${id}`
    );
    return response.data;
  },

  /**
   * Crear un nuevo proyecto
   */
  async createProject(data: CreateProjectDto): Promise<ApiResponse<Project>> {
    const response = await apiClient.post<ApiResponse<Project>>(
      "/projects",
      data
    );
    return response.data;
  },

  /**
   * Actualizar un proyecto existente
   */
  async updateProject(
    id: string,
    data: UpdateProjectDto
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.put<ApiResponse<Project>>(
      `/projects/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Eliminar un proyecto
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    await apiClient.delete(`/projects/${id}`);
    return { success: true, data: undefined };
  },
  /**
   * Obtener estadísticas de proyectos
   */
  async getProjectStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      completed: number;
      totalValue: number;
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<{
        total: number;
        active: number;
        completed: number;
        totalValue: number;
      }>
    >("/projects/stats");
    return response.data;
  },

  /**
   * Buscar proyectos con filtros
   */
  async searchProjects(params: {
    search?: string;
    category?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      projects: Project[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<{
        projects: Project[];
        total: number;
        page: number;
        limit: number;
      }>
    >("/projects/search", { params });
    return response.data;
  },
};
