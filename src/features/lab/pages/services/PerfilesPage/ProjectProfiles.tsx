import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid2,
  Button,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Fab,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Science as ScienceIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  WaterDrop as WaterDropIcon,
  Layers as LayersIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

import { labService } from "@/services/api/labService";
import { useNotifications } from "@/hooks/useNotifications";

// Interface para los datos de perfiles del proyecto
interface ProjectProfileData {
  id: number;
  projectId: number;
  soundingNumber: string;
  waterLevel: string;
  profileDate: string;
  samplesNumber: number;
  location: string | null;
  blows: Array<{
    id: number;
    profileId: number;
    depth: string;
    blows6: number;
    blows12: number;
    blows18: number;
    n: number;
    observation: string | null;
  }>;
}

/**
 * Página de perfiles de un proyecto
 */
const ProjectProfiles = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  const [profiles, setProfiles] = useState<ProjectProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    profileId: number | null;
    profileName: string;
  }>({
    open: false,
    profileId: null,
    profileName: "",
  });
  // Cargar perfiles del proyecto
  const fetchProfiles = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const projectIdNum = parseInt(projectId);

      const response = await labService.getProjectProfiles(projectIdNum);

      // La API devuelve directamente un array, no un objeto con data
      const profilesData = Array.isArray(response)
        ? response
        : response.data || [];
      setProfiles(profilesData);
    } catch (error) {
      console.error("Error cargando perfiles:", error);
      showError("Error al cargar los perfiles del proyecto");
    } finally {
      setLoading(false);
    }
  }, [projectId, showError]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Navegar para crear nuevo perfil
  const handleCreateProfile = useCallback(() => {
    navigate(`/lab/proyectos/${projectId}/perfil/nuevo`);
  }, [navigate, projectId]);

  // Navegar para editar perfil
  const handleEditProfile = useCallback(
    (profileId: number) => {
      navigate(`/lab/proyectos/${projectId}/perfil/${profileId}`);
    },
    [navigate, projectId]
  );

  // Abrir dialog de confirmación para eliminar
  const handleDeleteClick = useCallback((profile: ProjectProfileData) => {
    setDeleteDialog({
      open: true,
      profileId: profile.id,
      profileName: `Sondeo ${profile.soundingNumber}`,
    });
  }, []);

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialog.profileId) return;

    try {
      await labService.deleteProfile(deleteDialog.profileId);
      showSuccess("Perfil eliminado correctamente");
      setDeleteDialog({ open: false, profileId: null, profileName: "" });

      // Recargar la lista
      fetchProfiles();
    } catch (error) {
      console.error("Error eliminando perfil:", error);
      showError("Error al eliminar el perfil");
    }
  }, [deleteDialog.profileId, showSuccess, showError, fetchProfiles]);

  // Cancelar eliminación
  const handleCancelDelete = useCallback(() => {
    setDeleteDialog({ open: false, profileId: null, profileName: "" });
  }, []);

  // Volver al dashboard
  const handleGoBack = useCallback(() => {
    navigate("/lab/proyectos");
  }, [navigate]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  // Calcular estadísticas para un perfil
  const getProfileStats = (profile: ProjectProfileData) => {
    const blows = profile.blows || [];
    const activeBlow = blows.filter((blow) => blow.n > 0);
    const maxN =
      activeBlow.length > 0 ? Math.max(...activeBlow.map((blow) => blow.n)) : 0;
    const maxDepth =
      activeBlow.length > 0
        ? Math.max(...activeBlow.map((blow) => parseFloat(blow.depth)))
        : 0;
    const totalBlows = activeBlow.length;

    return { maxN, maxDepth, totalBlows };
  };

  if (loading) {
    return (
      <Box
        sx={{
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
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Tooltip title="Volver al dashboard de proyectos">
            <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Perfiles de Sondeo del Proyecto
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Proyecto ID: {projectId}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateProfile}
            size="large"
          >
            Nuevo Perfil
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Estadísticas */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={<ScienceIcon />}
              label={`${profiles.length} Perfiles`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<TrendingUpIcon />}
              label={`${profiles.reduce(
                (sum, profile) =>
                  sum + profile.blows.filter((blow) => blow.n > 0).length,
                0
              )} Golpes registrados`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<WaterDropIcon />}
              label={`${
                profiles.filter(
                  (profile) =>
                    profile.waterLevel && parseFloat(profile.waterLevel) > 0
                ).length
              } Con nivel freático`}
              color="info"
              variant="outlined"
            />
            <Chip
              icon={<LayersIcon />}
              label={`${profiles.reduce(
                (sum, profile) => sum + profile.samplesNumber,
                0
              )} Muestras totales`}
              color="success"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Lista de perfiles */}
        {profiles.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <ScienceIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay perfiles registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comience creando el primer perfil de sondeo para este proyecto
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateProfile}
              size="large"
            >
              Crear Primer Perfil
            </Button>
          </Box>
        ) : (
          <Grid2 container spacing={3}>
            {profiles.map((profile) => {
              const stats = getProfileStats(profile);
              return (
                <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} key={profile.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header del perfil */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" component="h2">
                          Sondeo {profile.soundingNumber}
                        </Typography>
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`N máx: ${stats.maxN}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      {/* Información principal */}
                      <Stack spacing={2}>
                        {profile.location && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LocationOnIcon
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {profile.location}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarTodayIcon
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(profile.profileDate)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Prof. máx: {stats.maxDepth.toFixed(2)}m
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Golpes: {stats.totalBlows}
                          </Typography>
                        </Box>

                        {profile.waterLevel &&
                          parseFloat(profile.waterLevel) > 0 && (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <WaterDropIcon
                                sx={{ mr: 1, color: "primary.main" }}
                              />
                              <Typography variant="body2" color="primary.main">
                                Nivel freático: {profile.waterLevel}m
                              </Typography>
                            </Box>
                          )}

                        {profile.samplesNumber > 0 && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LayersIcon
                              sx={{ mr: 1, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Muestras: {profile.samplesNumber}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>

                    {/* Acciones */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Editar perfil">
                          <IconButton
                            onClick={() => handleEditProfile(profile.id)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar perfil">
                          <IconButton
                            onClick={() => handleDeleteClick(profile)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Card>
                </Grid2>
              );
            })}
          </Grid2>
        )}

        {/* Botón flotante para agregar (solo en móvil) */}
        <Fab
          color="primary"
          aria-label="Agregar perfil"
          onClick={handleCreateProfile}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { xs: "flex", sm: "none" },
          }}
        >
          <AddIcon />
        </Fab>

        {/* Dialog de confirmación de eliminación */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleCancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              ¿Está seguro que desea eliminar {deleteDialog.profileName}? Esta
              acción no se puede deshacer y se perderán todos los datos del
              perfil incluyendo los golpes registrados.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              autoFocus
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ProjectProfiles;
