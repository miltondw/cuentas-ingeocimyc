import { Container, Alert, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BlockIcon from "@mui/icons-material/Block";

/**
 * Página de error de acceso no autorizado
 * Se muestra cuando un usuario intenta acceder a una ruta para la que no tiene permisos
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Box sx={{ mb: 4 }}>
        <BlockIcon color="error" sx={{ fontSize: 80 }} />
      </Box>

      <Alert severity="error" sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Acceso denegado
        </Typography>
        <Typography variant="body1">
          No tienes permiso para acceder a esta sección. Si crees que esto es un
          error, contacta a un administrador.
        </Typography>
      </Alert>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Volver
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/", { replace: true })}
        >
          Ir al inicio
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
