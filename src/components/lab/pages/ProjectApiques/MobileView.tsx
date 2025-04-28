// components/ProjectApiques/MobileView.tsx
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Divider,
  Fab,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  Terrain,
  Layers,
  Science,
} from "@mui/icons-material";
import { Apique, Layer, Project } from "../types/apiqueTypes";

interface MobileViewProps {
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

const MobileView: React.FC<MobileViewProps> = ({
  project,
  apiques,
  navigate,
  handleCreateApique,
  handleEditApique,
  handleDeleteApique,
  formatDate,
  getLayersCount,
  getSamplesCount,
  getMaxDepth,
}) => {
  return (
    <Container sx={{ py: 2, px: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Apiques de Suelo
        </Typography>
      </Box>

      {project && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: "#f5f9ff" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Proyecto: {project.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project.ubicacion || "Sin ubicación"}
          </Typography>
        </Paper>
      )}

      {apiques.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center", mb: 2 }}>
          <Terrain sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
          <Typography>
            No hay apiques registrados para este proyecto.
          </Typography>
        </Paper>
      ) : (
        apiques.map((apique) => (
          <Card key={apique.apique_id} sx={{ mb: 2 }}>
            <CardContent sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    Apique #{apique.apique}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {formatDate(apique.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ubicación: {apique.location || "No especificada"}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      size="small"
                      icon={<Layers fontSize="small" />}
                      label={`${getLayersCount(apique.layers)} capas`}
                    />
                    <Chip
                      size="small"
                      icon={<Science fontSize="small" />}
                      label={`${getSamplesCount(apique.layers)} muestras`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>

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

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">
                  Profundidad total: {getMaxDepth(apique.layers)} m
                </Typography>
                {apique.cbr_unaltered && (
                  <Chip size="small" label="CBR Inalterado" color="secondary" />
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Fab
        color="primary"
        aria-label="añadir"
        onClick={handleCreateApique}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default MobileView;
