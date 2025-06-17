import { Box, Typography, Paper } from "@mui/material";
import { useParams } from "react-router-dom";

/**
 * Página de detalle de apique
 * Esta es una página temporal que se actualizará con la migración completa
 */
const ApiqueDetallesPage = () => {
  const { apiqueId = "nuevo" } = useParams<{ apiqueId?: string }>();
  const isNew = apiqueId === "nuevo";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isNew ? "Nuevo Apique" : `Detalle de Apique #${apiqueId}`}
        </Typography>
        <Typography paragraph>
          Esta página contendrá{" "}
          {isNew
            ? "el formulario para crear un nuevo apique"
            : "los detalles del apique seleccionado"}
          . Se migrará completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ApiqueDetallesPage;
