import { Box, Typography, Paper } from "@mui/material";

/**
 * Página de gastos mensuales
 * Esta es una página temporal que se actualizará con la migración completa
 */
const GastosMensualesPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gastos Mensuales
        </Typography>
        <Typography>
          Esta página contendrá la tabla de gastos mensuales de la empresa. Se
          migrará completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default GastosMensualesPage;
