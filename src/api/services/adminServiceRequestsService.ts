/**
 * Servicio para administración de solicitudes de servicio
 * @file adminServiceRequestsService.ts
 */

import api from "../index";
import type {
  AdminServiceRequestsListResponse,
  AdminServiceRequest,
  AdminServiceRequestFilters,
  UpdateServiceRequestStatusRequest,
} from "@/types/serviceRequests";

export class AdminServiceRequestsService {
  /**
   * Obtener lista de solicitudes de servicio para administración
   */
  async getServiceRequests(
    filters: AdminServiceRequestFilters = {}
  ): Promise<AdminServiceRequestsListResponse> {
    const response = await api.get("/service-requests", {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obtener una solicitud de servicio específica con toda la información
   */
  async getServiceRequest(id: number): Promise<AdminServiceRequest> {
    const response = await api.get(`/service-requests/${id}`);
    return response.data;
  }
  /**
   * Actualizar una solicitud de servicio (principalmente el estado)
   */
  async updateServiceRequest(
    id: number,
    data: UpdateServiceRequestStatusRequest
  ): Promise<AdminServiceRequest> {
    const response = await api.patch(`/service-requests/${id}`, data);
    return response.data;
  }

  /**
   * Eliminar una solicitud de servicio
   */
  async deleteServiceRequest(id: number): Promise<void> {
    await api.delete(`/service-requests/${id}`);
  }

  /**
   * Generar PDF de solicitud de servicio
   */
  async generatePDF(id: number): Promise<Blob> {
    const response = await api.get(`/pdf/service-request/${id}`, {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Previsualizar PDF como HTML
   */
  async previewPDF(id: number): Promise<string> {
    const response = await api.get(`/pdf/service-request/${id}/preview`);
    return response.data;
  }

  /**
   * Forzar regeneración de PDF
   */
  async regeneratePDF(id: number): Promise<{ message: string }> {
    const response = await api.post(`/pdf/service-request/${id}/regenerate`);
    return response.data;
  }  /**
   * Obtener estadísticas de solicitudes de servicio
   */
  async getServiceRequestStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  }> {
    try {
      // Primero obtenemos todas las solicitudes
      const response = await api.get("/service-requests", {
        params: {
          limit: 1000, // Obtener un límite alto para calcular estadísticas
        },
      });
      
      const serviceRequests = response.data.data || [];
      const total = response.data.total || serviceRequests.length;
      
      // Calcular estadísticas por estado
      const byStatus: Record<string, number> = {};
      serviceRequests.forEach((request: AdminServiceRequest) => {
        const status = request.status || 'sin_estado';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });
      
      // Calcular estadísticas por mes
      const byMonth: Array<{ month: string; count: number }> = [];
      const monthCounts: Record<string, number> = {};
      
      serviceRequests.forEach((request: AdminServiceRequest) => {
        if (request.created_at) {
          const date = new Date(request.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        }
      });
      
      Object.entries(monthCounts).forEach(([month, count]) => {
        byMonth.push({ month, count });
      });
      
      // Calcular estadísticas por categoría
      const byCategory: Array<{ category: string; count: number }> = [];
      const categoryCounts: Record<string, number> = {};
      
      serviceRequests.forEach((request: AdminServiceRequest) => {
        if (request.selectedServices && Array.isArray(request.selectedServices)) {
          request.selectedServices.forEach((selectedService) => {
            if (selectedService.service?.category?.name) {
              const categoryName = selectedService.service.category.name;
              categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
            }
          });
        }
      });
      
      Object.entries(categoryCounts).forEach(([category, count]) => {
        byCategory.push({ category, count });
      });
      
      return {
        total,
        byStatus,
        byMonth: byMonth.sort((a, b) => a.month.localeCompare(b.month)),
        byCategory: byCategory.sort((a, b) => b.count - a.count),
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Fallback en caso de error
      return {
        total: 0,
        byStatus: {},
        byMonth: [],
        byCategory: [],
      };
    }
  }
}

export const adminServiceRequestsService = new AdminServiceRequestsService();
