import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Divider,
  Fab,
  Grid2,
  Paper,
  Chip,
  useMediaQuery,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  styled,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TerrainIcon from "@mui/icons-material/Terrain";
import LayersIcon from "@mui/icons-material/Layers";
import ScienceIcon from "@mui/icons-material/Science";
import FilterListIcon from "@mui/icons-material/FilterList";
import { projectsService } from "@/api";
import { useAuth } from "@/api/useAuth";
import { useApiques } from "../hooks/useApiques";
import type { Project, ApiquesFilters, Apique } from "@/types/api";

// Import modern components
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { useNotifications } from "@/api/hooks/useNotifications";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const ProjectApiques = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    apiqueId: number | null;
  }>({ open: false, apiqueId: null });

  const [showFilters, setShowFilters] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { hasAnyRole } = useAuth();
  const { showNotification } = useNotifications();

  const projectIdNum = projectId ? parseInt(projectId) : 0;
  const {
    paginatedApiques,
    loading: apiquesLoading,
    error: apiquesError,
    filters,
    updateFilters,
    deleteApique,
  } = useApiques(projectIdNum);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectIdNum) return;

      try {
        setProjectLoading(true);
        setProjectError(null);
        const projectResponse = await projectsService.getProject(projectIdNum);
        setProject(projectResponse);
      } catch (err) {
        console.error("Error al cargar proyecto:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar el proyecto";
        setProjectError(errorMessage);
        showNotification({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectIdNum, showNotification]);
  const handleCreateApique = () => {
    navigate(`/lab/proyectos/${projectId}/apique/nuevo`);
  };

  const handleEditApique = (apiqueId: number) => {
    navigate(`/lab/proyectos/${projectId}/apique/${apiqueId}`);
  };
  const handleDeleteApique = async () => {
    if (!deleteDialog.apiqueId) return;

    try {
      const result = await deleteApique(deleteDialog.apiqueId);
      if (result.success) {
        showNotification({
          type: "success",
          message: "Apique eliminado exitosamente",
        });
        setDeleteDialog({ open: false, apiqueId: null });
      } else {
        showNotification({
          type: "error",
          message: result.error || "Error al eliminar el apique",
        });
        console.error("Error al eliminar apique:", result.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error inesperado al eliminar el apique";
      showNotification({
        type: "error",
        message: errorMessage,
      });
      console.error("Error al eliminar apique:", err);
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    updateFilters({ page: newPage });
  };

  const handleFilterChange = (newFilters: Partial<ApiquesFilters>) => {
    updateFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filtering
  };

  const handleStatusChange = (status: string) => {
    if (status === "all") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status: _, ...filtersWithoutStatus } = filters;
      updateFilters(filtersWithoutStatus);
    } else {
      handleFilterChange({ status: status as ApiquesFilters["status"] });
    }
  };

  const openDeleteDialog = (apiqueId: number) => {
    setDeleteDialog({ open: true, apiqueId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, apiqueId: null });
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/D";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const getLayersCount = (layers?: unknown[]): number => {
    return layers?.length || 0;
  };
  const getSamplesCount = (layers?: unknown[]): number => {
    if (!layers) return 0;
    return layers.filter(
      (layer: unknown) => (layer as { sampleId?: string }).sampleId
    ).length;
  };

  const getMaxDepth = (apique: Apique): string => {
    return apique.depth?.toFixed(2) || "0.00";
  };
  if (projectLoading || apiquesLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Volver a proyectos"
          >
            <ArrowBackIcon />
          </IconButton>
          <Skeleton variant="text" width={200} sx={{ ml: 2 }} />
        </Box>
        <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
        <Grid2 container spacing={3}>
          {[1, 2, 3, 4].map((_, index) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={index}>
              <Skeleton variant="rectangular" height={150} />
            </Grid2>
          ))}
        </Grid2>
      </Container>
    );
  }

  if (projectError || apiquesError) {
    const errorMessage = projectError || apiquesError;
    return (
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Volver a proyectos"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Error</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Container>
    );
  }

  const apiques = paginatedApiques?.data || [];
  const pagination = paginatedApiques?.pagination;
  return (
    <LoadingOverlay
      loading={projectLoading || apiquesLoading}
      message={projectLoading ? "Cargando proyecto..." : "Cargando apiques..."}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Tooltip title="Volver a proyectos">
            <IconButton
              onClick={() => navigate(-1)}
              aria-label="Volver a proyectos"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" sx={{ ml: 2, fontWeight: "bold" }}>
            Apiques de Suelo
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Filtrar apiques">
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? "primary" : "default"}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          {hasAnyRole(["admin", "lab"]) && (
            <Tooltip title="Crear nuevo apique">
              <IconButton
                color="primary"
                onClick={handleCreateApique}
                sx={{
                  backgroundColor: (theme) => theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.primary.dark,
                  },
                  ml: 1,
                }}
                aria-label="Crear nuevo apique"
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Filtros */}
        {showFilters && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.status || "all"}
                    label="Estado"
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="collected">Recolectado</MenuItem>
                    <MenuItem value="analyzing">Analizando</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                    <MenuItem value="reported">Reportado</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Número de muestra"
                  value={filters.sampleNumber || ""}
                  onChange={(e) =>
                    handleFilterChange({ sampleNumber: e.target.value })
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Profundidad mínima"
                  type="number"
                  value={filters.minDepth || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      minDepth: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Profundidad máxima"
                  type="number"
                  value={filters.maxDepth || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      maxDepth: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </Grid2>
            </Grid2>
          </Paper>
        )}

        {project && (
          <Paper
            sx={{ p: 3, mb: 4, backgroundColor: "#f5f9ff", borderRadius: 2 }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              PROYECTO: {project.nombreProyecto.toUpperCase()}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>UBICACIÓN:</strong>{" "}
              {project.ubicacion || "No especificada"}
            </Typography>
            {project.descripcion && (
              <Typography variant="body2">
                <strong>DESCRIPCIÓN:</strong> {project.descripcion}
              </Typography>
            )}
            {pagination && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Mostrando {apiques.length} de {pagination.totalItems} apiques
              </Typography>
            )}
          </Paper>
        )}

        {apiques.length === 0 ? (
          <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
            <TerrainIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6">
              No hay apiques registrados para este proyecto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {hasAnyRole(["admin", "lab"])
                ? "Haz clic en el botón + para crear un nuevo apique"
                : "No tienes permisos para crear apiques"}
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid2 container spacing={3}>
              {apiques.map((apique) => (
                <Grid2 size={{ xs: 12, sm: 6 }} key={apique.id}>
                  <StyledCard>
                    <CardContent sx={{ py: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          APIQUE #{apique.sampleNumber.toUpperCase()}
                        </Typography>
                        {hasAnyRole(["admin", "lab"]) && (
                          <Box>
                            <Tooltip title="Editar apique">
                              <IconButton
                                size="small"
                                onClick={() => handleEditApique(apique.id)}
                                color="primary"
                                aria-label="Editar apique"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar apique">
                              <IconButton
                                size="small"
                                onClick={() => openDeleteDialog(apique.id)}
                                color="error"
                                aria-label="Eliminar apique"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography variant="body1">
                          <strong>FECHA:</strong>{" "}
                          {formatDate(apique.collectionDate)}
                        </Typography>
                        <Typography variant="body1">
                          <strong>UBICACIÓN:</strong>{" "}
                          {apique.location || "No especificada"}
                        </Typography>
                        <Typography variant="body1">
                          <strong>PROFUNDIDAD:</strong> {getMaxDepth(apique)} m
                        </Typography>
                        <Typography variant="body1">
                          <strong>CAPAS:</strong>{" "}
                          {getLayersCount(apique.layers)}
                        </Typography>
                        <Typography variant="body1">
                          <strong>MUESTRAS:</strong>{" "}
                          {getSamplesCount(apique.layers)}
                        </Typography>
                        <Typography variant="body1">
                          <strong>ESTADO:</strong> {apique.status}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mt: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          icon={<LayersIcon fontSize="small" />}
                          label={`${getLayersCount(apique.layers)} capas`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<ScienceIcon fontSize="small" />}
                          label={`${getSamplesCount(apique.layers)} muestras`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {apique.cbrUnaltered && (
                          <Chip
                            label="CBR Inalterado"
                            size="small"
                            color="secondary"
                          />
                        )}
                        <Chip
                          label={apique.status}
                          size="small"
                          color={
                            apique.status === "completed"
                              ? "success"
                              : apique.status === "analyzing"
                              ? "warning"
                              : apique.status === "reported"
                              ? "info"
                              : "default"
                          }
                        />
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid2>
              ))}
            </Grid2>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            )}
          </>
        )}

        {isMobile && hasAnyRole(["admin", "lab"]) && (
          <Tooltip title="Crear nuevo apique">
            <Fab
              color="primary"
              onClick={handleCreateApique}
              sx={{ position: "fixed", bottom: 16, right: 16 }}
              aria-label="Crear nuevo apique"
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}

        <Dialog
          open={deleteDialog.open}
          onClose={closeDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Confirmar Eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              ¿Estás seguro de que deseas eliminar este apique? Esta acción no
              se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog}>Cancelar</Button>
            <Button onClick={handleDeleteApique} color="error" autoFocus>
              Eliminar
            </Button>{" "}
          </DialogActions>
        </Dialog>
      </Container>
    </LoadingOverlay>
  );
};

export default ProjectApiques;
