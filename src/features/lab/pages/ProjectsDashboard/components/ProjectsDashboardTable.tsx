import React from "react";
import { Typography, Chip } from "@mui/material";

import { DataTable, ColumnConfig } from "@/components/common/DataTable";
import { LabProject } from "../types/ProjectsDashboard.types";
import { ProjectStatus, ProjectAssayStatus } from "@/types/system";

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
      key: "identificacion",
      label: "Identificación",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: value ? "medium" : "normal",
            color: value ? "text.primary" : "text.secondary",
          }}
          title={value ? String(value) : "Sin identificación"}
        >
          {value ? String(value) : "—"}
        </Typography>
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      render: (value) => new Date(String(value)).toLocaleDateString(),
    },
    {
      key: "estado",
      label: "Estado Proyecto",
      render: (value) => {
        // Validar que el valor es un estado válido del enum
        const estadoStr = String(value).toLowerCase();
        const estado = Object.values(ProjectStatus).includes(
          estadoStr as ProjectStatus
        )
          ? (estadoStr as ProjectStatus)
          : ProjectStatus.ACTIVO; // Valor por defecto si no coincide

        const STATUS_LABELS: Record<ProjectStatus, string> = {
          [ProjectStatus.ACTIVO]: "Activo",
          [ProjectStatus.COMPLETADO]: "Completado",
          [ProjectStatus.CANCELADO]: "Cancelado",
          [ProjectStatus.PAUSADO]: "Pausado",
        };
        const STATUS_COLORS: Record<
          ProjectStatus,
          "primary" | "success" | "error" | "warning"
        > = {
          [ProjectStatus.ACTIVO]: "primary",
          [ProjectStatus.COMPLETADO]: "success",
          [ProjectStatus.CANCELADO]: "error",
          [ProjectStatus.PAUSADO]: "warning",
        };
        return (
          <Chip
            label={STATUS_LABELS[estado] || String(value)}
            color={STATUS_COLORS[estado] || "default"}
            size="small"
          />
        );
      },
    },
    {
      key: "assigned_assays",
      label: "Estado Servicios",
      render: (value, row) => {
        const labProject = row as LabProject;
        const assays = labProject.assigned_assays || [];

        if (assays.length === 0) {
          // Si no hay ensayos asignados
          return <Chip label="Sin servicios" color="default" size="small" />;
        }

        // Contar los estados para determinar el estado consolidado
        let pendienteCount = 0;
        let enProcesoCount = 0;
        let completadoCount = 0;
        let canceladoCount = 0;

        assays.forEach((assay) => {
          const statusStr = String(assay.status || "").toLowerCase();
          switch (statusStr) {
            case ProjectAssayStatus.PENDIENTE:
              pendienteCount++;
              break;
            case ProjectAssayStatus.EN_PROCESO:
              enProcesoCount++;
              break;
            case ProjectAssayStatus.COMPLETADO:
              completadoCount++;
              break;
            case ProjectAssayStatus.CANCELADO:
              canceladoCount++;
              break;
            default:
              pendienteCount++; // Por defecto consideramos pendiente
          }
        });

        // Determinar el estado consolidado según las reglas especificadas
        let consolidatedStatus: ProjectAssayStatus;
        let statusLabel: string;

        if (completadoCount === assays.length) {
          // Todos están completados
          consolidatedStatus = ProjectAssayStatus.COMPLETADO;
          statusLabel = "Completado";
        } else if (pendienteCount === assays.length) {
          // Todos están pendientes
          consolidatedStatus = ProjectAssayStatus.PENDIENTE;
          statusLabel = "Pendiente";
        } else if (canceladoCount === assays.length) {
          // Todos están cancelados
          consolidatedStatus = ProjectAssayStatus.CANCELADO;
          statusLabel = "Cancelado";
        } else if (enProcesoCount === assays.length) {
          // Todos están en proceso
          consolidatedStatus = ProjectAssayStatus.EN_PROCESO;
          statusLabel = "En Proceso";
        } else {
          // Hay una mezcla de estados - mostrar "En Proceso"
          consolidatedStatus = ProjectAssayStatus.EN_PROCESO;
          statusLabel = "En Proceso";
        }

        const STATUS_COLORS: Record<
          ProjectAssayStatus,
          "warning" | "info" | "success" | "error"
        > = {
          [ProjectAssayStatus.PENDIENTE]: "warning",
          [ProjectAssayStatus.EN_PROCESO]: "info",
          [ProjectAssayStatus.COMPLETADO]: "success",
          [ProjectAssayStatus.CANCELADO]: "error",
        };

        return (
          <Chip
            label={statusLabel}
            color={STATUS_COLORS[consolidatedStatus]}
            size="small"
          />
        );
      },
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
