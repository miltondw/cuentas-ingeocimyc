import type { ServiceRequestStatus, AdminServiceRequestFilters } from "./types";
import type { ServiceCategory } from "@/types/admin";
// Ejemplo: export const serviceRequestFilterFields = [ ... ];
export const SERVICE_REQUEST_STATUSES: Array<{
  value: ServiceRequestStatus;
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}> = [
  { value: "pendiente", label: "Pendiente", color: "warning" },
  { value: "en proceso", label: "En Proceso", color: "info" },
  { value: "completado", label: "Completado", color: "success" },
  { value: "cancelado", label: "Cancelado", color: "error" },
];

export interface ServiceRequestsFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  filters: AdminServiceRequestFilters;
  handleFilterChange: (field: string, value: unknown) => void;
  handleClearFilters: () => void;
  categories: ServiceCategory[];
  selectedIds: Set<number>;
  setShowBulkDeleteConfirm: (v: boolean) => void;
  deleteMutationPending: boolean;
}
