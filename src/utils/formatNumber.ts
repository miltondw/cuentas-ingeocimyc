/**
 * Formatea un número o string numérico al formato colombiano (separador de miles: , / decimal: .)
 * @param value - Valor a formatear (número, string numérico o null/undefined)
 * @returns String formateado al estándar colombiano o string vacío si el valor no es válido
 */
export const formatNumber = (
  value: number | string | undefined | null
): string => {
  // Manejo de valores vacíos o inválidos
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  // Convertir a número
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]/g, ""))
      : Number(value);

  // Verificar si es un número válido
  if (isNaN(numericValue)) {
    return "";
  }

  // Formatear el número al estándar colombiano
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(numericValue);
};

/**
 * Convierte un string formateado (estándar colombiano) a un número
 * @param value - String formateado (ej: "500,000" o "250,000.50")
 * @returns Número o 0 si el valor no es válido
 */
export const parseNumber = (value: string | undefined): number => {
  if (!value) {
    return 0;
  }

  // Reemplazar comas (separadores de miles) por nada y mantener punto decimal
  const cleanedValue = value.replace(/\./g, "").replace(/,/g, ".");

  // Convertir a número
  const numericValue = parseFloat(cleanedValue);

  // Retornar 0 si no es un número válido
  return isNaN(numericValue) ? 0 : numericValue;
};
