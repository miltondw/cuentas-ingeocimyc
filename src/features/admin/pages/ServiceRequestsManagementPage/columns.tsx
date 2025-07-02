import type {
  AdminServiceRequest,
  ServiceRequestStatus,
} from "@/types/serviceRequests";
import React from "react";
import {
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";

// Tipos estrictos para handlers y status info
export interface ServiceRequestTableHandlers {
  onView: (request: AdminServiceRequest) => void;
  onEditStatus: (request: AdminServiceRequest) => void;
  onDelete: (request: AdminServiceRequest) => void;
  onGeneratePDF: (id: number) => void;
  onRegeneratePDF: (id: number) => void;
  isGeneratingPDF: (id: number) => boolean;
  isRegeneratingPDF: (id: number) => boolean;
}

export interface StatusInfo {
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
}
export type GetStatusInfo = (status: ServiceRequestStatus) => StatusInfo;

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render: (value: unknown, row: T) => React.ReactNode;
}

export function getServiceRequestColumns(
  handlers: ServiceRequestTableHandlers,
  getStatusInfo: GetStatusInfo
): DataTableColumn<AdminServiceRequest>[] {
  return [
    {
      key: "id",
      label: "ID",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Typography variant="body2" fontWeight="medium">
          #{request.id}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Cliente",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {request.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {request.identification}
          </Typography>
        </Box>
      ),
    },
    {
      key: "nameProject",
      label: "Proyecto",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {request.nameProject}
        </Typography>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Typography variant="body2" color="text.secondary">
          {request.email}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (_: unknown, request: AdminServiceRequest) => {
        const statusInfo = getStatusInfo(request.status);
        return (
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
        );
      },
    },
    {
      key: "services",
      label: "Servicios",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Typography variant="body2">
          {request.selectedServices?.length || 0} servicio(s)
        </Typography>
      ),
    },
    {
      key: "created_at",
      label: "Fecha",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Typography variant="body2">{request.created_at}</Typography>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: unknown, request: AdminServiceRequest) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Ver detalles">
            <IconButton size="small" onClick={() => handlers.onView(request)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cambiar estado">
            <IconButton
              size="small"
              onClick={() => handlers.onEditStatus(request)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generar PDF">
            <IconButton
              size="small"
              onClick={() => handlers.onGeneratePDF(request.id)}
              disabled={handlers.isGeneratingPDF(request.id)}
            >
              <PdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Regenerar PDF">
            <IconButton
              size="small"
              onClick={() => handlers.onRegeneratePDF(request.id)}
              disabled={handlers.isRegeneratingPDF(request.id)}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handlers.onDelete(request)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
}
