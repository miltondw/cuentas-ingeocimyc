import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Alert,
  Box,
  Chip,
  Fab,
  useMediaQuery,
  Stack,
  Container,
  Card,
  Toolbar,
  Tooltip,
  CircularProgress,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LandscapeIcon from "@mui/icons-material/Landscape";
import BlurCircularIcon from "@mui/icons-material/BlurCircular";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import { projectsService } from "@/api";
import { useAuth } from "@/api/useAuth";
import type { Project, ProjectFilters } from "@/types/api";
import { useApiData } from "@/api/hooks/useApiData";

// TypeScript interfaces
interface ProjectCounts {
  [key: string]: {
    profiles: number;
    apiques: number;
  };
}

type ProjectStatus = "activo" | "completado" | "suspendido" | "cancelado";

// Constants
const ITEMS_PER_PAGE = 10;
const PROJECT_STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "completado", label: "Completado" },
  { value: "suspendido", label: "Suspendido" },
  { value: "cancelado", label: "Cancelado" },
] as const;

// Utility functions
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
};

const getStatusColor = (
  status: ProjectStatus
):
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning" => {
  switch (status) {
    case "activo":
      return "info";
    case "completado":
      return "success";
    case "suspendido":
      return "warning";
    case "cancelado":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: ProjectStatus): string => {
  const option = PROJECT_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
};

// Main component
const ProjectsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hasRole } = useAuth();

  // State for local functionality
  const [projectCounts, setProjectCounts] = useState<ProjectCounts>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modern data management with useApiData hook
  const {
    data: projects,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refetch: refreshProjects,
  } = useApiData<Project, ProjectFilters>({
    service: projectsService.getProjects,
    initialFilters: {
      page: 1,
      limit: ITEMS_PER_PAGE,
      sortBy: "created_at",
      sortOrder: "DESC",
    },
    autoFetch: hasRole("lab") || hasRole("admin"),
    debounceMs: 300,
  });

  // Derived state from pagination
  const totalPages = pagination?.totalPages || 1;
  const totalCount = pagination?.totalItems || 0;
  const page = pagination?.currentPage || 1;

  // Load project counts when projects change
  useEffect(() => {
    if (!projects.length) return;

    const loadProjectCounts = async () => {
      const counts: ProjectCounts = {};
      await Promise.all(
        projects.map(async (project) => {
          try {
            const [profilesCount, apiquesCount] = await Promise.all([
              projectsService.getProjectProfilesCount(project.id.toString()),
              projectsService.getProjectApiquesCount(project.id.toString()),
            ]);
            counts[project.id] = {
              profiles: profilesCount,
              apiques: apiquesCount,
            };
          } catch (countError) {
            console.warn(
              `Error loading counts for project ${project.id}:`,
              countError
            );
            counts[project.id] = { profiles: 0, apiques: 0 };
          }
        })
      );
      setProjectCounts(counts);
    };

    loadProjectCounts();
  }, [projects]);

  // Handlers for search and filter
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      updateFilters({ nombreProyecto: value, page: 1 });
    },
    [updateFilters]
  );

  const handleStatusFilterChange = useCallback(
    (value: string) => {
      setStatusFilter(value);
      const filterUpdate: Partial<ProjectFilters> = { page: 1 };
      if (value && value !== "") {
        filterUpdate.status = value as ProjectStatus;
      } else {
        // Clear status filter
        filterUpdate.status = undefined;
      }
      updateFilters(filterUpdate);
    },
    [updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    updateFilters({
      nombreProyecto: "",
      status: undefined,
      sortBy: "created_at",
      sortOrder: "DESC",
      page: 1,
    });
  }, [updateFilters]);

  const handleSort = useCallback(
    (field: string) => {
      const isCurrentField = filters.sortBy === field;
      const newOrder =
        isCurrentField && filters.sortOrder === "DESC" ? "ASC" : "DESC";
      updateFilters({ sortBy: field, sortOrder: newOrder, page: 1 });
    },
    [filters.sortBy, filters.sortOrder, updateFilters]
  );

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, newPage: number) => {
      updateFilters({ page: newPage });
    },
    [updateFilters]
  );

  const handleViewProject = useCallback(
    (projectId: number) => {
      navigate(`/lab/proyectos/${projectId}/apiques`);
    },
    [navigate]
  );

  const handleCreateProject = useCallback(() => {
    navigate("/lab/projects/new");
  }, [navigate]);

  // Check permissions
  if (!hasRole("lab") && !hasRole("admin")) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          No tienes permisos para ver los proyectos
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Proyectos de Laboratorio
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los proyectos y visualiza perfiles y apiques de suelos
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refreshProjects()}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Card>
        <Toolbar sx={{ px: 2 }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              `${totalCount} proyecto${totalCount !== 1 ? "s" : ""}`
            )}
          </Typography>

          {hasRole("admin") && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProject}
            >
              Nuevo Proyecto
            </Button>
          )}
        </Toolbar>

        {/* Search and Filter Section */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar proyecto"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
                placeholder="Buscar por nombre del proyecto..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={!searchTerm && !statusFilter}
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Projects Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={filters.sortBy === "created_at"}
                    direction={
                      filters.sortBy === "created_at"
                        ? filters.sortOrder === "ASC"
                          ? "asc"
                          : "desc"
                        : "desc"
                    }
                    onClick={() => handleSort("created_at")}
                  >
                    Fecha
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
                    active={filters.sortBy === "nombreProyecto"}
                    direction={
                      filters.sortBy === "nombreProyecto"
                        ? filters.sortOrder === "ASC"
                          ? "asc"
                          : "desc"
                        : "desc"
                    }
                    onClick={() => handleSort("nombreProyecto")}
                  >
                    Proyecto
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Perfiles/Apiques</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                    <TableCell>
                      <CircularProgress size={20} />
                    </TableCell>
                  </TableRow>
                ))
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron proyectos
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const counts = projectCounts[project.id] || {
                    profiles: 0,
                    apiques: 0,
                  };
                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>{formatDate(project.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {project.solicitante}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {project.nombreProyecto}
                          </Typography>
                          {project.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {project.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(project.status)}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Chip
                            icon={<LandscapeIcon />}
                            label={counts.profiles}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<BlurCircularIcon />}
                            label={counts.apiques}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver proyecto">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewProject(project.id)}
                          >
                            Ver
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
            />
          </Box>
        )}
      </Card>

      {hasRole("admin") && !isMobile && (
        <Fab
          color="primary"
          aria-label="Crear proyecto"
          onClick={handleCreateProject}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default ProjectsDashboard;
