// types/apiqueTypes.ts
export interface Apique {
  apique_id: string;
  apique: string;
  date: string;
  location: string;
  layers: Layer[];
  cbr_unaltered: boolean;
}

export interface Layer {
  layer_number: number;
  thickness: string;
  sample_id?: string;
  observation?: string;
}

export interface Project {
  project_id: string;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
}
