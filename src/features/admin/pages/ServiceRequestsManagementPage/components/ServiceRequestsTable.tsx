import React from "react";
import DataTable from "@/components/common/DataTable";
import type { ServiceRequestsTableProps } from "../types";

const ServiceRequestsTable: React.FC<ServiceRequestsTableProps> = (props) => {
  const { selectedRows, onSelectionChange, ...rest } = props;
  const dataTableProps = {
    ...rest,
    selectedRows: new Set(Array.from(selectedRows) as (string | number)[]),
    onSelectionChange: (ids: Set<string | number>) => {
      const filtered = Array.from(ids).filter(
        (id): id is number => typeof id === "number"
      );
      onSelectionChange(new Set(filtered));
    },
    emptyMessage: "No se encontraron solicitudes de servicio",
    mobileViewMode: "auto",
  } as React.ComponentProps<typeof DataTable>;
  return <DataTable {...dataTableProps} />;
};

export default ServiceRequestsTable;
