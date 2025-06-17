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
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LandscapeIcon from "@mui/icons-material/Landscape";
import HardnessIcon from "@mui/icons-material/Terrain";
import FilterListIcon from "@mui/icons-material/FilterList";
import { projectsService } from "@/api/services";
import { useAuth } from "@/api/useAuth";
import { useProfiles } from "../hooks/useProfiles";
import type { Project, ProfilesFilters, Profile } from "@/types/api";

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

const ProjectProfiles = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    profileId: number | null;
  }>({ open: false, profileId: null });

  const [showFilters, setShowFilters] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { hasAnyRole } = useAuth();
  const { showNotification } = useNotifications();

  const projectIdNum = projectId ? parseInt(projectId) : 0;
  const {
    paginatedProfiles,
    loading: profilesLoading,
    error: profilesError,
    filters,
    updateFilters,
    deleteProfile,
  } = useProfiles(projectIdNum);

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
        setProjectError(
          err instanceof Error ? err.message : "Error al cargar el proyecto"
        );
      } finally {
        setProjectLoading(false);
      }
    };

    fetchProject();
  }, [projectIdNum]);

  const handleCreateProfile = () => {
    navigate(`/lab/proyectos/${projectId}/perfil/nuevo`);
  };

  const handleEditProfile = (profileId: number) => {
    navigate(`/lab/proyectos/${projectId}/perfil/${profileId}`);
  };
  const handleDeleteProfile = async () => {
    if (!deleteDialog.profileId) return;

    try {
      const result = await deleteProfile(deleteDialog.profileId);
      if (result.success) {
        setDeleteDialog({ open: false, profileId: null });
        showNotification({
          type: "success",
          title: "Perfil eliminado",
          message: "El perfil se eliminó correctamente",
          duration: 3000,
        });
      } else {
        console.error("Error al eliminar perfil:", result.error);
        showNotification({
          type: "error",
          title: "Error al eliminar",
          message: result.error || "Error desconocido al eliminar el perfil",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Error al eliminar perfil:", err);
      showNotification({
        type: "error",
        title: "Error al eliminar",
        message:
          err instanceof Error ? err.message : "Error al eliminar el perfil",
        duration: 5000,
      });
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    updateFilters({ page: newPage });
  };

  const handleFilterChange = (newFilters: Partial<ProfilesFilters>) => {
    updateFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filtering
  };

  const openDeleteDialog = (profileId: number) => {
    setDeleteDialog({ open: true, profileId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, profileId: null });
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

  const getCompletedDepthsCount = (
    blowsData?: Profile["blowsData"]
  ): number => {
    if (!blowsData || !blowsData.length) return 0;
    return blowsData.filter((blow) => blow.n > 0).length;
  };

  const getMaxN = (blowsData?: Profile["blowsData"]): number => {
    if (!blowsData || !blowsData.length) return 0;
    return Math.max(...blowsData.map((blow) => blow.n || 0));
  };

  const getMaxDepth = (blowsData?: Profile["blowsData"]): string => {
    if (!blowsData || !blowsData.length) return "0.00";
    const depthsWithData = blowsData.filter((blow) => blow.n > 0);
    if (depthsWithData.length === 0) return "0.00";
    return Math.max(...depthsWithData.map((blow) => blow.depth || 0)).toFixed(
      2
    );
  };

  const getSoilHardnessColor = (maxN: number): string => {
    if (maxN >= 50) return "#e53935"; // Muy duro - rojo
    if (maxN >= 30) return "#fb8c00"; // Duro - naranja
    if (maxN >= 10) return "#fdd835"; // Medio - amarillo
    return "#8bc34a"; // Blando - verde
  };

  const getSoilHardnessText = (maxN: number): string => {
    if (maxN >= 50) return "Suelo muy duro";
    if (maxN >= 30) return "Suelo duro";
    if (maxN >= 10) return "Suelo medio";
    return "Suelo blando";
  };

  if (projectLoading || profilesLoading) {
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

  if (projectError || profilesError) {
    const errorMessage = projectError || profilesError;
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

  const profiles = paginatedProfiles?.data || [];
  const pagination = paginatedProfiles?.pagination;
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {(projectLoading || profilesLoading) && (
        <LoadingOverlay loading={true}>
          <div />
        </LoadingOverlay>
      )}

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
          Perfiles de Suelo
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Filtrar perfiles">
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? "primary" : "default"}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        {hasAnyRole(["admin", "lab"]) && (
          <Tooltip title="Crear nuevo perfil">
            <IconButton
              color="primary"
              onClick={handleCreateProfile}
              sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "white",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                ml: 1,
              }}
              aria-label="Crear nuevo perfil"
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
            {" "}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Número de perfil"
                value={filters.profileNumber || ""}
                onChange={(e) =>
                  handleFilterChange({ profileNumber: e.target.value })
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Tipo de suelo"
                value={filters.soilType || ""}
                onChange={(e) =>
                  handleFilterChange({ soilType: e.target.value })
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Fecha desde"
                type="date"
                value={filters.drillingDate || ""}
                onChange={(e) =>
                  handleFilterChange({ drillingDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
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
            <strong>UBICACIÓN:</strong> {project.ubicacion || "No especificada"}
          </Typography>
          {project.descripcion && (
            <Typography variant="body2">
              <strong>DESCRIPCIÓN:</strong> {project.descripcion}
            </Typography>
          )}
          {pagination && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Mostrando {profiles.length} de {pagination.totalItems} perfiles
            </Typography>
          )}
        </Paper>
      )}

      {profiles.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
          <LandscapeIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6">
            No hay perfiles de suelo registrados para este proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {hasAnyRole(["admin", "lab"])
              ? "Haz clic en el botón + para crear un nuevo perfil"
              : "No tienes permisos para crear perfiles"}
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid2 container spacing={3}>
            {profiles.map((profile) => (
              <Grid2 size={{ xs: 12, sm: 6 }} key={profile.id}>
                <StyledCard>
                  <CardContent sx={{ py: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      {" "}
                      <Typography variant="h6" fontWeight="bold">
                        PERFIL #{profile.profileNumber.toUpperCase()}
                      </Typography>
                      {hasAnyRole(["admin", "lab"]) && (
                        <Box>
                          <Tooltip title="Editar perfil">
                            <IconButton
                              size="small"
                              onClick={() => handleEditProfile(profile.id)}
                              color="primary"
                              aria-label="Editar perfil"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar perfil">
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(profile.id)}
                              color="error"
                              aria-label="Eliminar perfil"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {" "}
                      <Typography variant="body1">
                        <strong>TIPO:</strong> {profile.profileType}
                      </Typography>
                      <Typography variant="body1">
                        <strong>FECHA:</strong>{" "}
                        {formatDate(profile.drillingDate)}
                      </Typography>
                      {profile.waterLevel && profile.waterLevel > 0 && (
                        <Typography variant="body1">
                          <strong>NIVEL FREÁTICO:</strong> {profile.waterLevel}{" "}
                          m
                        </Typography>
                      )}
                      <Typography variant="body1">
                        <strong>CAPAS:</strong> {profile.layerCount || 0}
                      </Typography>
                      <Typography variant="body1">
                        <strong>PROFUNDIDADES CON DATOS:</strong>{" "}
                        {getCompletedDepthsCount(profile.blowsData)} /{" "}
                        {profile.blowsData?.length || 0}
                      </Typography>
                      <Typography variant="body1">
                        <strong>PROFUNDIDAD MÁXIMA:</strong>{" "}
                        {getMaxDepth(profile.blowsData)} m
                      </Typography>
                      <Typography variant="body1">
                        <strong>N MÁXIMO:</strong> {getMaxN(profile.blowsData)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>DUREZA DEL SUELO:</strong>{" "}
                        {getSoilHardnessText(getMaxN(profile.blowsData))}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}
                    >
                      {" "}
                      <Chip
                        icon={<WaterDropIcon fontSize="small" />}
                        label={`${profile.layerCount || 0} capas`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<LandscapeIcon fontSize="small" />}
                        label={`${getCompletedDepthsCount(
                          profile.blowsData
                        )} / ${profile.blowsData?.length || 0} profundidades`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={
                          <HardnessIcon
                            sx={{
                              color: getSoilHardnessColor(
                                getMaxN(profile.blowsData)
                              ),
                            }}
                          />
                        }
                        label={getSoilHardnessText(getMaxN(profile.blowsData))}
                        size="small"
                        color="default"
                        variant="outlined"
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
        <Tooltip title="Crear nuevo perfil">
          <Fab
            color="primary"
            onClick={handleCreateProfile}
            sx={{ position: "fixed", bottom: 16, right: 16 }}
            aria-label="Crear nuevo perfil"
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
            ¿Estás seguro de que deseas eliminar este perfil? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteProfile} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectProfiles;
