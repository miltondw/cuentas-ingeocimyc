import api from "@/api";
import type {
  ServiceCategory,
  Service,
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

// =============== BASE URLs ===============
const ADMIN_BASE_URL = "/admin/services";

// =============== SERVICIOS PARA CATEGORÍAS ===============
export const adminCategoriesApi = {
  // Obtener todas las categorías
  getAll: (params?: AdminQueryParams) =>
    api.get<ServiceCategory[]>(`${ADMIN_BASE_URL}/categories`, { params }),

  // Obtener categoría por ID
  getById: (id: number) =>
    api.get<ServiceCategory>(`${ADMIN_BASE_URL}/categories/${id}`),

  // Crear nueva categoría
  create: (data: CreateCategoryRequest) =>
    api.post<ServiceCategory>(`${ADMIN_BASE_URL}/categories`, data),

  // Actualizar categoría
  update: (id: number, data: UpdateCategoryRequest) =>
    api.patch<ServiceCategory>(`${ADMIN_BASE_URL}/categories/${id}`, data),

  // Eliminar categoría
  delete: (id: number) =>
    api.delete<void>(`${ADMIN_BASE_URL}/categories/${id}`),
};

// =============== SERVICIOS PARA SERVICIOS ===============
export const adminServicesApi = {
  // Obtener todos los servicios
  getAll: (params?: AdminQueryParams) =>
    api.get<Service[]>(`${ADMIN_BASE_URL}`, { params }),

  // Obtener servicio por ID
  getById: (id: number) => api.get<Service>(`${ADMIN_BASE_URL}/${id}`),

  // Crear servicio básico
  create: (data: CreateServiceRequest) =>
    api.post<Service>(`${ADMIN_BASE_URL}`, data),

  // Crear servicio completo con campos adicionales
  createComplete: (data: CreateCompleteServiceRequest) =>
    api.post<Service>(`${ADMIN_BASE_URL}/complete`, data),
  // Actualizar servicio
  update: (id: number, data: UpdateServiceRequest) =>
    api.patch<Service>(`${ADMIN_BASE_URL}/${id}`, data),

  // Actualizar servicio completo con campos adicionales
  updateComplete: (id: number, data: UpdateCompleteServiceRequest) =>
    api.put<Service>(`${ADMIN_BASE_URL}/${id}/complete`, data),

  // Eliminar servicio
  delete: (id: number) => api.delete<void>(`${ADMIN_BASE_URL}/${id}`),
};

// =============== SERVICIOS PARA CAMPOS ADICIONALES ===============
export const adminFieldsApi = {
  // Obtener campos de un servicio
  getByServiceId: (serviceId: number) =>
    api.get<ServiceAdditionalField[]>(`${ADMIN_BASE_URL}/${serviceId}/fields`),

  // Obtener campo por ID
  getById: (fieldId: number) =>
    api.get<ServiceAdditionalField>(`${ADMIN_BASE_URL}/fields/${fieldId}`),

  // Crear campo adicional
  create: (serviceId: number, data: CreateServiceAdditionalFieldRequest) =>
    api.post<ServiceAdditionalField>(
      `${ADMIN_BASE_URL}/${serviceId}/fields`,
      data
    ),

  // Actualizar campo
  update: (fieldId: number, data: UpdateServiceAdditionalFieldRequest) =>
    api.patch<ServiceAdditionalField>(
      `${ADMIN_BASE_URL}/fields/${fieldId}`,
      data
    ),

  // Eliminar campo
  delete: (fieldId: number) =>
    api.delete<void>(`${ADMIN_BASE_URL}/fields/${fieldId}`),
};

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
  utils: adminUtils,
};
