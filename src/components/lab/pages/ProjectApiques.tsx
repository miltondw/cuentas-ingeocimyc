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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TerrainIcon from "@mui/icons-material/Terrain";
import LayersIcon from "@mui/icons-material/Layers";
import ScienceIcon from "@mui/icons-material/Science";
import api from "@api";

interface Layer {
  thickness?: number;
  sample_id?: string;
}

interface Apique {
  apique_id: string;
  apique: string;
  date?: string;
  location?: string;
  layers?: Layer[];
  cbr_unaltered?: boolean;
}

interface Project {
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const ProjectApiques = () => {
  const [apiques, setApiques] = useState<Apique[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    apiqueId: string | null;
  }>({ open: false, apiqueId: null });
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    const fetchProjectAndApiques = async () => {
      try {
        setLoading(true);
        const projectResponse = await api.get(`/projects/${projectId}`);
        setProject(projectResponse.data.project);

        const apiquesResponse = await api.get(`/projects/${projectId}/apiques`);
        setApiques(apiquesResponse.data.apiques || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los apiques. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndApiques();
  }, [projectId]);

  const handleCreateApique = () => {
    navigate(`/lab/proyectos/${projectId}/apique/nuevo`);
  };

  const handleEditApique = (apiqueId: string) => {
    navigate(`/lab/proyectos/${projectId}/apique/${apiqueId}`);
  };

  const handleDeleteApique = async (apiqueId: string) => {
    try {
      await api.delete(`/projects/${projectId}/apiques/${apiqueId}`);
      setApiques(apiques.filter((apique) => apique.apique_id !== apiqueId));
      setDeleteDialog({ open: false, apiqueId: null });
    } catch (err) {
      console.error("Error al eliminar apique:", err);
      setError("No se pudo eliminar el apique. Intenta de nuevo.");
    }
  };

  const openDeleteDialog = (apiqueId: string) => {
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

  const getLayersCount = (layers?: Layer[]): number => {
    return layers?.length || 0;
  };

  const getSamplesCount = (layers?: Layer[]): number => {
    if (!layers) return 0;
    return layers.filter((layer) => layer.sample_id).length;
  };

  const getMaxDepth = (layers?: Layer[]): string => {
    if (!layers || !layers.length) return "0.00";
    return layers
      .reduce(
        (sum, layer) => sum + parseFloat(layer.thickness?.toString() || "0"),
        0
      )
      .toFixed(2);
  };

  if (loading) {
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

  if (error) {
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
        <Paper sx={{ p: 3, backgroundColor: "#fff4f4" }}>
          <Typography color="error" aria-live="polite">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
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
            }}
            aria-label="Crear nuevo apique"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {project && (
        <Paper
          sx={{ p: 3, mb: 4, backgroundColor: "#f5f9ff", borderRadius: 2 }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            PROYECTO: {project.nombre.toUpperCase()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>UBICACIÓN:</strong> {project.ubicacion || "No especificada"}
          </Typography>
          {project.descripcion && (
            <Typography variant="body2">
              <strong>DESCRIPCIÓN:</strong> {project.descripcion}
            </Typography>
          )}
        </Paper>
      )}

      {apiques.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
          <TerrainIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6">
            No hay apiques registrados para este proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Haz clic en el botón + para crear un nuevo apique
          </Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={3}>
          {apiques.map((apique) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={apique.apique_id}>
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
                      APIQUE #{apique.apique.toUpperCase()}
                    </Typography>
                    <Box>
                      <Tooltip title="Editar apique">
                        <IconButton
                          size="small"
                          onClick={() => handleEditApique(apique.apique_id)}
                          color="primary"
                          aria-label="Editar apique"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar apique">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(apique.apique_id)}
                          color="error"
                          aria-label="Eliminar apique"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body1">
                      <strong>FECHA:</strong> {formatDate(apique.date)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>UBICACIÓN:</strong>{" "}
                      {apique.location || "No especificada"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>PROFUNDIDAD TOTAL:</strong>{" "}
                      {getMaxDepth(apique.layers)} m
                    </Typography>
                    <Typography variant="body1">
                      <strong>CAPAS:</strong> {getLayersCount(apique.layers)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>MUESTRAS:</strong>{" "}
                      {getSamplesCount(apique.layers)}
                    </Typography>
                    {apique.cbr_unaltered && (
                      <Typography variant="body1">
                        <strong>ESTADO:</strong> CBR Inalterado
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
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
                    {apique.cbr_unaltered && (
                      <Chip
                        label="CBR Inalterado"
                        size="small"
                        color="secondary"
                      />
                    )}
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid2>
          ))}
        </Grid2>
      )}

      {isMobile && (
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
            ¿Estás seguro de que deseas eliminar este apique? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button
            onClick={() =>
              deleteDialog.apiqueId && handleDeleteApique(deleteDialog.apiqueId)
            }
            color="error"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectApiques;
