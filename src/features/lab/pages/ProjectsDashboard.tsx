import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid2,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  TableSortLabel,
  Collapse,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Terrain as TerrainIcon,
  Science as ScienceIcon,
} from "@mui/icons-material";

import {
  labService,
  type LabProject,
  type LabProjectsResponse,
} from "@/services/api/labService";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import {
  DEFAULT_LAB_PROJECT_FILTERS,
  type LabProjectFilters,
} from "@/types/labFilters";

const ProjectsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectsData, setProjectsData] = useState<LabProjectsResponse | null>(
    null
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Hook de filtros con URL params
  const {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading: filtersLoading,
  } = useUrlFilters<LabProjectFilters>({
    defaultFilters: DEFAULT_LAB_PROJECT_FILTERS,
    debounceMs: 300,
    excludeFromUrl: [], // Incluir todos los filtros en la URL
  }); // Filtrar datos localmente (la API podría no soportar todos los filtros)
  const filteredData = useMemo(() => {
    if (!projectsData?.data) return [];

    let filtered = [...projectsData.data];

    // Aplicar filtros de búsqueda local
    if (filters.nombreProyecto) {
      filtered = filtered.filter((proyecto) =>
        proyecto.nombre_proyecto
          .toLowerCase()
          .includes(filters.nombreProyecto?.toLowerCase() || "")
      );
    }

    if (filters.solicitante) {
      filtered = filtered.filter((proyecto) =>
        proyecto.solicitante
          .toLowerCase()
          .includes(filters.solicitante?.toLowerCase() || "")
      );
    }

    if (filters.obrero) {
      filtered = filtered.filter((proyecto) =>
        proyecto.obrero
          .toLowerCase()
          .includes(filters.obrero?.toLowerCase() || "")
      );
    }

    if (filters.estado && filters.estado !== "todos") {
      filtered = filtered.filter(
        (proyecto) => proyecto.estado === filters.estado
      );
    }

    // Filtros de conteo
    if (filters.hasApiques !== undefined) {
      filtered = filtered.filter((proyecto) =>
        filters.hasApiques
          ? proyecto.total_apiques > 0
          : proyecto.total_apiques === 0
      );
    }

    if (filters.hasProfiles !== undefined) {
      filtered = filtered.filter((proyecto) => {
        const profilesCount = proyecto.total_profiles || 0;
        return filters.hasProfiles ? profilesCount > 0 : profilesCount === 0;
      });
    }

    if (filters.minApiques !== undefined) {
      filtered = filtered.filter(
        (proyecto) => proyecto.total_apiques >= (filters.minApiques || 0)
      );
    }
    if (filters.maxApiques !== undefined) {
      filtered = filtered.filter(
        (proyecto) => proyecto.total_apiques <= (filters.maxApiques || 999)
      );
    }

    if (filters.minProfiles !== undefined) {
      filtered = filtered.filter(
        (proyecto) =>
          (proyecto.total_profiles || 0) >= (filters.minProfiles || 0)
      );
    }

    if (filters.maxProfiles !== undefined) {
      filtered = filtered.filter(
        (proyecto) =>
          (proyecto.total_profiles || 0) <= (filters.maxProfiles || 999)
      );
    }

    // Ordenamiento
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: unknown = a[filters.sortBy as keyof LabProject];
        let bValue: unknown = b[filters.sortBy as keyof LabProject];

        // Manejar casos especiales
        if (filters.sortBy === "fecha") {
          aValue = new Date(a.fecha).getTime();
          bValue = new Date(b.fecha).getTime();
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return filters.sortOrder === "ASC" ? comparison : -comparison;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return filters.sortOrder === "ASC"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [projectsData, filters]);

  // Paginación local
  const paginatedData = useMemo(() => {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, filters.page, filters.limit]);

  // Funciones de manejo
  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      updateFilter("page", newPage + 1); // MUI usa 0-indexed, nosotros 1-indexed
    },
    [updateFilter]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFilters({
        limit: parseInt(event.target.value, 10),
        page: 1,
      });
    },
    [updateFilters]
  );

  const handleSort = useCallback(
    (field: string) => {
      const isCurrentField = filters.sortBy === field;
      const newOrder =
        isCurrentField && filters.sortOrder === "DESC" ? "ASC" : "DESC";
      updateFilters({
        sortBy: field as LabProjectFilters["sortBy"],
        sortOrder: newOrder,
        page: 1,
      });
    },
    [filters.sortBy, filters.sortOrder, updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setShowAdvancedFilters(false);
  }, [clearFilters]);

  // Funciones para acciones
  const handleCreateApique = useCallback(
    (projectId: number) => {
      console.info(`🔧 Crear apique para proyecto ${projectId}`);
      navigate(`/lab/proyectos/${projectId}/apique/nuevo`);
    },
    [navigate]
  );
  const handleViewApiques = useCallback(
    (projectId: number) => {
      console.info(`👁️ Ver apiques del proyecto ${projectId}`);
      navigate(`/lab/proyectos/${projectId}/apiques`);
    },
    [navigate]
  );

  const handleCreateProfile = useCallback(
    (projectId: number) => {
      console.info(`🔧 Crear perfil para proyecto ${projectId}`);
      navigate(`/lab/proyectos/${projectId}/perfil/nuevo`);
    },
    [navigate]
  );

  const handleViewProfiles = useCallback(
    (projectId: number) => {
      console.info(`👁️ Ver perfiles del proyecto ${projectId}`);
      navigate(`/lab/proyectos/${projectId}/perfiles`);
    },
    [navigate]
  );
  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.info(
          "🚀 Iniciando petición al endpoint de proyectos con filtros:",
          filters
        );

        // Llamar al nuevo servicio
        const result = await labService.getProjects(filters);

        console.info("📊 Datos de proyectos obtenidos:", result);
        setProjectsData(result);
      } catch (err) {
        console.error("❌ Error general:", err);
        setError("Error al cargar los datos de laboratorio");
      } finally {
        setLoading(false);
      }
    };

    if (!filtersLoading) {
      fetchData();
    }
  }, [filters, filtersLoading]);

  if (loading) {
    return (
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Proyectos de Laboratorio
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}{" "}
        {/* Estadísticas rápidas */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            icon={<TerrainIcon />}
            label={`${projectsData?.total || 0} Proyectos`}
            color="primary"
            variant="outlined"
          />

          <Chip
            label={`${filteredData.length} Filtrados`}
            color={hasActiveFilters ? "success" : "default"}
            variant={hasActiveFilters ? "filled" : "outlined"}
          />

          {projectsData?.summary && (
            <>
              <Chip
                label={`${projectsData.summary.activeProjects} Activos`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`${projectsData.summary.totalApiques} Apiques`}
                color="info"
                variant="outlined"
              />
              <Chip
                label={`${projectsData.summary.totalProfiles} Perfiles`}
                color="secondary"
                variant="outlined"
              />
            </>
          )}
        </Box>
        {/* Filtros principales */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Buscar proyecto"
                variant="outlined"
                size="small"
                value={filters.nombreProyecto || ""}
                onChange={(e) => updateFilter("nombreProyecto", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Solicitante"
                variant="outlined"
                size="small"
                value={filters.solicitante || ""}
                onChange={(e) => updateFilter("solicitante", e.target.value)}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Estado</InputLabel>{" "}
                <Select
                  value={filters.estado || "todos"}
                  label="Estado"
                  onChange={(e) => updateFilter("estado", e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="completado">Completado</MenuItem>
                  <MenuItem value="pausado">Pausado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
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

            <Grid2 size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
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
                  {filteredData.length} resultado(s)
                </Typography>
              </Stack>
            </Grid2>
          </Grid2>

          {/* Filtros avanzados */}
          <Collapse in={showAdvancedFilters}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Obrero"
                    variant="outlined"
                    size="small"
                    value={filters.obrero || ""}
                    onChange={(e) => updateFilter("obrero", e.target.value)}
                  />
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
                </Grid2>{" "}
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
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="true">Con Apiques</MenuItem>
                      <MenuItem value="false">Sin Apiques</MenuItem>
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
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="true">Con Perfiles</MenuItem>
                      <MenuItem value="false">Sin Perfiles</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Mín. Apiques"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={filters.minApiques || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minApiques",
                        e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Máx. Apiques"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={filters.maxApiques || ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxApiques",
                        e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Mín. Perfiles"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={filters.minProfiles || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minProfiles",
                        e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Máx. Perfiles"
                    type="number"
                    variant="outlined"
                    size="small"
                    value={filters.maxProfiles || ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxProfiles",
                        e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined
                      )
                    }
                  />
                </Grid2>
              </Grid2>
            </Box>
          </Collapse>
        </Paper>
        {/* Tabla de proyectos */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ maxHeight: 600 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === "proyecto_id"}
                    direction={
                      filters.sortBy === "proyecto_id"
                        ? filters.sortOrder === "ASC"
                          ? "asc"
                          : "desc"
                        : "desc"
                    }
                    onClick={() => handleSort("proyecto_id")}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === "nombre_proyecto"}
                    direction={
                      filters.sortBy === "nombre_proyecto"
                        ? filters.sortOrder === "ASC"
                          ? "asc"
                          : "desc"
                        : "desc"
                    }
                    onClick={() => handleSort("nombre_proyecto")}
                  >
                    Proyecto
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === "solicitante"}
                    direction={
                      filters.sortBy === "solicitante"
                        ? filters.sortOrder === "ASC"
                          ? "asc"
                          : "desc"
                        : "desc"
                    }
                    onClick={() => handleSort("solicitante")}
                  >
                    Solicitante
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === "fecha"}
                    direction={
                      filters.sortBy === "fecha"
                        ? filters.sortOrder === "ASC"
                          ? "asc"
                          : "desc"
                        : "desc"
                    }
                    onClick={() => handleSort("fecha")}
                  >
                    Fecha
                  </TableSortLabel>
                </TableCell>{" "}
                <TableCell>Estado</TableCell>
                <TableCell align="center">Apiques</TableCell>
                <TableCell align="center">Perfiles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((proyecto) => {
                return (
                  <TableRow key={proyecto.proyecto_id} hover>
                    <TableCell>{proyecto.proyecto_id}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ maxWidth: 250, wordWrap: "break-word" }}
                      >
                        {proyecto.nombre_proyecto}
                      </Typography>
                    </TableCell>
                    <TableCell>{proyecto.solicitante}</TableCell>
                    <TableCell>
                      {new Date(proyecto.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={proyecto.estado}
                        color={
                          proyecto.estado === "activo" ? "success" : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Chip
                          icon={<TerrainIcon />}
                          label={proyecto.total_apiques}
                          size="small"
                          variant="outlined"
                        />
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Crear apique">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleCreateApique(proyecto.proyecto_id)
                              }
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          {proyecto.total_apiques > 0 && (
                            <Tooltip title="Ver apiques">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() =>
                                  handleViewApiques(proyecto.proyecto_id)
                                }
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Chip
                          icon={<ScienceIcon />}
                          label={proyecto.total_profiles}
                          size="small"
                          variant="outlined"
                        />
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Crear perfil">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleCreateProfile(proyecto.proyecto_id)
                              }
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                          {proyecto.total_profiles > 0 && (
                            <Tooltip title="Ver perfiles">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() =>
                                  handleViewProfiles(proyecto.proyecto_id)
                                }
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={filters.limit || 10}
          page={(filters.page || 1) - 1} // Convertir de 1-indexed a 0-indexed para MUI
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};

export default ProjectsDashboard;
