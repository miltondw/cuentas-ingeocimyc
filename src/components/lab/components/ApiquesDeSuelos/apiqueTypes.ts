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
  depth_tomo: string;
  molde: string;
  layers: Layer[];
}

export interface Notification {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}
