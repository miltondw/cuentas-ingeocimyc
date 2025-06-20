import * as yup from "yup";
import { VALIDATION_RULES } from "@/types/admin";

// Esquema para categorías
export const categorySchema = yup.object({
  code: yup
    .string()
    .required("El código es requerido")
    .max(
      VALIDATION_RULES.CATEGORY_CODE_MAX_LENGTH,
      `El código no puede tener más de ${VALIDATION_RULES.CATEGORY_CODE_MAX_LENGTH} caracteres`
    )
    .matches(
      /^[A-Z0-9-_]+$/,
      "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos"
    ),
  name: yup
    .string()
    .required("El nombre es requerido")
    .max(
      VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH,
      `El nombre no puede tener más de ${VALIDATION_RULES.CATEGORY_NAME_MAX_LENGTH} caracteres`
    ),
});

// Esquema para servicios básicos
export const serviceSchema = yup.object({
  categoryId: yup
    .number()
    .required("La categoría es requerida")
    .min(1, "Selecciona una categoría válida"),
  code: yup
    .string()
    .required("El código es requerido")
    .max(
      VALIDATION_RULES.SERVICE_CODE_MAX_LENGTH,
      `El código no puede tener más de ${VALIDATION_RULES.SERVICE_CODE_MAX_LENGTH} caracteres`
    )
    .matches(
      /^[A-Z0-9-_]+$/,
      "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos"
    ),
  name: yup
    .string()
    .required("El nombre es requerido")
    .max(
      VALIDATION_RULES.SERVICE_NAME_MAX_LENGTH,
      `El nombre no puede tener más de ${VALIDATION_RULES.SERVICE_NAME_MAX_LENGTH} caracteres`
    ),
});

// Esquema para campos adicionales
export const serviceFieldSchema = yup.object({
  fieldName: yup
    .string()
    .required("El nombre del campo es requerido")
    .matches(
      VALIDATION_RULES.FIELD_NAME_PATTERN,
      "El nombre debe ser camelCase sin espacios ni caracteres especiales"
    ),
  type: yup
    .string()
    .required("El tipo es requerido")
    .oneOf(
      ["text", "number", "select", "date", "checkbox"],
      "Tipo de campo no válido"
    ),
  required: yup.boolean(),
  options: yup
    .array()
    .of(yup.string())
    .when("type", {
      is: "select",
      then: (schema) =>
        schema.min(
          1,
          "Los campos de tipo 'select' deben tener al menos una opción"
        ),
      otherwise: (schema) => schema.notRequired(),
    }),
  dependsOnField: yup.string(),
  dependsOnValue: yup.string().when("dependsOnField", {
    is: (val: string) => val && val.length > 0,
    then: (schema) =>
      schema.required(
        "Si especificas un campo padre, debes especificar el valor requerido"
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  label: yup.string().required("La etiqueta es requerida"),
  displayOrder: yup.number().min(0, "El orden debe ser un número positivo"),
});

// Esquema para servicios completos (con campos adicionales)
export const completeServiceSchema = yup.object({
  categoryId: yup
    .number()
    .required("La categoría es requerida")
    .min(1, "Selecciona una categoría válida"),
  code: yup
    .string()
    .required("El código es requerido")
    .max(
      VALIDATION_RULES.SERVICE_CODE_MAX_LENGTH,
      `El código no puede tener más de ${VALIDATION_RULES.SERVICE_CODE_MAX_LENGTH} caracteres`
    )
    .matches(
      /^[A-Z0-9-_]+$/,
      "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos"
    ),
  name: yup
    .string()
    .required("El nombre es requerido")
    .max(
      VALIDATION_RULES.SERVICE_NAME_MAX_LENGTH,
      `El nombre no puede tener más de ${VALIDATION_RULES.SERVICE_NAME_MAX_LENGTH} caracteres`
    ),
  additionalFields: yup
    .array()
    .of(serviceFieldSchema)
    .test(
      "unique-field-names",
      "Los nombres de campos deben ser únicos",
      function (fields) {
        if (!fields) return true;

        const fieldNames = fields
          .map((field) => field.fieldName)
          .filter(Boolean);
        const uniqueNames = new Set(fieldNames);

        return fieldNames.length === uniqueNames.size;
      }
    )
    .test(
      "valid-dependencies",
      "Las dependencias de campos no son válidas",
      function (fields) {
        if (!fields) return true;

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          if (field.dependsOnField) {
            // Buscar el campo padre
            const parentField = fields
              .slice(0, i)
              .find((f) => f.fieldName === field.dependsOnField);
            if (!parentField) {
              return this.createError({
                path: `additionalFields[${i}].dependsOnField`,
                message: `El campo '${field.dependsOnField}' no existe o está después de este campo`,
              });
            }

            // Verificar que el campo padre sea de tipo select
            if (parentField.type !== "select") {
              return this.createError({
                path: `additionalFields[${i}].dependsOnField`,
                message: `El campo '${field.dependsOnField}' debe ser de tipo 'select' para poder ser usado como dependencia`,
              });
            }

            // Verificar que el valor existe en las opciones del campo padre
            if (
              field.dependsOnValue &&
              !parentField.options?.includes(field.dependsOnValue)
            ) {
              return this.createError({
                path: `additionalFields[${i}].dependsOnValue`,
                message: `El valor '${field.dependsOnValue}' no existe en las opciones del campo '${field.dependsOnField}'`,
              });
            }
          }
        }

        return true;
      }
    ),
});

// Funciones de validación auxiliares
export const validateUniqueCode = (
  code: string,
  existingCodes: string[],
  currentCode?: string
) => {
  if (currentCode && code === currentCode) return true;
  return !existingCodes.includes(code);
};

export const validateFieldName = (fieldName: string) => {
  return VALIDATION_RULES.FIELD_NAME_PATTERN.test(fieldName);
};

export const validateSelectOptions = (options: string[]) => {
  return options.filter((opt) => opt.trim().length > 0).length > 0;
};
