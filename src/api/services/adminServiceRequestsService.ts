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
  }

  /**
   * Obtener estadísticas de solicitudes de servicio
   */
  async getServiceRequestStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  }> {
    const response = await api.get("/service-requests/stats");
    return response.data;
  }
}

export const adminServiceRequestsService = new AdminServiceRequestsService();
