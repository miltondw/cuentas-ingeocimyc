import { Box, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import FormCreateMonth from "../components/CreateMonth";

/**
 * Página para crear o editar gastos mensuales
 * Esta es una página temporal que se actualizará con la migración completa
 */
const CreateMonthExpensePage = () => {
  const { id } = useParams<{ id?: string }>();

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <FormCreateMonth id={id} />
      </Paper>
    </Box>
  );
};

export default CreateMonthExpensePage;
