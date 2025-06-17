import { Box, Typography, Paper } from "@mui/material";
import { useParams } from "react-router-dom";

/**
 * Página para crear o editar proyectos
 * Esta es una página temporal que se actualizará con la migración completa
 */
const CreateProjectPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? `Editar Proyecto #${id}` : "Crear Nuevo Proyecto"}
        </Typography>
        <Typography>
          Esta página contendrá el formulario para{" "}
          {isEditing ? "editar" : "crear"} un proyecto. Se migrará completamente
          en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateProjectPage;
