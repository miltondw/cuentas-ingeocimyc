import api from "@/api";
import type {
  ServiceAdditionalField,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateServiceRequest,
  CreateCompleteServiceRequest,
  UpdateServiceRequest,
  UpdateCompleteServiceRequest,
  CreateServiceAdditionalFieldRequest,
  UpdateServiceAdditionalFieldRequest,
  AdminQueryParams,
} from "@/types/admin";
import { AdminServiceRequestsService } from "./adminServiceRequestsService";

// =============== BASE URLs ===============
const ADMIN_BASE_URL = "/admin/services";

// =============== SERVICIOS PARA CATEGORÍAS ===============
export const adminCategoriesApi = {
  // Obtener todas las categorías
  getAll: async (params?: AdminQueryParams) => {
    const res = await api.get(`${ADMIN_BASE_URL}/categories`, { params });
    // Soporta ambas estructuras: { data: [...] } y { data: { data: [...] } }
    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    } else if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
      return res.data.data.data;
    } else {
      return [];
    }
  },

  // Obtener categoría por ID
  getById: async (id: number) => {
    const res = await api.get(`${ADMIN_BASE_URL}/categories/${id}`);
    console.info(res, "res getById");
    return res.data;
  },

  // Crear nueva categoría
  create: async (data: CreateCategoryRequest) => {
    const res = await api.post(`${ADMIN_BASE_URL}/categories`, data);
    console.info(res, "res create");
    return res.data;
  },

  // Actualizar categoría
  update: async (id: number, data: UpdateCategoryRequest) => {
    const res = await api.patch(`${ADMIN_BASE_URL}/categories/${id}`, data);
    console.info(res, "res update");
    return res.data;
  },

  // Eliminar categoría
  delete: async (id: number) => {
    const res = await api.delete(`${ADMIN_BASE_URL}/categories/${id}`);
    console.info(res, "res delete");
    return res.data;
  },
};

// =============== SERVICIOS PARA SERVICIOS ===============
export const adminServicesApi = {
  // Obtener todos los servicios
  getAll: async (params?: AdminQueryParams) => {
    const res = await api.get(`${ADMIN_BASE_URL}`, { params });
    // Soporta ambas estructuras: { data: [...] } y { data: { data: [...] } }
    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    } else if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
      return res.data.data.data;
    } else {
      return [];
    }
  },

  // Obtener servicio por ID
  getById: async (id: number) => {
    const res = await api.get(`${ADMIN_BASE_URL}/${id}`);
    return res.data;
  },

  // Crear servicio básico
  create: async (data: CreateServiceRequest) => {
    const res = await api.post(`${ADMIN_BASE_URL}`, data);
    return res.data;
  },

  // Crear servicio completo con campos adicionales
  createComplete: async (data: CreateCompleteServiceRequest) => {
    const res = await api.post(`${ADMIN_BASE_URL}/complete`, data);
    return res.data;
  },
  // Actualizar servicio
  update: async (id: number, data: UpdateServiceRequest) => {
    const res = await api.patch(`${ADMIN_BASE_URL}/${id}`, data);
    return res.data;
  },

  // Actualizar servicio completo con campos adicionales
  updateComplete: async (id: number, data: UpdateCompleteServiceRequest) => {
    const res = await api.put(`${ADMIN_BASE_URL}/${id}/complete`, data);
    return res.data;
  },

  // Eliminar servicio
  delete: async (id: number) => {
    const res = await api.delete(`${ADMIN_BASE_URL}/${id}`);
    return res.data;
  },
};

// =============== SERVICIOS PARA CAMPOS ADICIONALES ===============
export const adminFieldsApi = {
  // Obtener campos de un servicio
  getByServiceId: async (serviceId: number) => {
    const res = await api.get(`${ADMIN_BASE_URL}/${serviceId}/fields`);
    return res.data;
  },

  // Obtener campo por ID
  getById: async (fieldId: number) => {
    const res = await api.get(`${ADMIN_BASE_URL}/fields/${fieldId}`);
    return res.data;
  },

  // Crear campo adicional
  create: async (
    serviceId: number,
    data: CreateServiceAdditionalFieldRequest
  ) => {
    const res = await api.post(`${ADMIN_BASE_URL}/${serviceId}/fields`, data);
    return res.data;
  },

  // Actualizar campo
  update: async (
    fieldId: number,
    data: UpdateServiceAdditionalFieldRequest
  ) => {
    const res = await api.patch(`${ADMIN_BASE_URL}/fields/${fieldId}`, data);
    return res.data;
  },

  // Eliminar campo
  delete: async (fieldId: number) => {
    const res = await api.delete(`${ADMIN_BASE_URL}/fields/${fieldId}`);
    return res.data;
  },
};

// =============== SERVICIOS PARA SOLICITUDES DE SERVICIO ===============
export const adminServiceRequestsApi = new AdminServiceRequestsService();

// =============== UTILIDADES ===============
export const adminUtils = {
  // Validar código de categoría/servicio
  validateCode: (code: string): boolean => {
    return code.length <= 10 && /^[A-Z0-9-_]+$/.test(code);
  },

  // Validar nombre de campo
  validateFieldName: (fieldName: string): boolean => {
    return /^[a-zA-Z][a-zA-Z0-9]*$/.test(fieldName);
  },

  // Formatear opciones de select
  formatSelectOptions: (options: string[]): string[] => {
    return options.filter((option) => option.trim().length > 0);
  },

  // Validar dependencias de campos
  validateFieldDependency: (
    fields: ServiceAdditionalField[],
    dependsOnField?: string,
    dependsOnValue?: string
  ): boolean => {
    if (!dependsOnField || !dependsOnValue) return true;

    const parentField = fields.find(
      (field) => field.fieldName === dependsOnField
    );
    if (!parentField) return false;

    if (parentField.type === "select" && parentField.options) {
      return parentField.options.includes(dependsOnValue);
    }

    return true;
  },
};

// =============== EXPORTACIÓN POR DEFECTO ===============
export default {
  categories: adminCategoriesApi,
  services: adminServicesApi,
  fields: adminFieldsApi,
  serviceRequests: adminServiceRequestsApi,
  utils: adminUtils,
};
