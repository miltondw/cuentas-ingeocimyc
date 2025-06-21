/**
 * Utilidades para servicios de API
 * @file utils/serviceUtils.ts
 */

import { AxiosError } from "axios";

/**
 * Utilidades compartidas para servicios
 */
export const ServiceUtils = {
  /**
   * Construir parámetros de URL desde filtros
   */
  buildUrlParams: (filters: Record<string, unknown>): URLSearchParams => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return params;
  },

  /**
   * Validar ID de entidad
   */
  validateEntityId: (id: unknown, entityName: string = "entidad"): number => {
    const numId = parseInt(String(id), 10);

    if (isNaN(numId) || numId <= 0) {
      throw new Error(`ID de ${entityName} inválido: ${id}`);
    }

    return numId;
  },

  /**
   * Formatear fecha para API
   */
  formatDateForAPI: (date: Date | string): string => {
    if (typeof date === "string") {
      return date.split("T")[0]; // Extraer solo YYYY-MM-DD
    }
    return date.toISOString().split("T")[0];
  },

  /**
   * Parsear respuesta de error
   */
  parseErrorResponse: (error: AxiosError | Error): string => {
    if ("response" in error && error.response?.data) {
      const data = error.response.data as { message?: string | string[] };
      if (data.message) {
        if (Array.isArray(data.message)) {
          return data.message.join(", ");
        }
        return data.message;
      }
    }

    if (error.message) {
      return error.message;
    }

    return "Error desconocido en el servidor";
  },

  /**
   * Validar filtros de paginación
   */
  validatePaginationFilters: (filters: Record<string, unknown>): void => {
    if (filters.page !== undefined) {
      const page = parseInt(String(filters.page), 10);
      if (isNaN(page) || page < 1) {
        throw new Error("El número de página debe ser mayor a 0");
      }
    }

    if (filters.limit !== undefined) {
      const limit = parseInt(String(filters.limit), 10);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new Error("El límite debe estar entre 1 y 100");
      }
    }

    if (filters.sortOrder !== undefined) {
      if (!["ASC", "DESC"].includes(String(filters.sortOrder))) {
        throw new Error("El orden debe ser ASC o DESC");
      }
    }
  },
};

/**
 * Validadores comunes
 */
export const CommonValidators = {
  /**
   * Validar email
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar teléfono colombiano
   */
  colombianPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+?57)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  /**
   * Validar fecha
   */
  date: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  },

  /**
   * Validar valor monetario
   */
  currency: (value: string | number): boolean => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return !isNaN(numValue) && numValue >= 0;
  },

  /**
   * Validar profundidad
   */
  depth: (depth: string): boolean => {
    const depthRegex = /^\d+\.?\d*$/;
    return depthRegex.test(depth) && parseFloat(depth) > 0;
  },
};
