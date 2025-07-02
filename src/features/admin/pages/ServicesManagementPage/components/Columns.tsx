import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { Build as BuildIcon } from "@mui/icons-material";
import { ColumnConfig, Service } from "../types/types";

export function getCategoryName(
  categoryId: number,
  categories: { id: number; name: string }[]
) {
  const category = categories.find((cat) => cat.id === categoryId);
  return category?.name || "Sin categoría";
}

export function getCategoryColor(categoryId: number) {
  const colors = [
    "primary",
    "secondary",
    "success",
    "warning",
    "info",
  ] as const;
  return colors[categoryId % colors.length];
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const getColumns = (
  categories: { id: number; name: string }[]
): ColumnConfig[] => [
  {
    key: "code",
    label: "Código",
    sortable: true,
    render: (value: unknown) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          label={String(value)}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: "monospace",
            fontWeight: "bold",
            borderColor: "primary.main",
            color: "primary.main",
          }}
        />
      </Box>
    ),
  },
  {
    key: "name",
    label: "Nombre",
    sortable: true,
    render: (value: unknown) => (
      <Box>
        <Typography variant="body2" fontWeight="medium" color="text.primary">
          {String(value)}
        </Typography>
      </Box>
    ),
  },
  {
    key: "categoryId",
    label: "Categoría",
    render: (value: unknown) => (
      <Chip
        label={getCategoryName(value as number, categories)}
        size="small"
        color={getCategoryColor(value as number)}
        variant="filled"
        sx={{
          fontWeight: 500,
          "& .MuiChip-label": {
            px: 1.5,
          },
        }}
      />
    ),
  },
  {
    key: "additionalFields",
    label: "Campos Adicionales",
    render: (value: unknown) => {
      const fields = value as Service["additionalFields"];
      const count = fields?.length || 0;
      return (
        <Tooltip
          title={
            count > 0
              ? `${count} campos configurados`
              : "Sin campos adicionales"
          }
        >
          <Chip
            label={`${count} campos`}
            size="small"
            color={count > 0 ? "success" : "default"}
            variant={count > 0 ? "filled" : "outlined"}
            icon={<BuildIcon sx={{ fontSize: 16 }} />}
            sx={{
              fontWeight: 500,
              "& .MuiChip-icon": {
                fontSize: 16,
              },
            }}
          />
        </Tooltip>
      );
    },
  },
  {
    key: "created_at",
    label: "Fecha de Creación",
    sortable: true,
    render: (value: unknown) => (
      <Box>
        <Typography variant="body2" color="text.secondary">
          {formatDate(value as string)}
        </Typography>
      </Box>
    ),
  },
];
