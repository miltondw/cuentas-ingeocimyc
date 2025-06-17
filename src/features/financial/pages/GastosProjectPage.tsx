import { Box, Typography, Paper } from "@mui/material";

/**
 * Página de gastos de proyectos
 * Esta es una página temporal que se actualizará con la migración completa
 */
const GastosProjectPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gastos por Proyecto
        </Typography>
        <Typography>
          Esta página contendrá la tabla de gastos por proyecto. Se migrará
          completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default GastosProjectPage;
