import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Pagination,
  Alert,
  TableSortLabel,
  Grid2,
  Box,
  Chip,
  Fab,
  useMediaQuery,
  Stack,
  Drawer,
  Skeleton,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import LandscapeIcon from "@mui/icons-material/Landscape";
import BlurCircularIcon from "@mui/icons-material/BlurCircular";
import CloseIcon from "@mui/icons-material/Close";
import api from "@api";
import {
  cacheProjects,
  getCachedProjects,
} from "../../../utils/offlineStorage";
import { debounce } from "lodash";

// TypeScript interfaces
interface Project {
  proyecto_id: string;
  fecha: string;
  solicitante: string;
  nombre_proyecto: string;
}

interface ProjectCounts {
  [key: string]: { profiles: number; apiques: number };
}

interface Filters {
  fechaInicio: string;
  fechaFin: string;
  solicitante: string;
  nombre_proyecto: string;
}

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface TableColumn {
  id: string;
  label: string;
  sortable: boolean;
  filterType?: "text" | "date";
  width: number;
}

// Table column definitions
const tableColumns: TableColumn[] = [
  {
    id: "fecha",
    label: "Fecha",
    sortable: true,
    filterType: "date",
    width: 120,
  },
  {
    id: "solicitante",
    label: "Solicitante",
    sortable: true,
    filterType: "text",
    width: 150,
  },
  {
    id: "nombre_proyecto",
    label: "Proyecto",
    sortable: true,
    filterType: "text",
    width: 200,
  },
  { id: "perfiles", label: "Perfiles", sortable: true, width: 150 },
  { id: "apiques", label: "Apiques", sortable: true, width: 150 },
];

const formatDate = (dateStr: string): string =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" })
    : "";

