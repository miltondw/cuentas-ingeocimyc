/**
 * Servicio para manejar solicitudes de servicio (Service Requests)
 * @file serviceRequestsService.ts
 */

import api from "../index";
import { API_ENDPOINTS } from "@/types/system";
import type {
  ServiceRequest,
  CreateServiceRequestRequest,
  UpdateServiceRequestRequest,
  ServiceRequestsListResponse,
  ServiceRequestFilters,
  ServiceType,
  APIService,
  APIServiceCategory,
} from "@/types/serviceRequests";

export class ServiceRequestsService {
  /**
   * Obtener lista de solicitudes de servicio con filtros
   */
  async getServiceRequests(
    filters: ServiceRequestFilters = {}
  ): Promise<ServiceRequestsListResponse> {
    const response = await api.get(API_ENDPOINTS.SERVICE_REQUESTS.LIST, {
      params: filters,
    });
    return response.data;
  }

  /**
   * Obtener una solicitud de servicio por ID
   */
  async getServiceRequest(id: number): Promise<ServiceRequest> {
    const response = await api.get(API_ENDPOINTS.SERVICE_REQUESTS.DETAIL(id));
    return response.data;
  }

  /**
   * Crear nueva solicitud de servicio
   */
  async createServiceRequest(
    data: CreateServiceRequestRequest
  ): Promise<ServiceRequest> {
    const response = await api.post(
      API_ENDPOINTS.SERVICE_REQUESTS.CREATE,
      data
    );
    return response.data;
  }

  /**
   * Actualizar solicitud de servicio
   */
  async updateServiceRequest(
    id: number,
    data: UpdateServiceRequestRequest
  ): Promise<ServiceRequest> {
    const response = await api.put(
      API_ENDPOINTS.SERVICE_REQUESTS.UPDATE(id),
      data
    );
    return response.data;
  }

  /**
   * Eliminar solicitud de servicio
   */
  async deleteServiceRequest(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.SERVICE_REQUESTS.DELETE(id));
  }

  /**
   * Obtener lista de tipos de servicios disponibles
   */
  async getServiceTypes(): Promise<ServiceType[]> {
    const response = await api.get(API_ENDPOINTS.SERVICES.LIST);
    return response.data;
  }
  /**
   * Obtener categorías de servicios con sus tipos
   */
  async getServiceCategories(): Promise<APIServiceCategory[]> {
    const response = await api.get(API_ENDPOINTS.SERVICES.CATEGORIES);
    return response.data;
  }

  /**
   * Obtener todos los servicios desde /api/services
   */
  async getServices(): Promise<APIService[]> {
    const response = await api.get("/services");
    return response.data;
  }

  /**
   * Descargar PDF de solicitud de servicio
   */
  async downloadServiceRequestPDF(id: number): Promise<Blob> {
    const response = await api.get(API_ENDPOINTS.PDF.SERVICE_REQUEST(id), {
      responseType: "blob",
    });
    return response.data;
  }

  /**
   * Previsualizar PDF de solicitud de servicio
   */
  async previewServiceRequestPDF(id: number): Promise<string> {
    const response = await api.get(API_ENDPOINTS.PDF.PREVIEW(id));
    return response.data.previewUrl;
  }

  /**
   * Regenerar PDF de solicitud de servicio
   */
  async regenerateServiceRequestPDF(id: number): Promise<ServiceRequest> {
    const response = await api.post(API_ENDPOINTS.PDF.REGENERATE(id));
    return response.data;
  }
}

// Instancia singleton del servicio
export const serviceRequestsService = new ServiceRequestsService();

// Export por defecto para compatibilidad
export default serviceRequestsService;
