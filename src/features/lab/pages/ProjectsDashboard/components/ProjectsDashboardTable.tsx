import React from "react";
import { Typography, Chip } from "@mui/material";

import { DataTable, ColumnConfig } from "@/components/common/DataTable";
import { LabProject } from "../types/ProjectsDashboard.types";

interface ProjectsDashboardTableProps {
  data: LabProject[];
  loading: boolean;
  renderActionCell: (proyecto: LabProject) => React.ReactNode;
}

export const ProjectsDashboardTable: React.FC<ProjectsDashboardTableProps> = ({
  data,
  loading,
  renderActionCell,
}) => {
  const columns: ColumnConfig[] = [
    {
      key: "proyecto_id",
      label: "ID",
      width: 80,
      align: "center",
    },
    {
      key: "nombre_proyecto",
      label: "Proyecto",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{ maxWidth: 250, wordWrap: "break-word" }}
        >
          {String(value)}
        </Typography>
      ),
    },
    { key: "solicitante", label: "Solicitante" },
    {
      key: "fecha",
      label: "Fecha",
      render: (value) => new Date(String(value)).toLocaleDateString(),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <Chip
          label={String(value)}
          color={value === "activo" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      key: "ensayos",
      label: "Ensayos",
      align: "center",
      render: (_, row) => renderActionCell(row as LabProject),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="proyecto_id"
      loading={loading}
      emptyMessage="No se encontraron proyectos"
    />
  );
};
