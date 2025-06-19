// import { ClientServiceRequestForm } from "../components/ClientServiceRequestForm";
import { Container, Typography, Paper, Box } from "@mui/material";

/**
 * Página de formulario de solicitud para clientes
 * Usa el componente ClientServiceRequestForm migrado desde components/client
 */
const ClientRequestFormPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Formulario de Solicitud de Servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Esta sección está en desarrollo y estará disponible próximamente.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ClientRequestFormPage;
