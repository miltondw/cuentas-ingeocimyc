import { useState, useCallback } from "react";
import { serviceRequestsService } from "@/api/services/serviceRequestsService";
import type { ServiceRequest } from "@/types/serviceRequests";
import type { AssayFormItem } from "../types";

export const useServiceRequests = () => {
  const [loading, setLoading] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [selectedServiceRequest, setSelectedServiceRequest] =
    useState<ServiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar solicitudes de servicio
  const fetchServiceRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceRequestsService.getServiceRequests();

      // Guardar la respuesta completa
      setServiceRequests(response.data || []);
    } catch (err) {
      console.error("Error cargando solicitudes de servicio:", err);
      setError("Error al cargar las solicitudes de servicio");
    } finally {
      setLoading(false);
    }
  }, []);

  // Seleccionar una solicitud específica
  const fetchServiceRequestById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const serviceRequest = await serviceRequestsService.getServiceRequest(id);
      setSelectedServiceRequest(serviceRequest);
      return serviceRequest;
    } catch (err) {
      console.error(`Error cargando solicitud de servicio ${id}:`, err);
      setError(`Error al cargar la solicitud de servicio ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Convertir servicios seleccionados a ensayos para el proyecto
  const convertServicesToAssays = useCallback(
    (serviceRequest: ServiceRequest): AssayFormItem[] => {
      if (!serviceRequest?.selectedServices) return [];

      return serviceRequest.selectedServices.map((service) => ({
        id: service.service.id,
        code: service.service.code,
        name: service.service.name,
        categoryId: service.service.categoryId,
        categoryName: service.service.category?.name,
      }));
    },
    []
  );

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedServiceRequest(null);
  }, []);

  return {
    loading,
    serviceRequests,
    selectedServiceRequest,
    error,
    fetchServiceRequests,
    fetchServiceRequestById,
    convertServicesToAssays,
    clearSelection,
  };
};
