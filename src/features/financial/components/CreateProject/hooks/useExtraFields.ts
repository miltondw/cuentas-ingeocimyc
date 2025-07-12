import { useState, useCallback } from "react";
import type { ExtraField } from "../types";

export const useExtraFields = () => {
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);

  // Añadir nuevo campo extra
  const addExtraField = useCallback(() => {
    const newField: ExtraField = {
      id: `extra-${Date.now()}`,
      description: "",
      value: 0,
    };
    setExtraFields((prev) => [...prev, newField]);
  }, []);

  // Actualizar un campo extra existente
  const updateExtraField = useCallback(
    (id: string, updates: Partial<ExtraField>) => {
      setExtraFields((prev) =>
        prev.map((field) => {
          if (field.id === id) {
            return { ...field, ...updates };
          }
          return field;
        })
      );
    },
    []
  );

  // Eliminar un campo extra
  const removeExtraField = useCallback((id: string) => {
    setExtraFields((prev) => prev.filter((field) => field.id !== id));
  }, []);

  // Convertir campos extras a formato para API
  const getExtraFieldsForApi = useCallback(() => {
    const otrosCampos: Record<string, number> = {};
    extraFields.forEach((field) => {
      if (field.description.trim() && field.value > 0) {
        const key = field.description.trim().replace(/\s+/g, "_");
        otrosCampos[key] = field.value;
      }
    });
    return otrosCampos;
  }, [extraFields]);

  // Cargar campos extras desde una fuente externa (ej: proyecto existente)
  const setExtraFieldsFromSource = useCallback(
    (otrosCampos: Record<string, number>) => {
      const fields: ExtraField[] = Object.entries(otrosCampos).map(
        ([key, value], index) => ({
          id: `existing-${index}`,
          description: key.replace(/_/g, " "),
          value: typeof value === "number" ? value : Number(value) || 0,
        })
      );
      setExtraFields(fields);
    },
    []
  );

  return {
    extraFields,
    addExtraField,
    updateExtraField,
    removeExtraField,
    getExtraFieldsForApi,
    setExtraFieldsFromSource,
  };
};
