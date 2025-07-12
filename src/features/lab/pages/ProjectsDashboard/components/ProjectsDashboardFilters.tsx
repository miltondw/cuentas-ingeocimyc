import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid2,
  Stack,
  Typography,
  CircularProgress,
  Collapse,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import {
  BOOLEAN_FILTER_OPTIONS,
  NUMERIC_FILTER_FIELDS,
} from "../types/ProjectsDashboard.constants";
import {
  LocalSearchInputs,
  LabProjectFilters,
} from "../types/ProjectsDashboard.types";
import { ProjectStatus, ProjectAssayStatus } from "@/types/system";

interface ProjectsDashboardFiltersProps {
  localSearchInputs: LocalSearchInputs;
  filters: LabProjectFilters;
  filtersLoading: boolean;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  handleSearchInputChange: (
    field: keyof LocalSearchInputs,
    value: string
  ) => void;
  handleSearchKeyPress: (event: React.KeyboardEvent) => void;
  updateFilter: (
    key: keyof LabProjectFilters,
    value: string | number | boolean | undefined
  ) => void;
  clearFilters: () => void;
  applySearchFilters: () => void;
  hasActiveFilters: boolean;
  paginationData: { totalItems: number };
}

export const ProjectsDashboardFilters: React.FC<
  ProjectsDashboardFiltersProps
