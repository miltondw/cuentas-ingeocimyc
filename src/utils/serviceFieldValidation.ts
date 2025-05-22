/**
 * Service field helpers and validators
 */

export interface ServiceFieldConfig {
  requiredFields: Record<string, string[]>;
}

/**
 * Contains required fields for each service type
 */
export const serviceFieldConfig: ServiceFieldConfig = {
  requiredFields: {
    "EDS-1": ["areaPredio", "cantidadPisos", "ubicacion"],
    "EDS-2": ["cantidadTramos", "longitudTramos", "ubicacion"],
    "EDS-3": ["areaPredio"],
    "EMC-1": [
      "tipoMuestra",
      "elementoFundido",
      "resistenciaDiseno",
      "identificacionMuestra",
      "estructuraRealizada",
      "fechaFundida",
      "edadEnsayo",
    ],
    "DMC-1": [
      "planta",
      "resistenciaRequerida",
      "tamanoTriturado",
      "tipoCemento",
    ],
  },
};

/**
 * Validates if a service has all required fields
 */
export const validateServiceFields = (
  serviceCode: string,
  additionalInfo: Record<string, unknown>
): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = serviceFieldConfig.requiredFields[serviceCode] || [];
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (
      additionalInfo[field] === undefined ||
      additionalInfo[field] === null ||
      additionalInfo[field] === ""
    ) {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};