// Skeleton loader component
const TableSkeleton: React.FC = () => (
  <TableBody>
    {[...Array(5)].map((_, index) => (
      <TableRow key={index}>
        {tableColumns.map((column) => (
          <TableCell key={column.id}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);

// Filter Drawer for Mobile
interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (field: string, value: string) => void;
  onClearFilters: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}) => (
  <Drawer anchor="right" open={open} onClose={onClose}>
    <Box sx={{ p: 2, width: 300 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Filtros</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Fecha inicio"
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => onFilterChange("fechaInicio", e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Fecha fin"
            type="date"
            value={filters.fechaFin}
            onChange={(e) => onFilterChange("fechaFin", e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Solicitante"
            value={filters.solicitante}
            onChange={(e) => onFilterChange("solicitante", e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Nombre del proyecto"
            value={filters.nombre_proyecto}
            onChange={(e) => onFilterChange("nombre_proyecto", e.target.value)}
            variant="outlined"
            size="small"
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={onClearFilters}
          >
            Limpiar Filtros
          </Button>
        </Grid2>
      </Grid2>
    </Box>
  </Drawer>
);

// Action Menu for Profiles and Apiques
interface ActionMenuProps {
  projectId: string;
  type: "profiles" | "apiques";
  onNavigate: (projectId: string, action: string) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  projectId,
  type,
  onNavigate,
}) => {
  const isProfile = type === "profiles";

  const handleAction = (action: string) => {
    onNavigate(projectId, action);
  };

  return (
    <>
      <MenuItem onClick={() => handleAction(isProfile ? "viewP" : "viewA")}>
        <VisibilityIcon fontSize="small" />
      </MenuItem>
      <MenuItem
        onClick={() => handleAction(isProfile ? "newProfile" : "newApique")}
      >
        <AddIcon fontSize="small" />
      </MenuItem>
    </>
  );
};

const ProjectsDashboard: React.FC = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const [state, setState] = useState<{
    projects: Project[];
    projectCounts: ProjectCounts;
    filters: Filters;
    sortConfig: SortConfig;
    loading: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    showFilters: boolean;
    totalItems: number;
  }>({
    projects: [],
    projectCounts: {},
    filters: {
      fechaInicio: "",
      fechaFin: "",
      solicitante: "",
      nombre_proyecto: "",
    },
    sortConfig: { field: "fecha", direction: "desc" },
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    showFilters: false,
    totalItems: 0,
  });

  const rowsPerPage = 10;

  // Memoized query params
  const buildQueryParams = useMemo(
    () => (): Record<string, string | number> => ({
      page: state.currentPage,
      limit: rowsPerPage,
      sort: state.sortConfig.field,
      order: state.sortConfig.direction,
      ...Object.fromEntries(
        Object.entries(state.filters).filter(([_, value]) => value)
      ),
    }),
    [state.currentPage, state.sortConfig, state.filters]
  );

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      if (!navigator.onLine) {
        const cachedProjects: Project[] = await getCachedProjects();
        setState((prev) => ({
          ...prev,
          projects: cachedProjects,
          totalPages: 1,
          totalItems: cachedProjects.length,
          loading: false,
        }));
        return;
      }
      const params = buildQueryParams();
      const response = await api.get("/projects", { params });
      const {
        proyectos: projects = [],
        totalPages,
        total,
      } = response.data as {
        proyectos: Project[];
        totalPages: number;
        total: number;
      };
      await cacheProjects(projects);
      setState((prev) => ({
        ...prev,
        projects,
        totalPages,
        totalItems: total,
        loading: false,
      }));
      fetchProjectCounts(projects);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: `Error al cargar proyectos: ${error.message}`,
        loading: false,
      }));
    }
  }, [buildQueryParams]);

  // Fetch project counts
  const fetchProjectCounts = useCallback(async (projects: Project[]) => {
    const counts: ProjectCounts = {};
    await Promise.all(
      projects.map(async (project) => {
        try {
          const profilesResponse = await api.get(
            `/projects/${project.proyecto_id}/profiles`
          );
          const apiquesResponse = await api.get(
            `/projects/${project.proyecto_id}/apiques`
          );
          counts[project.proyecto_id] = {
            profiles: profilesResponse.data.perfiles?.length || 0,
            apiques: apiquesResponse.data.apiques?.length || 0,
          };
        } catch (error) {
          console.error(`Error en proyecto ${project.proyecto_id}:`, error);
          counts[project.proyecto_id] = { profiles: 0, apiques: 0 };
        }
      })
    );
    setState((prev) => ({
      ...prev,
      projectCounts: { ...prev.projectCounts, ...counts },
    }));
  }, []);

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      setState((prev) => ({
        ...prev,
        filters: { ...prev.filters, [field]: value },
        currentPage: 1,
      }));
    }, 300),
    []
  );

  // Effect for fetching projects
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, state.currentPage, state.filters, state.sortConfig]);

  // Handlers
  const handleSort = useCallback((field: string) => {
    setState((prev) => ({
      ...prev,
      sortConfig: {
        field,
        direction:
          prev.sortConfig.field === field && prev.sortConfig.direction === "asc"
            ? "desc"
            : "asc",
      },
      currentPage: 1,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {
        fechaInicio: "",
        fechaFin: "",
        solicitante: "",
        nombre_proyecto: "",
      },
      currentPage: 1,
    }));
  }, []);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setState((prev) => ({ ...prev, currentPage: page }));
    },
    []
  );

  const handleNavigate = useCallback(
    (projectId: string, type: string) => {
      const basePath = `/lab/proyectos/${projectId}`;
      const paths: Record<string, string> = {
        viewP: `${basePath}/perfiles`,
        viewA: `${basePath}/apiques`,
        newProfile: `${basePath}/perfil/nuevo`,
        newApique: `${basePath}/apique/nuevo`,
      };
      navigate(paths[type]);
    },
    [navigate]
  );

  const toggleFilters = useCallback(() => {
    setState((prev) => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  // Memoized table rows for mobile card layout
  const mobileCards = useMemo(
    () =>
      state.projects.map((project) => (
        <Paper key={project.proyecto_id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {project.nombre_proyecto}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fecha: {formatDate(project.fecha)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Solicitante: {project.solicitante || "-"}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Chip
              label={state.projectCounts[project.proyecto_id]?.profiles ?? 0}
              color="primary"
              variant="outlined"
              size="small"
              icon={<BlurCircularIcon fontSize="small" />}
            />
            <ActionMenu
              projectId={project.proyecto_id}
              type="profiles"
              onNavigate={handleNavigate}
            />
          </Stack>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Chip
              label={state.projectCounts[project.proyecto_id]?.apiques ?? 0}
              color="secondary"
              variant="outlined"
              size="small"
              icon={<BlurCircularIcon fontSize="small" />}
            />
            <ActionMenu
              projectId={project.proyecto_id}
              type="apiques"
              onNavigate={handleNavigate}
            />
          </Stack>
        </Paper>
      )),
    [state.projects, state.projectCounts, handleNavigate]
  );

  return (
    <Box
      sx={{
        m: { xs: 2, md: 3 },
        p: { xs: 1, md: 2 },
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"}>
          Gestión de Proyectos
        </Typography>
        {!isMobile && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={toggleFilters}
            size="medium"
          >
            Filtros
          </Button>
        )}
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {!isMobile && state.showFilters && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Grid2 container spacing={2}>
            {[
              { id: "fechaInicio", label: "Fecha inicio", type: "date" },
              { id: "fechaFin", label: "Fecha fin", type: "date" },
              { id: "solicitante", label: "Solicitante", type: "text" },
              {
                id: "nombre_proyecto",
                label: "Nombre del proyecto",
                type: "text",
              },
            ].map((field) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={field.id}>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type}
                  value={state.filters[field.id as keyof Filters]}
                  onChange={(e) =>
                    debouncedFilterChange(field.id, e.target.value)
                  }
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid2>
            ))}
            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                >
                  Limpiar Filtros
                </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </Paper>
      )}

      {isMobile && (
        <FilterDrawer
          open={state.showFilters}
          onClose={toggleFilters}
          filters={state.filters}
          onFilterChange={debouncedFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {state.loading ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                {tableColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      width: column.width,
                      display:
                        isMobile && column.id === "solicitante"
                          ? "none"
                          : "table-cell",
                    }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={state.sortConfig.field === column.id}
                        direction={state.sortConfig.direction}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableSkeleton />
          </Table>
        </TableContainer>
      ) : state.projects.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <LandscapeIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6">No hay proyectos disponibles</Typography>
        </Paper>
      ) : isMobile ? (
        <Box>{mobileCards}</Box>
      ) : (
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: 650 }}
            size="medium"
            aria-label="Tabla de proyectos"
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                {tableColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      width: column.width,
                    }}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={state.sortConfig.field === column.id}
                        direction={state.sortConfig.direction}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {state.projects.map((project) => (
                <TableRow key={project.proyecto_id} hover>
                  <TableCell>{formatDate(project.fecha)}</TableCell>
                  <TableCell>{project.solicitante || "-"}</TableCell>
                  <TableCell sx={{ fontWeight: "medium" }}>
                    {project.nombre_proyecto}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={
                          state.projectCounts[project.proyecto_id]?.profiles ??
                          0
                        }
                        color="primary"
                        variant="outlined"
                        size="small"
                        icon={<BlurCircularIcon fontSize="small" />}
                      />
                      <ActionMenu
                        projectId={project.proyecto_id}
                        type="profiles"
                        onNavigate={handleNavigate}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={
                          state.projectCounts[project.proyecto_id]?.apiques ?? 0
                        }
                        color="secondary"
                        variant="outlined"
                        size="small"
                        icon={<BlurCircularIcon fontSize="small" />}
                      />
                      <ActionMenu
                        projectId={project.proyecto_id}
                        type="apiques"
                        onNavigate={handleNavigate}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={state.totalPages}
          page={state.currentPage}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? "small" : "medium"}
        />
      </Box>

      {isMobile && (
        <Fab
          color="primary"
          aria-label="filtros"
          onClick={toggleFilters}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          size="medium"
        >
          <FilterListIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ProjectsDashboard;
