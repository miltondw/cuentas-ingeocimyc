import { Box, Typography, Paper } from "@mui/material";
import { useParams } from "react-router-dom";

/**
 * Página de detalle de perfil
 * Esta es una página temporal que se actualizará con la migración completa
 */
const PerfilDetallesPage = () => {
  const { profileId = "nuevo" } = useParams<{ profileId?: string }>();
  const isNew = profileId === "nuevo";

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isNew ? "Nuevo Perfil" : `Detalle de Perfil #${profileId}`}
        </Typography>
        <Typography>
          Esta página contendrá{" "}
          {isNew
            ? "el formulario para crear un nuevo perfil"
            : "los detalles del perfil seleccionado"}
          . Se migrará completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PerfilDetallesPage;
