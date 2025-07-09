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
  Terrain as TerrainIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Layers as LayersIcon,
  Science as ScienceIcon,
} from "@mui/icons-material";

import { labService } from "@/services/api/labService";
import { useNotifications } from "@/hooks/useNotifications";

// Interface específica para los apiques devueltos por el endpoint del proyecto
interface ProjectApiqueData {
  apique_id: number;
  proyecto_id: number;
  apique: number;
  location: string;
  depth: string;
  date: string;
  molde: number | null;
  cbr_unaltered?: boolean;
  depth_tomo?: string;
  layers: Array<{
    id: number;
    apiqueId: number;
    layerNumber: number;
    thickness: string;
    sampleId: string | null;
    observation: string | null;
  }>;
}

/**
 * Página de apiques de un proyecto
 */
const ProjectApiques = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  const [apiques, setApiques] = useState<ProjectApiqueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    apiqueId: number | null;
    apiqueName: string;
  }>({
    open: false,
    apiqueId: null,
    apiqueName: "",
  });
  // Cargar apiques del proyecto
  const fetchApiques = useCallback(async () => {
    if (!projectId) {
      return;
    }

    try {
      setLoading(true);
      const projectIdNum = parseInt(projectId);

      // Usar el nuevo endpoint específico para obtener apiques del proyecto
      const response = await labService.getProjectApiques(projectIdNum);

      setApiques(response.data);
    } catch (error) {
      console.error("Error cargando apiques:", error);
      //showError("Error al cargar los apiques del proyecto");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchApiques();
  }, [fetchApiques]);

  // Navegar para crear nuevo apique
  const handleCreateApique = useCallback(() => {
    navigate(`/lab/proyectos/${projectId}/apique/nuevo`);
  }, [navigate, projectId]);

  // Navegar para editar apique
  const handleEditApique = useCallback(
    (apiqueId: number) => {
      navigate(`/lab/proyectos/${projectId}/apique/${apiqueId}`);
    },
    [navigate, projectId]
  );

  // Abrir dialog de confirmación para eliminar
  const handleDeleteClick = useCallback((apique: ProjectApiqueData) => {
    setDeleteDialog({
      open: true,
      apiqueId: apique.apique_id,
      apiqueName: `Apique ${apique.apique}`,
    });
  }, []);

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialog.apiqueId) return;

    try {
      await labService.deleteApique(deleteDialog.apiqueId, Number(projectId));
      showSuccess("Apique eliminado correctamente");
      setDeleteDialog({ open: false, apiqueId: null, apiqueName: "" });

      // Recargar la lista
      fetchApiques();
    } catch (error) {
      console.error("Error eliminando apique:", error);
      showError("Error al eliminar el apique");
    }
  }, [deleteDialog.apiqueId, projectId, showSuccess, showError, fetchApiques]);

  // Cancelar eliminación
  const handleCancelDelete = useCallback(() => {
    setDeleteDialog({ open: false, apiqueId: null, apiqueName: "" });
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
              Apiques del Proyecto
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Proyecto ID: {projectId}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateApique}
            size="large"
          >
            Nuevo Apique
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Estadísticas */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              icon={<TerrainIcon />}
              label={`${apiques.length} Apiques`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<LayersIcon />}
              label={`${apiques.reduce(
                (sum, apique) => sum + apique.layers.length,
                0
              )} Capas totales`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<ScienceIcon />}
              label={`${
                apiques.filter((apique) => apique.cbr_unaltered).length
              } Con CBR`}
              color="success"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Lista de apiques */}
        {apiques.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <TerrainIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay apiques registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comience creando el primer apique para este proyecto
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateApique}
              size="large"
            >
              Crear Primer Apique
            </Button>
          </Box>
        ) : (
          <Grid2 container spacing={3}>
            {apiques.map((apique) => (
              <Grid2 size={{ xs: 12, sm: 6, lg: 4 }} key={apique.apique_id}>
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
                    {/* Header del apique */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" component="h2">
                        Apique {apique.apique}
                      </Typography>
                      <Chip
                        icon={<LayersIcon />}
                        label={`${apique.layers.length} capas`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {/* Información principal */}
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocationOnIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {apique.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CalendarTodayIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(apique.date)}
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
                          Profundidad: {apique.depth}m
                        </Typography>
                        {apique.cbr_unaltered && (
                          <Chip
                            label="CBR"
                            size="small"
                            color="success"
                            variant="filled"
                          />
                        )}
                      </Box>

                      {apique.depth_tomo && (
                        <Typography variant="body2" color="text.secondary">
                          Toma: {apique.depth_tomo}m
                        </Typography>
                      )}

                      {apique.molde && (
                        <Typography variant="body2" color="text.secondary">
                          Molde: {apique.molde}
                        </Typography>
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
                      <Tooltip title="Editar apique">
                        <IconButton
                          onClick={() => handleEditApique(apique.apique_id)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar apique">
                        <IconButton
                          onClick={() => handleDeleteClick(apique)}
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
            ))}
          </Grid2>
        )}

        {/* Botón flotante para agregar (solo en móvil) */}
        <Fab
          color="primary"
          aria-label="Agregar apique"
          onClick={handleCreateApique}
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
              ¿Está seguro que desea eliminar {deleteDialog.apiqueName}? Esta
              acción no se puede deshacer y se perderán todos los datos
              asociados al apique.
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

export default ProjectApiques;
