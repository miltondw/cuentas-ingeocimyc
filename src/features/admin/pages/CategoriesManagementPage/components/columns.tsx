import type { ColumnConfig } from "@/components/common/DataTable";
import type { ServiceCategory } from "@/types/admin";
import { Typography, Chip } from "@mui/material";

export const getCategoryColumns = (
  formatDate: (date: string) => string
): ColumnConfig[] => [
  {
    key: "code",
    label: "Código",
    sortable: true,
    render: (value) => (
      <Typography variant="body2" fontWeight="medium">
        {String(value)}
      </Typography>
    ),
  },
  {
    key: "name",
    label: "Nombre",
    sortable: true,
  },
  {
    key: "services",
    label: "Servicios",
    render: (value) => {
      const services = value as ServiceCategory["services"];
      return (
        <Chip
          label={`${services?.length || 0} servicios`}
          size="small"
          color={services?.length ? "success" : "default"}
        />
      );
    },
  },
  {
    key: "created_at",
    label: "Fecha de Creación",
    sortable: true,
    render: (value) => formatDate(value as string),
  },
];
