import { Container, Alert, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/**
 * Página de error 404 - No encontrado
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
      <Box sx={{ mb: 4 }}>
        <ErrorOutlineIcon color="warning" sx={{ fontSize: 80 }} />
      </Box>

      <Alert severity="warning" sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Página no encontrada
        </Typography>
        <Typography variant="body1">
          La página que estás buscando no existe o ha sido movida.
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

export default NotFoundPage;
