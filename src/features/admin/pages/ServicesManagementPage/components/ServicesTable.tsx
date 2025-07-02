import {
  DataTable,
  ColumnConfig,
  RowAction,
} from "@/components/common/DataTable";
import type { Service } from "../types/types";
import React from "react";

interface Props {
  data: Service[];
  columns: ColumnConfig[];
  rowActions: RowAction[];
  loading: boolean;
  onRowClick: (row: Service) => void;
}

const ServicesTable: React.FC<Props> = ({
  data,
  columns,
  rowActions,
  loading,
  onRowClick,
}) => (
  <DataTable
    data={data}
    columns={columns}
    keyField="id"
    rowActions={rowActions}
    loading={loading}
    title="Lista de Servicios"
    onRowClick={(row) => onRowClick(row as Service)}
  />
);

export default ServicesTable;
