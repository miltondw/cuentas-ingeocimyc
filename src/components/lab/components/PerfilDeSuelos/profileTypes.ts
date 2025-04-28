// types/profileTypes.ts
export interface BlowData {
  depth: string;
  blows6: string | number;
  blows12: string | number;
  blows18: string | number;
  n: string | number;
  observation: string;
}

export interface ProfileFormData {
  sounding_number: string;
  location: string;
  water_level: string;
  profile_date: string;
  samples_number: string | number;
  blows_data: BlowData[];
}

export interface Notification {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export interface ProfileStats {
  completedRows: number;
  totalRows: number;
  percentComplete: number;
  maxN: number;
  maxDepth: number;
}
