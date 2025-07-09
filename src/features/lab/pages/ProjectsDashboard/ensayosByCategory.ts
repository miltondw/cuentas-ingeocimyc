// Mapeo de ensayos por categoría (categoryId)
// Puedes agregar más categorías y ensayos según crezca el sistema

export interface EnsayoConfig {
  key: string;
  label: string;
}

export const ENSAYOS_BY_CATEGORY: Record<number, EnsayoConfig[]> = {
  9: [
    { key: "apiques", label: "Apiques" },
    { key: "perfiles", label: "Perfiles" },
  ],
  // Ejemplo para futuras categorías:
  // 1: [
  //   { key: "humedad", label: "Contenido de humedad" },
  //   ...
  // ],
};
