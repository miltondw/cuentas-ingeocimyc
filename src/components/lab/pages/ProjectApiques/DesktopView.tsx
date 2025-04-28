// components/ProjectApiques/DesktopView.tsx
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid2,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  Terrain,
  Layers,
} from "@mui/icons-material";
import { Apique, Layer, Project } from "../types/apiqueTypes";

interface DesktopViewProps {
  project: Project | null;
  apiques: Apique[];
  navigate: (path: number | string) => void;
  handleCreateApique: () => void;
  handleEditApique: (id: string) => void;
  handleDeleteApique: (id: string) => void;
  formatDate: (date: string | undefined) => string;
  getLayersCount: (layers: Layer[] | undefined) => number;
  getSamplesCount: (layers: Layer[] | undefined) => number;
  getMaxDepth: (layers: Layer[] | undefined) => string;
}

const DesktopView: React.FC<DesktopViewProps> = ({
  project,
  apiques,
  navigate,
  handleCreateApique,
  handleEditApique,
  handleDeleteApique,
  formatDate,
  getLayersCount,
  getMaxDepth,
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Apiques de Suelo</Typography>
        <Box sx={{ flexGrow: 1 }} />
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
        >
          <Add />
        </IconButton>
      </Box>

      {project && (
        <Paper sx={{ p: 3, mb: 4, backgroundColor: "#f5f9ff" }}>
          <Typography variant="h5" gutterBottom>
            {project.nombre}
          </Typography>
          <Typography variant="body1">
            Ubicación: {project.ubicacion || "No especificada"}
          </Typography>
          {project.descripcion && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {project.descripcion}
            </Typography>
          )}
        </Paper>
      )}

      {apiques.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Terrain sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6">
            No hay apiques registrados para este proyecto.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Haz clic en el botón + para crear un nuevo apique.
          </Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={3}>
          {apiques.map((apique) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={apique.apique_id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="div">
                      Apique #{apique.apique}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditApique(apique.apique_id)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteApique(apique.apique_id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2">
                      <strong>Fecha:</strong> {formatDate(apique.date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ubicación:</strong>{" "}
                      {apique.location || "No especificada"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Profundidad total:</strong>{" "}
                      {getMaxDepth(apique.layers)} m
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Chip
                        icon={<Layers fontSize="small" />}
                        label={`${getLayersCount(apique.layers)} capas`}
                        size="small"
                      />

                      {apique.cbr_unaltered && (
                        <Chip
                          label="CBR Inalterado"
                          color="secondary"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      )}
    </Container>
  );
};

export default DesktopView;
