import { Box, Typography, Paper } from "@mui/material";

/**
 * Página de dashboard de proyectos de laboratorio
 * Esta es una página temporal que se actualizará con la migración completa
 */
const ProjectsDashboard = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Proyectos de Laboratorio
        </Typography>
        <Typography>
          Esta página contendrá el listado de proyectos de laboratorio. Se
          migrará completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProjectsDashboard;
