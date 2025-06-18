/**
 * Servicio para la gestión de proyectos
 * @file projectsService.ts
 * @description Servicio actualizado con interfaces organizadas
 */

import api from "../index";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectExpense,
  CreateProjectExpenseRequest,
  UpdateProjectExpenseRequest,
  ProjectsListResponse,
  ProjectSummary,
  ProjectFilters,
  ProjectExpenseFilters,
  PaymentRequest,
  ApiResponse,
  PaginatedResponse,
} from "@/types/api";

export class ProjectsService {
  private readonly basePath = "/projects";

  // =============== MÉTODOS DE PROYECTOS ===============

  /**
   * Obtener todos los proyectos con filtros
   */
  async getProjects(filters?: ProjectFilters): Promise<ProjectsListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar arrays (como status multiple)
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await api.get<ProjectsListResponse>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener un proyecto por ID
   */
  async getById(id: number): Promise<ApiResponse<Project>> {
    const response = await api.get<ApiResponse<Project>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Crear un nuevo proyecto
   */
  async create(
    projectData: CreateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const response = await api.post<ApiResponse<Project>>(
      this.basePath,
      projectData
    );
    return response.data;
  }

  /**
   * Actualizar un proyecto existente
   */
  async update(
    id: number,
    projectData: UpdateProjectRequest
  ): Promise<ApiResponse<Project>> {
    const response = await api.put<ApiResponse<Project>>(
      `${this.basePath}/${id}`,
      projectData
    );
    return response.data;
  }

  /**
   * Eliminar un proyecto
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Obtener resumen de proyectos
   */
  async getSummary(): Promise<ApiResponse<ProjectSummary>> {
    const response = await api.get<ApiResponse<ProjectSummary>>(
      `${this.basePath}/summary`
    );
    return response.data;
  }

  // =============== MÉTODOS DE GASTOS ===============

  /**
   * Obtener gastos de un proyecto con filtros
   */
  async getExpenses(
    projectId: number,
    filters?: ProjectExpenseFilters
  ): Promise<PaginatedResponse<ProjectExpense>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedResponse<ProjectExpense>>(
      `${this.basePath}/${projectId}/expenses?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Crear un gasto para un proyecto
   */
  async createExpense(
    projectId: number,
    expenseData: CreateProjectExpenseRequest
  ): Promise<ApiResponse<ProjectExpense>> {
    const response = await api.post<ApiResponse<ProjectExpense>>(
      `${this.basePath}/${projectId}/expenses`,
      expenseData
    );
    return response.data;
  }

  /**
   * Actualizar un gasto
   */
  async updateExpense(
    projectId: number,
    expenseId: number,
    expenseData: UpdateProjectExpenseRequest
  ): Promise<ApiResponse<ProjectExpense>> {
    const response = await api.put<ApiResponse<ProjectExpense>>(
      `${this.basePath}/${projectId}/expenses/${expenseId}`,
      expenseData
    );
    return response.data;
  }

  /**
   * Eliminar un gasto
   */
  async deleteExpense(
    projectId: number,
    expenseId: number
  ): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.basePath}/${projectId}/expenses/${expenseId}`
    );
    return response.data;
  }

  // =============== MÉTODOS DE PAGOS ===============

  /**
   * Registrar un pago para un proyecto
   */
  async addPayment(
    projectId: number,
    paymentData: PaymentRequest
  ): Promise<ApiResponse<Project>> {
    const response = await api.post<ApiResponse<Project>>(
      `${this.basePath}/${projectId}/payment`,
      paymentData
    );
    return response.data;
  }

  // =============== MÉTODOS DE UTILIDAD ===============

  /**
   * Validar datos de proyecto antes de enviar
   */
  validateProjectData(data: CreateProjectRequest | UpdateProjectRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ("fecha" in data && !data.fecha) {
      errors.push("La fecha es requerida");
    }

    if ("solicitante" in data && !data.solicitante?.trim()) {
      errors.push("El solicitante es requerido");
    }

    if ("nombreProyecto" in data && !data.nombreProyecto?.trim()) {
      errors.push("El nombre del proyecto es requerido");
    }

    if ("obrero" in data && !data.obrero?.trim()) {
      errors.push("El obrero es requerido");
    }

    if ("costoServicio" in data && !data.costoServicio?.trim()) {
      errors.push("El costo del servicio es requerido");
    }

    if ("abono" in data && !data.abono?.trim()) {
      errors.push("El abono es requerido");
    }

    if ("metodoDePago" in data && !data.metodoDePago?.trim()) {
      errors.push("El método de pago es requerido");
    }

    if ("estado" in data && !data.estado) {
      errors.push("El estado es requerido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar datos de gasto antes de enviar
   */
  validateExpenseData(
    data: CreateProjectExpenseRequest | UpdateProjectExpenseRequest
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validar que los valores monetarios sean válidos
    const monetaryFields = [
      "camioneta",
      "campo",
      "obreros",
      "comidas",
      "otros",
      "peajes",
      "combustible",
      "hospedaje",
    ];

    monetaryFields.forEach((field) => {
      if (field in data) {
        const value = data[field as keyof typeof data];
        if (value !== undefined && value !== null) {
          const numValue = parseFloat(String(value));
          if (isNaN(numValue) || numValue < 0) {
            errors.push(
              `El campo ${field} debe ser un número válido mayor o igual a 0`
            );
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular total de gastos de un proyecto
   */
  calculateTotalExpenses(expenses: ProjectExpense[]): number {
    return expenses.reduce((total, expense) => {
      const expenseTotal =
        parseFloat(expense.camioneta) +
        parseFloat(expense.campo) +
        parseFloat(expense.obreros) +
        parseFloat(expense.comidas) +
        parseFloat(expense.otros) +
        parseFloat(expense.peajes) +
        parseFloat(expense.combustible) +
        parseFloat(expense.hospedaje);

      return total + expenseTotal;
    }, 0);
  }

  /**
   * Calcular saldo pendiente de un proyecto
   */
  calculatePendingBalance(project: Project): number {
    const costoServicio = parseFloat(project.costoServicio) || 0;
    const abono = parseFloat(project.abono) || 0;
    return costoServicio - abono;
  }

  /**
   * Determinar estado de pago de un proyecto
   */
  getPaymentStatus(project: Project): "pendiente" | "parcial" | "completo" {
    const costoServicio = parseFloat(project.costoServicio) || 0;
    const abono = parseFloat(project.abono) || 0;

    if (abono === 0) return "pendiente";
    if (abono >= costoServicio) return "completo";
    return "parcial";
  }

  /**
   * Calcular porcentaje de avance de pago
   */
  calculatePaymentProgress(project: Project): number {
    const costoServicio = parseFloat(project.costoServicio) || 0;
    const abono = parseFloat(project.abono) || 0;

    if (costoServicio === 0) return 0;
    return Math.min((abono / costoServicio) * 100, 100);
  }

  /**
   * Formatear valores monetarios
   */
  formatCurrency(amount: string | number): string {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(numAmount);
  }

  /**
   * Validar email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar teléfono colombiano
   */
  validateColombianPhone(phone: string): boolean {
    // Acepta formatos: +57xxxxxxxxxx, 57xxxxxxxxxx, xxxxxxxxxx
    const phoneRegex = /^(\+?57)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }
}

// Instancia singleton del servicio
export const projectsService = new ProjectsService();
export default projectsService;
