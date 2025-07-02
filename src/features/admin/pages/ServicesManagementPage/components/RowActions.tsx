import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import type { RowAction, Service } from "../types/types";
import { NavigateFunction } from "react-router-dom";

export const getRowActions = (
  navigate: NavigateFunction,
  setDeletingService: (service: Service) => void
): RowAction<unknown>[] => [
  {
    key: "view",
    label: "Ver detalles",
    icon: <ViewIcon />,
    action: (row: unknown) =>
      navigate(`/admin/services/${(row as Service).id}`),
    color: "secondary",
  },
  {
    key: "edit",
    label: "Editar servicio",
    icon: <EditIcon />,
    action: (row: unknown) =>
      navigate(`/admin/services/${(row as Service).id}/edit`),
    color: "primary",
  },
  {
    key: "delete",
    label: "Eliminar servicio",
    icon: <DeleteIcon />,
    color: "error",
    action: (row: unknown) => setDeletingService(row as Service),
  },
];
