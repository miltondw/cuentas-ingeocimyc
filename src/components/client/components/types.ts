export interface AdditionalInfo {
  dependsOnField?: string;
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
  dependsOnValue?: string;
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
  itemAdditionalInfo: Record<string, string | number | boolean | string[]>;
  setItemAdditionalInfo: React.Dispatch<
    React.SetStateAction<Record<string, string | number | boolean | string[]>>
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
  editCategory?: string;
}

export interface SelectedService {
  id: string;
  item: ServiceItem;
  quantity: number;
  additionalInfo: Record<string, string | number | boolean | string[]>;
  category?: string;
}
