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
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LandscapeIcon from "@mui/icons-material/Landscape";
import HardnessIcon from "@mui/icons-material/Terrain";
import api from "@api";

interface BlowData {
  depth: string;
  n: number;
}

interface Profile {
  profile_id: string;
  sounding_number: string;
  location?: string;
  profile_date?: string;
  water_level?: string;
  samples_number?: number;
  blows_data?: BlowData[];
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

const ProjectProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    profileId: string | null;
  }>({ open: false, profileId: null });
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    const fetchProjectAndProfiles = async () => {
      try {
        setLoading(true);
        const projectResponse = await api.get(`/projects/${projectId}`);
        setProject(projectResponse.data.project);

        const profilesResponse = await api.get(
          `/projects/${projectId}/profiles`
        );
        setProfiles(profilesResponse.data.perfiles || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los perfiles. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndProfiles();
  }, [projectId]);

  const handleCreateProfile = () => {
    navigate(`/lab/proyectos/${projectId}/perfil/nuevo`);
  };

  const handleEditProfile = (profileId: string) => {
    navigate(`/lab/proyectos/${projectId}/perfil/${profileId}`);
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await api.delete(`/projects/${projectId}/profiles/${profileId}`);
      setProfiles(
        profiles.filter((profile) => profile.profile_id !== profileId)
      );
      setDeleteDialog({ open: false, profileId: null });
    } catch (err) {
      console.error("Error al eliminar perfil:", err);
      setError("No se pudo eliminar el perfil. Intenta de nuevo.");
    }
  };

  const openDeleteDialog = (profileId: string) => {
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

  const getCompletedDepthsCount = (blowsData?: BlowData[]): number => {
    if (!blowsData || !blowsData.length) return 0;
    return blowsData.filter((blow) => blow.n > 0).length;
  };

  const getMaxN = (blowsData?: BlowData[]): number => {
    if (!blowsData || !blowsData.length) return 0;
    return Math.max(...blowsData.map((blow) => blow.n || 0));
  };

  const getMaxDepth = (blowsData?: BlowData[]): string => {
    if (!blowsData || !blowsData.length) return "0.00";
    const depthsWithData = blowsData.filter((blow) => blow.n > 0);
    if (depthsWithData.length === 0) return "0.00";
    return Math.max(
      ...depthsWithData.map((blow) => parseFloat(blow.depth) || 0)
    ).toFixed(2);
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
          Perfiles de Suelo
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
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
            }}
            aria-label="Crear nuevo perfil"
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

      {profiles.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 2 }}>
          <LandscapeIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6">
            No hay perfiles de suelo registrados para este proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Haz clic en el botón + para crear un nuevo perfil
          </Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={3}>
          {profiles.map((profile) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={profile.profile_id}>
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
                      SONDEO #{profile.sounding_number.toUpperCase()}
                    </Typography>
                    <Box>
                      <Tooltip title="Editar perfil">
                        <IconButton
                          size="small"
                          onClick={() => handleEditProfile(profile.profile_id)}
                          color="primary"
                          aria-label="Editar perfil"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar perfil">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(profile.profile_id)}
                          color="error"
                          aria-label="Eliminar perfil"
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
                    {profile.location && (
                      <Typography variant="body1">
                        <strong>UBICACIÓN:</strong> {profile.location}
                      </Typography>
                    )}
                    <Typography variant="body1">
                      <strong>FECHA:</strong> {formatDate(profile.profile_date)}
                    </Typography>
                    {profile.water_level &&
                      profile.water_level !== "ninguno" && (
                        <Typography variant="body1">
                          <strong>NIVEL FREÁTICO:</strong> {profile.water_level}{" "}
                          m
                        </Typography>
                      )}
                    <Typography variant="body1">
                      <strong>MUESTRAS:</strong> {profile.samples_number || 0}
                    </Typography>
                    <Typography variant="body1">
                      <strong>PROFUNDIDADES CON DATOS:</strong>{" "}
                      {getCompletedDepthsCount(profile.blows_data)} /{" "}
                      {profile.blows_data?.length || 0}
                    </Typography>
                    <Typography variant="body1">
                      <strong>PROFUNDIDAD MÁXIMA:</strong>{" "}
                      {getMaxDepth(profile.blows_data)} m
                    </Typography>
                    <Typography variant="body1">
                      <strong>N MÁXIMO:</strong> {getMaxN(profile.blows_data)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>DUREZA DEL SUELO:</strong>{" "}
                      {getSoilHardnessText(getMaxN(profile.blows_data))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Chip
                      icon={<WaterDropIcon fontSize="small" />}
                      label={`${profile.samples_number || 0} muestras`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<LandscapeIcon fontSize="small" />}
                      label={`${getCompletedDepthsCount(
                        profile.blows_data
                      )} / ${profile.blows_data?.length || 0} profundidades`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Tooltip
                      title={getSoilHardnessText(getMaxN(profile.blows_data))}
                    >
                      <Chip
                        icon={
                          <HardnessIcon
                            sx={{
                              color: getSoilHardnessColor(
                                getMaxN(profile.blows_data)
                              ),
                            }}
                          />
                        }
                        label={getSoilHardnessText(getMaxN(profile.blows_data))}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid2>
          ))}
        </Grid2>
      )}

      {isMobile && (
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
          <Button
            onClick={() =>
              deleteDialog.profileId &&
              handleDeleteProfile(deleteDialog.profileId)
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

export default ProjectProfiles;
