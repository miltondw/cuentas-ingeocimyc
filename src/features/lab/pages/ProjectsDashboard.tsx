import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Chip,
  Stack,
  IconButton,
  Tooltip,
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

import { labService, type LabProject } from "@/services/api/labService";
import { type LabProjectFilters } from "@/types/labFilters";
import { DataTable, type ColumnConfig } from "@/components/common/DataTable";
import DataTablePagination from "@/components/common/DataTablePagination";
import { useServerPagination } from "@/hooks/useServerPagination";
import { useQuery } from "@tanstack/react-query";

// Arrays para opciones de filtros - reduce repetición de componentes
const ESTADO_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "completado", label: "Completado" },
  { value: "pausado", label: "Pausado" },
  { value: "cancelado", label: "Cancelado" },
];

const BOOLEAN_FILTER_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "true", label: "Con" },
  { value: "false", label: "Sin" },
];

// Configuración de campos numéricos para evitar repetición
const NUMERIC_FILTER_FIELDS = [
  { key: "minApiques", label: "Mín. Apiques" },
  { key: "maxApiques", label: "Máx. Apiques" },
  { key: "minProfiles", label: "Mín. Perfiles" },
  { key: "maxProfiles", label: "Máx. Perfiles" },
] as const;

const ProjectsDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Estados locales para los campos de búsqueda (para mejor UX)
  const [localSearchInputs, setLocalSearchInputs] = useState({
    search: "", // Búsqueda global
    nombreProyecto: "",
    solicitante: "",
    obrero: "",
  });

  // Crear handlers para acciones de navegación
  const createNavigationHandler = useCallback(
    (basePath: string) => (projectId: number) => {
      navigate(`/lab/proyectos/${projectId}${basePath}`);
    },
    [navigate]
  );
  const handleCreateApique = createNavigationHandler("/apique/nuevo");
  const handleViewApiques = createNavigationHandler("/apiques");
  const handleCreateProfile = createNavigationHandler("/perfil/nuevo");
  const handleViewProfiles = createNavigationHandler("/perfiles");

  // Función para renderizar celdas de acciones - necesita estar dentro del componente para acceder a los handlers
  const renderActionCell = useCallback(
    (proyecto: LabProject, type: "apiques" | "perfiles") => {
      const count =
        type === "apiques" ? proyecto.total_apiques : proyecto.total_profiles;
      const icon = type === "apiques" ? <TerrainIcon /> : <ScienceIcon />;
      const createHandler =
        type === "apiques" ? handleCreateApique : handleCreateProfile;
      const viewHandler =
        type === "apiques" ? handleViewApiques : handleViewProfiles;
      const createTitle = type === "apiques" ? "Crear apique" : "Crear perfil";
      const viewTitle = type === "apiques" ? "Ver apiques" : "Ver perfiles";

      return (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <Chip icon={icon} label={count} size="small" variant="outlined" />
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={createTitle}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => createHandler(proyecto.proyecto_id)}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            {count > 0 && (
              <Tooltip title={viewTitle}>
                <IconButton
                  size="small"
                  color="info"
                  onClick={() => viewHandler(proyecto.proyecto_id)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      );
    },
    [
      handleCreateApique,
      handleViewApiques,
      handleCreateProfile,
      handleViewProfiles,
    ]
  );
  // Configuración de columnas para DataTable
  const tableColumns: ColumnConfig[] = useMemo(
    () => [
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
      {
        key: "solicitante",
        label: "Solicitante",
      },
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
        key: "total_apiques",
        label: "Apiques",
        align: "center",
        render: (_, row) => renderActionCell(row as LabProject, "apiques"),
      },
      {
        key: "total_profiles",
        label: "Perfiles",
        align: "center",
        render: (_, row) => renderActionCell(row as LabProject, "perfiles"),
      },
    ],
    [renderActionCell]
  );

  // Función auxiliar para crear getters de filtros
  const createFilterGetters = useCallback((searchParams: URLSearchParams) => {
    const getFilter = (key: string, defaultValue?: string) =>
      searchParams.get(key) || defaultValue;

    const getBooleanFilter = (key: string) => {
      const value = searchParams.get(key);
      return value === "true" ? true : value === "false" ? false : undefined;
    };

    const getNumberFilter = (key: string) => {
      const value = searchParams.get(key);
      return value ? parseInt(value) : undefined;
    };

    return { getFilter, getBooleanFilter, getNumberFilter };
  }, []);
  // Crear objeto de filtros desde los search params
  const filtersFromParams = useMemo((): LabProjectFilters => {
    const { getFilter, getBooleanFilter, getNumberFilter } =
      createFilterGetters(searchParams);

    return {
      page: getNumberFilter("page") || 1,
      limit: getNumberFilter("limit") || 10,
      sortBy: getFilter("sortBy", "fecha") as LabProjectFilters["sortBy"],
      sortOrder: getFilter(
        "sortOrder",
        "DESC"
      ) as LabProjectFilters["sortOrder"],
      estado: getFilter("estado", "todos") as LabProjectFilters["estado"],
      search: getFilter("search"), // Búsqueda global
      nombreProyecto: getFilter("nombreProyecto"),
      solicitante: getFilter("solicitante"),
      obrero: getFilter("obrero"),
      hasApiques: getBooleanFilter("hasApiques"),
      hasProfiles: getBooleanFilter("hasProfiles"),
      startDate: getFilter("startDate"),
      endDate: getFilter("endDate"),
      minApiques: getNumberFilter("minApiques"),
      maxApiques: getNumberFilter("maxApiques"),
      minProfiles: getNumberFilter("minProfiles"),
      maxProfiles: getNumberFilter("maxProfiles"),
    };
  }, [searchParams, createFilterGetters]);

  // Función para actualizar los filtros en la URL
  const updateUrlFilters = useCallback(
    (newFilters: Partial<LabProjectFilters>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // No incluir "todos" para el estado
          if (key === "estado" && value === "todos") {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        } else {
          newParams.delete(key);
        }
      });

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  ); // Usar los filtros desde search params
  const filters = filtersFromParams;
  const filtersLoading = false; // No hay loading con search params

  // Funciones para manejar filtros
  const updateFilters = updateUrlFilters;
  const updateFilter = useCallback(
    (
      key: keyof LabProjectFilters,
      value: string | number | boolean | undefined
    ) => {
      updateUrlFilters({ [key]: value });
    },
    [updateUrlFilters]
  );
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setLocalSearchInputs({
      search: "",
      nombreProyecto: "",
      solicitante: "",
      obrero: "",
    });
    setShowAdvancedFilters(false);
  }, [setSearchParams]);
  // Calcular filtros activos
  const hasActiveFilters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    const activeParams = Object.keys(params).filter(
      (key) => !["page", "limit", "sortBy", "sortOrder"].includes(key)
    );
    return activeParams.length > 0;
  }, [searchParams]);

  // Función para fetch de proyectos con formato de servidor
  const fetchLabProjects = async (filters: LabProjectFilters) => {
    console.info(
      "🚀 Iniciando petición al endpoint de proyectos con filtros:",
      filters
    );

    const result = await labService.getProjects(filters);

    console.info("📊 Datos de proyectos obtenidos:", result);

    // La API ya retorna en el formato correcto: { data, total, page, limit }
    return {
      data: result.data || [],
      total: result.total || 0,
      page: result.page || filters.page || 1,
      limit: result.limit || filters.limit || 10,
    };
  };

  // Hook personalizado para proyectos con paginación de servidor
  const useLabProjectsWithPagination = (
    filters: LabProjectFilters,
    enabled = true
  ) => {
    const queryResult = useQuery({
      queryKey: ["lab-projects", filters],
      queryFn: () => fetchLabProjects(filters),
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
      retry: (failureCount, error) => {
        // Retry logic para errores de red
        const axiosError = error as {
          code?: string;
          response?: { status: number };
          message?: string;
        };

        if (
          failureCount < 2 &&
          (axiosError?.code === "NETWORK_ERROR" ||
            (axiosError?.response?.status &&
              axiosError.response.status >= 500) ||
            axiosError?.message?.includes("fetch"))
        ) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return useServerPagination<LabProject>({
      apiResponse: queryResult.data,
      isLoading: queryResult.isLoading,
      error: queryResult.error,
    });
  }; // Paginación de servidor con hook reutilizable
  const {
    data: projects,
    isLoading: dataLoading,
    paginationData,
    error: dataError,
  } = useLabProjectsWithPagination(filters, !filtersLoading);

  // También necesitamos obtener el resumen total (sin filtros) para las estadísticas
  const { data: summaryData } = useQuery({
    queryKey: ["lab-projects-summary"],
    queryFn: () => labService.getProjects({ page: 1, limit: 1 }), // Solo para obtener el summary
    staleTime: 5 * 60 * 1000, // 5 minutos para summary
  });

  // Combinar estados de loading
  const loading = dataLoading || filtersLoading;
  const error = dataError?.message || null;

  // Handlers para sincronizar con URL
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );

  const handleRowsPerPageChange = useCallback(
    (newLimit: number) => {
      updateFilters({ limit: newLimit, page: 1 });
    },
    [updateFilters]
  );
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setLocalSearchInputs({
      search: "",
      nombreProyecto: "",
      solicitante: "",
      obrero: "",
    });
    setShowAdvancedFilters(false);
  }, [clearFilters]);
  // Sincronizar estados locales con filtros al cargar
  useEffect(() => {
    setLocalSearchInputs({
      search: filters.search || "",
      nombreProyecto: filters.nombreProyecto || "",
      solicitante: filters.solicitante || "",
      obrero: filters.obrero || "",
    });
  }, [
    filters.search,
    filters.nombreProyecto,
    filters.solicitante,
    filters.obrero,
  ]); // Función para aplicar los filtros de búsqueda
  const applySearchFilters = useCallback(() => {
    console.info("🔍 Aplicando filtros de búsqueda:", {
      search: localSearchInputs.search || undefined,
      nombreProyecto: localSearchInputs.nombreProyecto || undefined,
      solicitante: localSearchInputs.solicitante || undefined,
      obrero: localSearchInputs.obrero || undefined,
    });

    updateFilters({
      search: localSearchInputs.search || undefined,
      nombreProyecto: localSearchInputs.nombreProyecto || undefined,
      solicitante: localSearchInputs.solicitante || undefined,
      obrero: localSearchInputs.obrero || undefined,
      page: 1, // Reset a la primera página cuando se busca
    });
  }, [localSearchInputs, updateFilters]);
  // Debounce personalizado para campos de búsqueda
  useEffect(() => {
    const searchFiltersChanged =
      localSearchInputs.search !== (filters.search || "") ||
      localSearchInputs.nombreProyecto !== (filters.nombreProyecto || "") ||
      localSearchInputs.solicitante !== (filters.solicitante || "") ||
      localSearchInputs.obrero !== (filters.obrero || "");

    if (searchFiltersChanged) {
      const debounceTimer = setTimeout(() => {
        applySearchFilters();
      }, 1000); // 1 segundo de debounce para búsquedas

      return () => clearTimeout(debounceTimer);
    }
  }, [
    localSearchInputs,
    filters.search,
    filters.nombreProyecto,
    filters.solicitante,
    filters.obrero,
    applySearchFilters,
  ]);

  // Función para manejar cambios en los inputs de búsqueda
  const handleSearchInputChange = useCallback(
    (field: keyof typeof localSearchInputs, value: string) => {
      setLocalSearchInputs((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  ); // Función para aplicar búsqueda inmediatamente (al presionar Enter)
  const handleSearchKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevenir que se recargue la página
        event.stopPropagation(); // Prevenir propagación del evento
        console.info("⏩ Aplicando búsqueda inmediata con Enter");
        applySearchFilters();
      }
    },
    [applySearchFilters]
  );

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
            label={`${summaryData?.total || 0} Proyectos`}
            color="primary"
            variant="outlined"
          />{" "}
          <Chip
            label={`${paginationData.totalItems} Filtrados`}
            color={hasActiveFilters ? "success" : "default"}
            variant={hasActiveFilters ? "filled" : "outlined"}
          />
          {summaryData?.summary && (
            <>
              <Chip
                label={`${summaryData.summary.activeProjects} Activos`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`${summaryData.summary.totalApiques} Apiques`}
                color="info"
                variant="outlined"
              />
              <Chip
                label={`${summaryData.summary.totalProfiles} Perfiles`}
                color="secondary"
                variant="outlined"
              />
            </>
          )}{" "}
          {/* Indicador de búsqueda pendiente */}
          {(localSearchInputs.search !== (filters.search || "") ||
            localSearchInputs.nombreProyecto !==
              (filters.nombreProyecto || "") ||
            localSearchInputs.solicitante !== (filters.solicitante || "") ||
            localSearchInputs.obrero !== (filters.obrero || "")) && (
            <Chip
              label="Búsqueda pendiente..."
              color="warning"
              variant="filled"
              size="small"
              icon={<CircularProgress size={16} sx={{ color: "inherit" }} />}
            />
          )}
          {filtersLoading && (
            <Chip
              label="Cargando..."
              color="info"
              variant="filled"
              size="small"
              icon={<CircularProgress size={16} sx={{ color: "inherit" }} />}
            />
          )}
        </Box>{" "}
        {/* Filtros principales */}
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
                onChange={(e) =>
                  handleSearchInputChange("search", e.target.value)
                }
                onKeyDown={handleSearchKeyPress}
                placeholder="Buscar en proyectos, solicitantes y obreros..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    endAdornment:
                      filtersLoading && localSearchInputs.search ? (
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                      ) : null,
                  },
                }}
                helperText={
                  localSearchInputs.search && filtersLoading
                    ? "Buscando..."
                    : localSearchInputs.search &&
                      localSearchInputs.search !== (filters.search || "")
                    ? "Escribiendo... (Enter para buscar)"
                    : "Busca en nombre del proyecto, solicitante y obrero"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado || "todos"}
                  label="Estado"
                  onChange={(e) => updateFilter("estado", e.target.value)}
                >
                  {ESTADO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
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
                {/* Botón de buscar inmediato si hay cambios pendientes */}
                {(localSearchInputs.search !== (filters.search || "") ||
                  localSearchInputs.nombreProyecto !==
                    (filters.nombreProyecto || "") ||
                  localSearchInputs.solicitante !==
                    (filters.solicitante || "") ||
                  localSearchInputs.obrero !== (filters.obrero || "")) && (
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
                  {paginationData.totalItems} resultado(s)
                </Typography>
              </Stack>
            </Grid2>
          </Grid2>{" "}
          {/* Filtros avanzados */}
          <Collapse in={showAdvancedFilters}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Filtros específicos (alternativos a la búsqueda global)
              </Typography>
              <Grid2 container spacing={2}>
                {/* Filtros específicos de búsqueda */}
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
                    slotProps={{
                      input: {
                        endAdornment:
                          filtersLoading && localSearchInputs.nombreProyecto ? (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                          ) : null,
                      },
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
                    label="Solicitante específico"
                    variant="outlined"
                    size="small"
                    value={localSearchInputs.solicitante}
                    onChange={(e) =>
                      handleSearchInputChange("solicitante", e.target.value)
                    }
                    onKeyDown={handleSearchKeyPress}
                    placeholder="Nombre exacto del solicitante..."
                    slotProps={{
                      input: {
                        endAdornment:
                          filtersLoading && localSearchInputs.solicitante ? (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                          ) : null,
                      },
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
                <Grid2 size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Obrero específico"
                    variant="outlined"
                    size="small"
                    value={localSearchInputs.obrero}
                    onChange={(e) =>
                      handleSearchInputChange("obrero", e.target.value)
                    }
                    onKeyDown={handleSearchKeyPress}
                    placeholder="Nombre exacto del obrero..."
                    slotProps={{
                      input: {
                        endAdornment:
                          filtersLoading && localSearchInputs.obrero ? (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                          ) : null,
                      },
                    }}
                    helperText={
                      localSearchInputs.obrero && filtersLoading
                        ? "Buscando..."
                        : localSearchInputs.obrero &&
                          localSearchInputs.obrero !== (filters.obrero || "")
                        ? "Escribiendo... (Enter para buscar)"
                        : "Solo obrero"
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 3 }}>
                  {/* Espacio vacío para alineación */}
                </Grid2>
                {/* Separador visual */}
                <Grid2 size={12}>
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
                    slotProps={{ inputLabel: { shrink: true } }}
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
                    slotProps={{ inputLabel: { shrink: true } }}
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
                          field.key,
                          e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined
                        )
                      }
                    />
                  </Grid2>
                ))}
              </Grid2>
            </Box>
          </Collapse>
        </Paper>{" "}
        {/* Tabla de proyectos con DataTable */}
        <DataTable
          data={projects}
          columns={tableColumns}
          keyField="proyecto_id"
          loading={loading}
          emptyMessage="No se encontraron proyectos"
        />
        {/* Paginación */}
        {paginationData.totalItems > 0 && (
          <DataTablePagination
            paginationData={paginationData}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Proyectos por página:"
            showFirstLastButtons={true}
            showRowsPerPage={true}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ProjectsDashboard;
