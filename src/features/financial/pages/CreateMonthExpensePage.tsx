import { Box, Typography, Paper } from "@mui/material";
import { useParams } from "react-router-dom";

/**
 * Página para crear o editar gastos mensuales
 * Esta es una página temporal que se actualizará con la migración completa
 */
const CreateMonthExpensePage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing
            ? `Editar Gasto Mensual #${id}`
            : "Crear Nuevo Gasto Mensual"}
        </Typography>
        <Typography>
          Esta página contendrá el formulario para{" "}
          {isEditing ? "editar" : "registrar"} gastos mensuales. Se migrará
          completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CreateMonthExpensePage;
