/**
 * Servicio actualizado para la gestión de solicitudes de servicio usando la nueva API de NestJS
 */
import api from './index';
import { saveRequest } from "@utils/offlineStorage";
import type { 
  ServiceRequest, 
  CreateServiceRequestDto, 
  ServiceRequestFilters, 
  PaginatedResponse,
  ApiResponse 
} from '@/types/api';

// Interfaces compatibles con el contexto existente
interface FormData {
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
  status: string;
}

interface SelectedService {
  id: string;
  item: {
    code: string;
    name: string;
  };
  quantity: number;
  instances: Array<{
    id: string;
    additionalInfo: Record<string, string | number | boolean | string[]>;
  }>;
  category?: string;
}

export interface ServiceRequestData {
  formData: FormData;
  selectedServices: SelectedService[];
}

export class ServiceRequestsService {
  private readonly basePath = '/service-requests';

  /**
   * Obtener todas las solicitudes con filtros y paginación
   */
  async getServiceRequests(filters?: ServiceRequestFilters): Promise<PaginatedResponse<ServiceRequest>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get<PaginatedResponse<ServiceRequest>>(
      `${this.basePath}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtener una solicitud por ID
   */
  async getServiceRequest(id: number): Promise<ServiceRequest> {
    const response = await api.get<ApiResponse<ServiceRequest>>(`${this.basePath}/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Solicitud no encontrada');
    }
    return response.data.data;
  }

  /**
   * Crear una nueva solicitud (compatible con el formato anterior)
   */
  async createServiceRequest(requestData: ServiceRequestData): Promise<ServiceRequest> {
    // Convertir al formato esperado por la nueva API
    const createDto: CreateServiceRequestDto = {
      nombre: requestData.formData.name,
      email: requestData.formData.email,
      telefono: requestData.formData.phone,
      empresa: requestData.formData.nameProject || 'Sin especificar',
      tipoServicio: this.formatServicesString(requestData.selectedServices),
      descripcion: requestData.formData.description,
      ubicacionProyecto: requestData.formData.location,
    };

    try {
      const response = await api.post<ApiResponse<ServiceRequest>>(this.basePath, createDto);
      if (!response.data.data) {
        throw new Error(response.data.error || 'Error al crear la solicitud');
      }
      return response.data.data;
    } catch (error) {
      // Si estamos offline, guardar para sincronizar después
      if (!navigator.onLine) {
        await saveRequest({
          url: this.basePath,
          method: 'post',
          data: createDto,
          timestamp: new Date().toISOString(),
        });
        throw new Error('Sin conexión. La solicitud se guardó para enviar cuando haya conexión.');
      }
      throw error;
    }
  }

  /**
   * Actualizar una solicitud existente
   */
  async updateServiceRequest(id: number, updateData: Partial<CreateServiceRequestDto>): Promise<ServiceRequest> {
    const response = await api.put<ApiResponse<ServiceRequest>>(`${this.basePath}/${id}`, updateData);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Error al actualizar la solicitud');
    }
    return response.data.data;
  }

  /**
   * Actualizar el estado de una solicitud
   */
  async updateServiceRequestStatus(id: number, status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado'): Promise<ServiceRequest> {
    const response = await api.patch<ApiResponse<ServiceRequest>>(`${this.basePath}/${id}/status`, { status });
    if (!response.data.data) {
      throw new Error(response.data.error || 'Error al actualizar el estado');
    }
    return response.data.data;
  }

  /**
   * Eliminar una solicitud (solo admin)
   */
  async deleteServiceRequest(id: number): Promise<void> {
    const response = await api.delete<ApiResponse>(`${this.basePath}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Error al eliminar la solicitud');
    }
  }

  /**
   * Buscar solicitudes por término
   */
  async searchServiceRequests(query: string, filters?: Omit<ServiceRequestFilters, 'name'>): Promise<PaginatedResponse<ServiceRequest>> {
    const searchFilters: ServiceRequestFilters = {
      ...filters,
      name: query
    };
    return this.getServiceRequests(searchFilters);
  }

  /**
   * Obtener solicitudes por estado
   */
  async getServiceRequestsByStatus(status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado', filters?: Omit<ServiceRequestFilters, 'status'>): Promise<PaginatedResponse<ServiceRequest>> {
    const statusFilters: ServiceRequestFilters = {
      ...filters,
      status
    };
    return this.getServiceRequests(statusFilters);
  }

  /**
   * Obtener solicitudes por rango de fechas
   */
  async getServiceRequestsByDateRange(startDate: string, endDate: string, filters?: Omit<ServiceRequestFilters, 'startDate' | 'endDate'>): Promise<PaginatedResponse<ServiceRequest>> {
    const dateFilters: ServiceRequestFilters = {
      ...filters,
      startDate,
      endDate
    };
    return this.getServiceRequests(dateFilters);
  }

  /**
   * Obtener solicitudes por tipo de servicio
   */
  async getServiceRequestsByType(serviceType: string, filters?: Omit<ServiceRequestFilters, 'serviceType'>): Promise<PaginatedResponse<ServiceRequest>> {
    const typeFilters: ServiceRequestFilters = {
      ...filters,
      serviceType
    };
    return this.getServiceRequests(typeFilters);
  }

  /**
   * Exportar solicitudes a Excel
   */
  async exportServiceRequests(filters?: ServiceRequestFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`${this.basePath}/export/excel?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Generar reporte PDF de una solicitud
   */
  async generateServiceRequestReport(id: number): Promise<Blob> {
    const response = await api.get(`${this.basePath}/${id}/report/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Métodos de utilidad

  /**
   * Formatear servicios seleccionados como string
   */
  private formatServicesString(selectedServices: SelectedService[]): string {
    return selectedServices
      .map(service => `${service.item.name} (${service.quantity})`)
      .join(', ');
  }

  /**
   * Validar datos de solicitud
   */
  validateServiceRequestData(data: ServiceRequestData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.formData.name?.trim()) {
      errors.push('El nombre es requerido');
    }

    if (!data.formData.email?.trim()) {
      errors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.formData.email)) {
      errors.push('El email no tiene un formato válido');
    }

    if (!data.formData.phone?.trim()) {
      errors.push('El teléfono es requerido');
    }

    if (!data.formData.location?.trim()) {
      errors.push('La ubicación del proyecto es requerida');
    }

    if (!data.selectedServices || data.selectedServices.length === 0) {
      errors.push('Debe seleccionar al menos un servicio');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia singleton del servicio
export const serviceRequestsService = new ServiceRequestsService();

// Mantener compatibilidad con el código existente
export const submitServiceRequest = async (data: ServiceRequestData): Promise<ServiceRequest> => {
  return serviceRequestsService.createServiceRequest(data);
};

export default serviceRequestsService;
