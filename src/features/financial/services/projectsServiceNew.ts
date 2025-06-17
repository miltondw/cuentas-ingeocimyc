import { apiClient } from "@/lib/axios/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectWithExpenses,
  ProjectFilters,
  ProjectStats,
  CreateProjectExpensesDto,
  ProjectExpenses,
} from "../types/projectTypes";

const BASE_URL = "/projects";

/**
 * Servicio para gestión de proyectos
 * Basado en la estructura real del backend NestJS
 */
export const projectsService = {
  /**
   * Obtener todos los proyectos con filtros opcionales
   */
  async getProjects(filters?: ProjectFilters): Promise<ApiResponse<Project[]>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener un proyecto específico por ID
   */
  async getProject(id: number): Promise<ProjectWithExpenses> {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo proyecto
   */
  async createProject(
    projectData: CreateProjectDto
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.post(BASE_URL, projectData);
    return response.data;
  },

  /**
   * Actualizar un proyecto existente
   */
  async updateProject(
    id: number,
    projectData: UpdateProjectDto
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.patch(`${BASE_URL}/${id}`, projectData);
    return response.data;
  },

  /**
   * Eliminar un proyecto
   */
  async deleteProject(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crear gastos para un proyecto
   */
  async createProjectExpenses(
    expensesData: CreateProjectExpensesDto
  ): Promise<ApiResponse<ProjectExpenses>> {
    const response = await apiClient.post(
      `${BASE_URL}/${expensesData.project_id}/expenses`,
      expensesData
    );
    return response.data;
  },

  /**
   * Actualizar gastos de un proyecto
   */
  async updateProjectExpenses(
    projectId: number,
    expensesData: Partial<CreateProjectExpensesDto>
  ): Promise<ApiResponse<ProjectExpenses>> {
    const response = await apiClient.patch(
      `${BASE_URL}/${projectId}/expenses`,
      expensesData
    );
    return response.data;
  },

  /**
   * Agregar un pago a un proyecto
   */
  async addPayment(
    id: number,
    paymentData: { abono: number; factura?: string }
  ): Promise<ApiResponse<Project>> {
    const response = await apiClient.patch(
      `${BASE_URL}/${id}/payment`,
      paymentData
    );
    return response.data;
  },

  /**
   * Obtener estadísticas de proyectos
   */
  async getProjectStats(): Promise<ApiResponse<ProjectStats>> {
    const response = await apiClient.get(`${BASE_URL}/summary`);
    return response.data;
  },

  /**
   * Obtener resumen financiero por año
   */
  async getFinancialSummary(year: number): Promise<ApiResponse<ProjectStats>> {
    const response = await apiClient.get(`/resumen/projects/${year}`);
    return response.data;
  },
};
