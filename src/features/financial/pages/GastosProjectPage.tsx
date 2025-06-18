import { Box, Paper } from "@mui/material";
import TablaGastosProject from "@/features/projects/components/TablaGastosProject";

/**
 * Página de gastos de proyectos
 * Esta es una página temporal que se actualizará con la migración completa
 */
const GastosProjectPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <TablaGastosProject />
      </Paper>
    </Box>
  );
};

export default GastosProjectPage;
