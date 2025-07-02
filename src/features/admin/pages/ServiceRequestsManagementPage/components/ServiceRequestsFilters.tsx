import React from "react";
import {
  Box,
  Button,
  TextField,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid2,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

interface ServiceRequestsFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  filters: any;
  handleFilterChange: (field: string, value: unknown) => void;
  handleClearFilters: () => void;
  categories: Array<{ id: number; name: string }>;
  selectedIds: Set<number>;
  setShowBulkDeleteConfirm: (v: boolean) => void;
  deleteMutationPending: boolean;
}

const ServiceRequestsFilters: React.FC<ServiceRequestsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  filters,
  handleFilterChange,
  handleClearFilters,
  categories,
  selectedIds,
  setShowBulkDeleteConfirm,
  deleteMutationPending,
}) => (
  <Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 2, sm: 2 },
        mb: { xs: 2, sm: 3 },
      }}
    >
      <TextField
        placeholder="Buscar por nombre del cliente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ flexGrow: 1, order: { xs: 1, sm: 1 } }}
        slotProps={{
          input: {
            startAdornment: (
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            ),
          },
        }}
        size="medium"
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          order: { xs: 2, sm: 2 },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Button
          variant={showFilters ? "contained" : "outlined"}
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.25, sm: 1.5 },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Filtros
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          sx={{
            borderRadius: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.25, sm: 1.5 },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Limpiar
        </Button>
        {selectedIds.size > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowBulkDeleteConfirm(true)}
            disabled={deleteMutationPending}
            sx={{
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1.25, sm: 1.5 },
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Eliminar ({selectedIds.size})
          </Button>
        )}
      </Box>
    </Box>
    <Fade in={showFilters}>
      <Box sx={{ display: showFilters ? "block" : "none" }}>
        <Grid2 container spacing={{ xs: 2, sm: 3 }}>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.status || ""}
                label="Estado"
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
              >
                <MenuItem value="">Todos</MenuItem>
                {/* Opciones de estado deben venir por prop o constante */}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.categoryId || ""}
                label="Categoría"
                onChange={(e) =>
                  handleFilterChange("categoryId", e.target.value || undefined)
                }
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Fecha desde"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value || undefined)
              }
              fullWidth
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Fecha hasta"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value || undefined)
              }
              fullWidth
            />
          </Grid2>
        </Grid2>
      </Box>
    </Fade>
  </Box>
);

export default ServiceRequestsFilters;
