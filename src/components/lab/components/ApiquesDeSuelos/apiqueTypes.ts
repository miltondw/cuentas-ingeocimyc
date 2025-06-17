// types/apiqueTypes.ts
export interface Layer {
  layer_number: number;
  thickness: number | string;
  sample_id: string;
  observation: string;
}

export interface ApiqueFormData {
  apique: string | null;
  location: string;
  depth: number | null;
  date: string;
  cbr_unaltered: boolean;
  depth_tomo: string; // Campo para uso interno del formulario
  molde: string; // Campo para uso interno del formulario
  layers: Layer[];
}