> = ({
  localSearchInputs,
  filters,
  filtersLoading,
  showAdvancedFilters,
  setShowAdvancedFilters,
  handleSearchInputChange,
  handleSearchKeyPress,
  updateFilter,
  clearFilters,
  applySearchFilters,
  hasActiveFilters,
  paginationData,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Grid2 container spacing={2} alignItems="center">
        {/* Búsqueda global prominente */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Búsqueda global"
            variant="outlined"
            size="small"
            value={localSearchInputs.search}
            onChange={(e) => handleSearchInputChange("search", e.target.value)}
            onKeyDown={handleSearchKeyPress}
            placeholder="Buscar en proyectos, solicitantes "
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
              endAdornment:
                filtersLoading && localSearchInputs.search ? (
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                ) : null,
            }}
            helperText={
              localSearchInputs.search && filtersLoading
                ? "Buscando..."
                : localSearchInputs.search &&
                  localSearchInputs.search !== (filters.search || "")
                ? "Escribiendo... (Enter para buscar)"
                : "Busca en nombre del proyecto, solicitante"
            }
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Estado Proyecto</InputLabel>
            <Select
              value={filters.estado || "todos"}
              label="Estado Proyecto"
              onChange={(e) => updateFilter("estado", e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value={ProjectStatus.ACTIVO}>Activo</MenuItem>
              <MenuItem value={ProjectStatus.COMPLETADO}>Completado</MenuItem>
              <MenuItem value={ProjectStatus.PAUSADO}>Pausado</MenuItem>
              <MenuItem value={ProjectStatus.CANCELADO}>Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 2 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Estado Servicios</InputLabel>
            <Select
              value={filters.assignedAssayStatus || "todos"}
              label="Estado Servicios"
              onChange={(e) =>
                updateFilter("assignedAssayStatus", e.target.value)
              }
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value={ProjectAssayStatus.PENDIENTE}>
                Pendiente
              </MenuItem>
              <MenuItem value={ProjectAssayStatus.EN_PROCESO}>
                En Proceso
              </MenuItem>
              <MenuItem value={ProjectAssayStatus.COMPLETADO}>
                Completado
              </MenuItem>
              <MenuItem value={ProjectAssayStatus.CANCELADO}>
                Cancelado
              </MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={
              showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            Más Filtros
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Stack direction="row" spacing={1}>
            {(localSearchInputs.search !== (filters.search || "") ||
              localSearchInputs.nombreProyecto !==
                (filters.nombreProyecto || "") ||
              localSearchInputs.solicitante !==
                (filters.solicitante || "")) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={applySearchFilters}
                disabled={filtersLoading}
                sx={{ whiteSpace: "nowrap" }}
              >
                Buscar
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              sx={{ whiteSpace: "nowrap" }}
            >
              Limpiar
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ alignSelf: "center" }}
            >
              {paginationData?.totalItems ?? 0} resultado(s)
            </Typography>
          </Stack>
        </Grid2>
      </Grid2>
      {/* Filtros avanzados */}
      <Collapse in={showAdvancedFilters}>
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Filtros específicos (alternativos a la búsqueda global)
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Buscar proyecto específico"
                variant="outlined"
                size="small"
                value={localSearchInputs.nombreProyecto}
                onChange={(e) =>
                  handleSearchInputChange("nombreProyecto", e.target.value)
                }
                onKeyDown={handleSearchKeyPress}
                placeholder="Nombre exacto del proyecto..."
                InputProps={{
                  endAdornment:
                    filtersLoading && localSearchInputs.nombreProyecto ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                }}
                helperText={
                  localSearchInputs.nombreProyecto && filtersLoading
                    ? "Buscando..."
                    : localSearchInputs.nombreProyecto &&
                      localSearchInputs.nombreProyecto !==
                        (filters.nombreProyecto || "")
                    ? "Escribiendo... (Enter para buscar)"
                    : "Solo nombre del proyecto"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Identificación"
                variant="outlined"
                size="small"
                value={filters.identificacion || ""}
                onChange={(e) => updateFilter("identificacion", e.target.value)}
                placeholder="Buscar por identificación..."
                InputProps={{
                  endAdornment:
                    filtersLoading && filters.identificacion ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                }}
                helperText="Número o código de identificación"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Solicitante específico"
                variant="outlined"
                size="small"
                value={localSearchInputs.solicitante}
                onChange={(e) =>
                  handleSearchInputChange("solicitante", e.target.value)
                }
                onKeyDown={handleSearchKeyPress}
                placeholder="Nombre exacto del solicitante..."
                InputProps={{
                  endAdornment:
                    filtersLoading && localSearchInputs.solicitante ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : null,
                }}
                helperText={
                  localSearchInputs.solicitante && filtersLoading
                    ? "Buscando..."
                    : localSearchInputs.solicitante &&
                      localSearchInputs.solicitante !==
                        (filters.solicitante || "")
                    ? "Escribiendo... (Enter para buscar)"
                    : "Solo solicitante"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }} />
            <Grid2 size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Filtros por fecha y contadores
              </Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Fecha desde"
                type="date"
                variant="outlined"
                size="small"
                value={filters.startDate || ""}
                onChange={(e) => updateFilter("startDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Fecha hasta"
                type="date"
                variant="outlined"
                size="small"
                value={filters.endDate || ""}
                onChange={(e) => updateFilter("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Tiene Apiques</InputLabel>
                <Select
                  value={
                    filters.hasApiques === undefined
                      ? ""
                      : filters.hasApiques.toString()
                  }
                  label="Tiene Apiques"
                  onChange={(e) =>
                    updateFilter(
                      "hasApiques",
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true"
                    )
                  }
                >
                  {BOOLEAN_FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.value === ""
                        ? option.label
                        : `${option.label} Apiques`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Tiene Perfiles</InputLabel>
                <Select
                  value={
                    filters.hasProfiles === undefined
                      ? ""
                      : filters.hasProfiles.toString()
                  }
                  label="Tiene Perfiles"
                  onChange={(e) =>
                    updateFilter(
                      "hasProfiles",
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true"
                    )
                  }
                >
                  {BOOLEAN_FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.value === ""
                        ? option.label
                        : `${option.label} Perfiles`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            {NUMERIC_FILTER_FIELDS.map((field) => (
              <Grid2 key={field.key} size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label={field.label}
                  type="number"
                  variant="outlined"
                  size="small"
                  value={filters[field.key] || ""}
                  onChange={(e) =>
                    updateFilter(
                      field.key as keyof LabProjectFilters,
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      </Collapse>
    </Paper>
  );
};
