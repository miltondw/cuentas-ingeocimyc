import { Box } from "@mui/material";
import TablaGastosEmpresa from "../components/gasto-mes";

/**
 * Página de gastos mensuales
 * Esta es una página temporal que se actualizará con la migración completa
 */
const GastosMensualesPage = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <TablaGastosEmpresa />
    </Box>
  );
};

export default GastosMensualesPage;
