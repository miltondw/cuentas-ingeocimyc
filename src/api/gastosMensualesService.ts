/**
 * Servicio para la gestión de gastos mensuales de empresa
 * NOTA: Endpoints no documentados en API.md - requiere documentación backend
 */
import api from "./index";
import type {
  FinancialFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types/api";

// Interfaces específicas para gastos mensuales
export interface GastoMensual {
  gasto_empresa_id: string;
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  otrosCampos?: { [key: string]: number };
  created_at: string;
  updated_at: string;
}

export interface CreateGastoMensualDto {
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  otrosCampos?: { [key: string]: number };
}

export interface GastosMensualesFilters extends FinancialFilters {
  mes?: string; // Mes específico (YYYY-MM)
  year?: number; // Año específico
  month?: number; // Mes específico (1-12)
}

export class GastosMensualesService {
  private readonly basePath = "/gastos-mes";

  /**
   * Obtener todos los gastos mensuales con filtros y paginación
   */
  async getGastosMensuales(
    filters?: GastosMensualesFilters
  ): Promise<PaginatedResponse<GastoMensual>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<{
      success: boolean;
      data: {
        gastos: GastoMensual[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`${this.basePath}?${params.toString()}`);

    // Transformar respuesta a formato estándar de paginación
    return {
      data: response.data.data.gastos,
      pagination: {
        currentPage: response.data.data.page,
        totalPages: response.data.data.totalPages,
        totalItems: response.data.data.total,
        itemsPerPage: response.data.data.limit,
        hasNextPage: response.data.data.page < response.data.data.totalPages,
        hasPreviousPage: response.data.data.page > 1,
      },
    };
  }

  /**
   * Obtener un gasto mensual por ID
   */
  async getGastoMensual(id: string): Promise<GastoMensual> {
    const response = await api.get<ApiResponse<GastoMensual>>(
      `${this.basePath}/${id}`
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Gasto mensual no encontrado");
    }
    return response.data.data;
  }

  /**
   * Crear un nuevo gasto mensual
   */
  async createGastoMensual(
    gastoData: CreateGastoMensualDto
  ): Promise<GastoMensual> {
    const response = await api.post<ApiResponse<GastoMensual>>(
      this.basePath,
      gastoData
    );
    if (!response.data.data) {
      throw new Error(response.data.error || "Error al crear el gasto mensual");
    }
    return response.data.data;
  }

  /**
   * Actualizar un gasto mensual existente
   */
  async updateGastoMensual(
    id: string,
    gastoData: Partial<CreateGastoMensualDto>
  ): Promise<GastoMensual> {
    const response = await api.put<ApiResponse<GastoMensual>>(
      `${this.basePath}/${id}`,
      gastoData
    );
    if (!response.data.data) {
      throw new Error(
        response.data.error || "Error al actualizar el gasto mensual"
      );
    }
    return response.data.data;
  }

  /**
   * Eliminar un gasto mensual
   */
  async deleteGastoMensual(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(`${this.basePath}/${id}`);
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error al eliminar el gasto mensual"
      );
    }
  }

  /**
   * Obtener gastos mensuales por año
   */
  async getGastosMensualesByYear(
    year: number
  ): Promise<PaginatedResponse<GastoMensual>> {
    return this.getGastosMensuales({ year, limit: 12 });
  }

  /**
   * Obtener gastos mensuales por rango de fechas
   */
  async getGastosMensualesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<PaginatedResponse<GastoMensual>> {
    return this.getGastosMensuales({ startDate, endDate });
  }

  /**
   * Obtener resumen de gastos mensuales
   */
  async getResumenGastosMensuales(filters?: GastosMensualesFilters): Promise<{
    totalGastos: number;
    promedioMensual: number;
    meses: number;
    gastoMayor: { mes: string; total: number };
    gastoMenor: { mes: string; total: number };
  }> {
    const gastos = await this.getGastosMensuales(filters);

    const gastosConTotal = gastos.data.map((gasto) => {
      const totalFijo =
        Number(gasto.salarios) +
        Number(gasto.luz) +
        Number(gasto.agua) +
        Number(gasto.arriendo) +
        Number(gasto.internet) +
        Number(gasto.salud);
      const totalOtros = gasto.otrosCampos
        ? Object.values(gasto.otrosCampos).reduce(
            (sum, val) => sum + Number(val),
            0
          )
        : 0;
      return {
        mes: gasto.mes,
        total: totalFijo + totalOtros,
      };
    });

    const totalGastos = gastosConTotal.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const meses = gastosConTotal.length;
    const promedioMensual = meses > 0 ? totalGastos / meses : 0;

    const gastoMayor = gastosConTotal.reduce(
      (max, item) => (item.total > max.total ? item : max),
      { mes: "", total: 0 }
    );

    const gastoMenor = gastosConTotal.reduce(
      (min, item) => (item.total < min.total ? item : min),
      { mes: "", total: Infinity }
    );

    return {
      totalGastos,
      promedioMensual,
      meses,
      gastoMayor,
      gastoMenor:
        gastoMenor.total === Infinity ? { mes: "", total: 0 } : gastoMenor,
    };
  }
}

// Instancia singleton del servicio
export const gastosMensualesService = new GastosMensualesService();
