import type { DataTableColumn } from "./columns";
import type { PaginationData } from "@/components/common/DataTablePagination";
import type {
  AdminServiceRequest,
  AdminServiceRequestFilters,
  ServiceRequestStatus,
  AdditionalField,
  AdditionalValue,
} from "@/types/serviceRequests";

export type {
  AdminServiceRequest,
  AdminServiceRequestFilters,
  ServiceRequestStatus,
  AdditionalField,
  AdditionalValue,
};

export interface ServiceRequestsTableProps {
  data: AdminServiceRequest[];
  columns: DataTableColumn<AdminServiceRequest>[];
  loading: boolean;
  paginationData: PaginationData;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  selectable: boolean;
  selectedRows: Set<number>;
  onSelectionChange: (selectedIds: Set<number>) => void;
}

export interface DataTablePropsStrict<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading: boolean;
  paginationData: PaginationData;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  selectable: boolean;
  selectedRows: Set<string | number>;
  onSelectionChange: (selectedIds: Set<string | number>) => void;
  emptyMessage?: string;
  mobileViewMode?: "auto" | "table" | "cards";
}
