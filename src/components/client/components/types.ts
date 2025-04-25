// types.ts (or place in a shared types file)
export interface AdditionalInfo {
  field: string;
  type:
    | "text"
    | "number"
    | "select"
    | "select-multiple"
    | "checkbox"
    | "radio"
    | "date";
  label: string;
  required?: boolean;
  options?: string[];
  dependsOn?: {
    field: string;
    value: string;
  };
  question?: string;
}

export interface ServiceItem {
  id: number;
  code: string;
  name: string;
  additionalInfo?: AdditionalInfo[];
}

export interface ServiceCategory {
  id: number;
  code: string;
  category: string;
  items: ServiceItem[];
}

export interface ServiceResponse {
  success: boolean;
  services: ServiceCategory[];
}
export interface AdditionalInfoFormProps {
  service: ServiceItem;
  itemAdditionalInfo: { [key: string]: any };
  setItemAdditionalInfo: React.Dispatch<
    React.SetStateAction<{ [key: string]: any }>
  >;
}

export interface Service {
  id: number;
  code: string;
  category: string;
  items: ServiceItem[];
}

export interface ServiceSelectionProps {
  services: Service[];
  loading?: boolean;
}
