/**
 * API client for service requests
 * This module provides functions to interact with the service requests API
 */
import api from "./index";
import {
  ServiceItem,
  ServiceCategory,
} from "../components/client/components/types";
import { saveRequest } from "../utils/offlineStorage";
import { serviceFieldConfig } from "../utils/serviceFieldValidation";

export interface AdditionalInfoField {
  field: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  dependsOn?: {
    field: string;
    value: string;
  };
}

// Interface for the service request form data
export interface ServiceRequestFormData {
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
  status: string;
}

// Interface for a service instance with additional info
export interface ServiceInstance {
  id: string;
  additionalInfo: Record<string, string | number | boolean | string[]>;
}

// Interface for a selected service in a request
export interface SelectedService {
  id: string;
  item: ServiceItem;
  quantity: number;
  instances: ServiceInstance[];
  category?: string;
}

// Interface for the data expected by the API
export interface ServiceRequestApiData {
  formData: {
    name: string;
    name_project: string;
    location: string;
    identification: string;
    phone: string;
    email: string;
    description: string;
    status?: string;
  };
  selectedServices: Array<{
    item: {
      code: string;
      name: string;
    };
    quantity: number;
    additionalInfo?: Record<string, string | number | boolean | string[]>;
  }>;
}

// Interface for the API response
export interface ServiceRequestApiResponse {
  success: boolean;
  request_id?: number;
  message?: string;
}

/**
 * Convert our application's data format to the API format
 */
const transformToApiFormat = (
  formData: ServiceRequestFormData,
  selectedServices: SelectedService[]
): ServiceRequestApiData => {
  return {
    formData: {
      name: formData.name,
      name_project: formData.nameProject,
      location: formData.location,
      identification: formData.identification,
      phone: formData.phone,
      email: formData.email,
      description: formData.description,
      status: formData.status,
    },
    selectedServices: selectedServices.map((service) => {
      // Get required fields for this service type
      const requiredFields =
        serviceFieldConfig.requiredFields[service.item.code] || [];

      // Combine all additionalInfo from instances into one object
      const combinedAdditionalInfo = service.instances.reduce<
        Record<string, string | number | boolean | string[]>
      >((acc, instance) => ({ ...acc, ...instance.additionalInfo }), {});

      // Special case handling for EDS-1: ensure areaPredio is included
      if (service.item.code === "EDS-1") {
        const instanceWithAreaPredio = service.instances.find(
          (instance) =>
            typeof instance.additionalInfo.areaPredio !== "undefined"
        );

        if (instanceWithAreaPredio?.additionalInfo.areaPredio) {
          combinedAdditionalInfo.areaPredio =
            instanceWithAreaPredio.additionalInfo.areaPredio;
        }
      }

      // Check for missing required fields
      const missingFields = requiredFields.filter(
        (field) =>
          !combinedAdditionalInfo[field] && combinedAdditionalInfo[field] !== 0
      );

      if (missingFields.length > 0) {
        console.warn(
          `Missing required fields for service ${service.item.code}:`,
          missingFields
        );
      }

      return {
        item: {
          code: service.item.code,
          name: service.item.name,
        },
        quantity: service.quantity,
        additionalInfo: combinedAdditionalInfo,
      };
    }),
  };
};

/**
 * Validate additional fields for a service type
 * This function checks if the provided fields are valid for the service
 */
const validateServiceFields = (
  serviceCode: string,
  additionalInfo: Record<string, string | number | boolean | string[]>
): { isValid: boolean; missingFields: string[]; invalidFields: string[] } => {
  // Get required fields for this service
  const requiredFields = serviceFieldConfig.requiredFields[serviceCode] || [];

  // Check for missing required fields
  const missingFields = requiredFields.filter(
    (field) => !additionalInfo[field] && additionalInfo[field] !== 0
  );

  // No invalid fields list anymore since we validate against required fields
  const invalidFields: string[] = [];

  return {
    isValid: missingFields.length === 0,
    missingFields,
    invalidFields,
  };
};

/**
 * Create a new service request
 */
