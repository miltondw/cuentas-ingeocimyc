import { Box, Chip, Typography, Button, Tooltip } from "@mui/material";
import {
  Category as CategoryIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import {
  SearchAndFilter,
  FilterField,
} from "@/components/common/SearchAndFilter";
import { FC } from "react";
import { FilterValue } from "@/types/labFilters";

interface Props {
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters: Record<string, unknown>;
  onFilterChange: (
    key: "category" | "hasAdditionalFields" | "createdDateRange",
    value: FilterValue
  ) => void;
  activeFiltersCount: number;
  onClearAll: () => void;
  filteredCount: number;
}

const ServicesFilters: FC<Props> = ({
  searchValue,
  onSearchChange,
  filters,
  onFilterChange,
  activeFiltersCount,
  onClearAll,
  filteredCount,
}) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <CategoryIcon sx={{ color: "primary.main", fontSize: 24 }} />
      <Typography
        variant="h6"
        fontWeight="600"
        sx={{
          background: (theme) =>
            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Filtros de Búsqueda
      </Typography>
      {activeFiltersCount > 0 && (
        <Chip
          label={`${activeFiltersCount} filtro${
            activeFiltersCount > 1 ? "s" : ""
          } activo${activeFiltersCount > 1 ? "s" : ""}`}
          size="small"
          color="primary"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      )}
      <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
        {activeFiltersCount > 0 && (
          <>
            <Chip
              label={`${filteredCount} resultado${
                filteredCount !== 1 ? "s" : ""
              }`}
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Tooltip title="Limpiar todos los filtros">
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={onClearAll}
                sx={{
                  minWidth: "auto",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Limpiar
              </Button>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
    <SearchAndFilter
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar servicios por nombre o código..."
      filters={[] as FilterField[]} // Los filtros reales se pasan desde el page
      filterValues={filters}
      onFilterChange={onFilterChange}
      showFilterCount
      collapsible={true}
      initialExpanded={true}
      size="small"
      variant="outlined"
    />
    {activeFiltersCount === 0 && !searchValue && (
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: (theme) => theme.palette.info.light,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="white" sx={{ fontStyle: "italic" }}>
          💡 Utiliza los filtros para encontrar servicios específicos por
          categoría, campos adicionales o fecha de creación
        </Typography>
      </Box>
    )}
  </Box>
);

export default ServicesFilters;
