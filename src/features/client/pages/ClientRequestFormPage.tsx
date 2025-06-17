import { Box, Typography, Paper } from "@mui/material";

/**
 * Página de formulario de solicitud para clientes
 * Esta es una página temporal que se actualizará con la migración completa
 */
const ClientRequestFormPage = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Formulario de Solicitud
        </Typography>
        <Typography>
          Esta página contendrá el formulario de solicitud para clientes. Se
          migrará completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ClientRequestFormPage;