export const createServiceRequest = async (
  formData: ServiceRequestFormData,
  selectedServices: SelectedService[]
): Promise<ServiceRequestApiResponse> => {
  const requestData = transformToApiFormat(formData, selectedServices);

  // Import logging utility
  const { logApiRequest } = await import("../utils/debugUtils");

  // Log the request data for debugging
  logApiRequest(requestData, "Service Request Data");

  // Ensure areaPredio is included for EDS-1 services
  requestData.selectedServices.forEach((service) => {
    if (
      service.item.code === "EDS-1" &&
      (!service.additionalInfo || !service.additionalInfo.areaPredio)
    ) {
      console.warn("⚠️ Missing required field areaPredio for EDS-1 service");
    }
  });
  try {
    // Validate services before sending
    for (const service of requestData.selectedServices) {
      const validation = validateServiceFields(
        service.item.code,
        service.additionalInfo || {}
      );

      if (!validation.isValid) {
        console.warn(
          `Service ${service.item.code} validation failed:`,
          `Missing fields: ${validation.missingFields.join(", ")}`
        );
      }
    }

    const response = await api.post<ServiceRequestApiResponse>(
      "/service-requests",
      requestData
    );
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      await saveRequest({
        url: "/service-requests",
        method: "POST",
        data: requestData,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        request_id: Date.now(),
        message:
          "La solicitud ha sido guardada localmente y se enviará cuando se restablezca la conexión a internet.",
      };
    }

    const apiError = error as ApiErrorResponse;
    if (apiError.response?.data) {
      console.error("API Error response:", apiError.response.data);
      return {
        success: false,
        message:
          typeof apiError.response.data.message === "string"
            ? apiError.response.data.message
            : "Error al procesar la solicitud en el servidor",
      };
    }

    throw error;
  }
};

/**
 * Get all service categories and their services
 */
export const getServices = async (): Promise<ServiceCategory[]> => {
  try {
    const response = await api.get<{
      success: boolean;
      services: ServiceCategory[];
    }>("/service-requests/services/all");
    return response.data.services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

/**
 * Get fields for a specific service
 */
export const getServiceFields = async (
  serviceCode: string
): Promise<AdditionalInfoField[]> => {
  try {
    const response = await api.get<{
      success: boolean;
      fields: AdditionalInfoField[];
    }>(`/service-requests/services/${serviceCode}/fields`);
    return response.data.fields;
  } catch (error) {
    console.error(`Error fetching fields for service ${serviceCode}:`, error);
    throw error;
  }
};

/**
 * Get a service request by ID
 */
export const getServiceRequest = async (
  id: number
): Promise<{
  success: boolean;
  request: {
    formData: ServiceRequestFormData;
    selectedServices: SelectedService[];
  };
}> => {
  try {
    const response = await api.get(`/service-requests/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service request ${id}:`, error);
    throw error;
  }
};

/**
 * Get the selected services for a request
 */
export const getSelectedServices = async (
  id: number
): Promise<{
  success: boolean;
  services: Array<{
    id: number;
    service_code: string;
    service_name: string;
    quantity: number;
    additionalInfo: Array<{
      field_name: string;
      field_value: string;
    }>;
  }>;
}> => {
  try {
    const response = await api.get(`/service-requests/${id}/services`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for request ${id}:`, error);
    throw error;
  }
};

/**
 * Update a service request
 */
export const updateServiceRequest = async (
  id: number,
  formData: ServiceRequestFormData,
  selectedServices: SelectedService[]
): Promise<ServiceRequestApiResponse> => {
  const requestData = transformToApiFormat(formData, selectedServices);

  try {
    const response = await api.put<ServiceRequestApiResponse>(
      `/service-requests/${id}`,
      requestData
    );
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      // Save for later synchronization if offline
      await saveRequest({
        url: `/service-requests/${id}`,
        method: "PUT",
        data: requestData,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "La actualización ha sido guardada localmente y se enviará cuando se restablezca la conexión a internet.",
      };
    }
    throw error;
  }
};

/**
 * Delete a service request
 */
export const deleteServiceRequest = async (
  id: number
): Promise<ServiceRequestApiResponse> => {
  try {
    const response = await api.delete<ServiceRequestApiResponse>(
      `/service-requests/${id}`
    );
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      // Save for later synchronization if offline
      await saveRequest({
        url: `/service-requests/${id}`,
        method: "DELETE",
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message:
          "La solicitud de eliminación ha sido guardada localmente y se enviará cuando se restablezca la conexión a internet.",
      };
    }
    throw error;
  }
};

/**
 * Generate and download a PDF for a service request
 */
export const generateServiceRequestPdf = async (id: number): Promise<Blob> => {
  try {
    const response = await api.get(`/service-requests/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error(`Error generating PDF for service request ${id}:`, error);
    throw error;
  }
};

/**
 * Interface for API error responses
 */
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
