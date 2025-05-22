import api from "./index";
import { saveRequest } from "@utils/offlineStorage";
import {
  ServiceCategory,
  ServiceItem,
} from "../components/client/components/types";

// Interface for form data from ServiceRequestContext
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

// Interface for selected service from ServiceRequestContext
interface SelectedService {
  id: string;
  item: ServiceItem;
  quantity: number;
  instances: Array<{
    id: string;
    additionalInfo: Record<string, string | number | boolean | string[]>;
  }>;
  category?: string;
}

// Interface matching the endpoint expected format
export interface ServiceRequestData {
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

export interface ServiceRequestResponse {
  success: boolean;
  request_id: number;
  message: string;
}

// Transform our internal format to match the API expected format
const transformToApiFormat = (
  formData: FormData,
  selectedServices: SelectedService[]
): ServiceRequestData => {
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
    selectedServices: selectedServices.map((service) => ({
      item: {
        code: service.item.code,
        name: service.item.name,
      },
      quantity: service.quantity,
      additionalInfo:
        service.instances.length > 0 ? service.instances[0].additionalInfo : {},
    })),
  };
};

// Create a service request
export const createServiceRequest = async (
  formData: FormData,
  selectedServices: SelectedService[]
): Promise<ServiceRequestResponse> => {
  const requestData = transformToApiFormat(formData, selectedServices);

  try {
    const response = await api.post<ServiceRequestResponse>(
      "/service-requests",
      requestData
    );
    return response.data;
  } catch (error) {
    if (!navigator.onLine) {
      // Save for later synchronization if offline
      await saveRequest({
        url: "/service-requests",
        method: "POST",
        data: requestData,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        request_id: Date.now(), // Temporary ID for offline mode
        message:
          "La solicitud ha sido guardada localmente y se enviará cuando se restablezca la conexión a internet.",
      };
    }
    throw error;
  }
};

// Get all services
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

// Get service fields
export const getServiceFields = async (
  serviceCode: string
): Promise<string[]> => {
  try {
    const response = await api.get<{ success: boolean; fields: string[] }>(
      `/service-requests/services/${serviceCode}/fields`
    );
    return response.data.fields;
  } catch (error) {
    console.error(`Error fetching fields for service ${serviceCode}:`, error);
    throw error;
  }
};

// Interface for service request response
export interface ServiceRequestDetail {
  id: number;
  formData: {
    name: string;
    name_project: string;
    location: string;
    identification: string;
    phone: string;
    email: string;
    description: string;
    status: string;
  };
  selectedServices: Array<{
    item: {
      code: string;
      name: string;
    };
    quantity: number;
    additionalInfo?: Record<string, string | number | boolean | string[]>;
  }>;
  createdAt: string;
}

// Get a single service request by ID
export const getServiceRequest = async (
  id: number
): Promise<ServiceRequestDetail> => {
  try {
    const response = await api.get<ServiceRequestDetail>(
      `/service-requests/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching service request ${id}:`, error);
    throw error;
  }
};

// Get the PDF for a service request
export const getServiceRequestPdf = async (id: number): Promise<Blob> => {
  try {
    const response = await api.get(`/service-requests/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching PDF for service request ${id}:`, error);
    throw error;
  }
};
