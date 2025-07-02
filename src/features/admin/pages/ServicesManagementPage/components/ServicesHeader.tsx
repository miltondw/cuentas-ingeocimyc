import {
  Box,
  Paper,
  Tooltip,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  MiscellaneousServices as ServicesIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { FC } from "react";
interface Props {
  onCreate: () => void;
}

const ServicesHeader: FC<Props> = ({ onCreate }) => {
  const navigate = useNavigate();
  return (
    <Paper
      elevation={0}
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`,
        borderRadius: 3,
        p: 4,
        mb: 4,
        border: (theme) => `1px solid ${theme.palette.primary.main}15`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Volver al panel de administración">
            <IconButton onClick={() => navigate("/admin")} size="large">
              <ServicesIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              color="primary.main"
            >
              Gestión de Servicios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra todos los servicios disponibles en el sistema
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Crear nuevo servicio">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreate}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Nuevo Servicio
          </Button>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ServicesHeader;
