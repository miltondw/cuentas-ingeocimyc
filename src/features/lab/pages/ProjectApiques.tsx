import { Box, Typography, Paper } from "@mui/material";

/**
 * Página de apiques de un proyecto
 * Esta es una página temporal que se actualizará con la migración completa
 */
const ProjectApiques = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Apiques de Proyecto
        </Typography>
        <Typography>
          Esta página contendrá los apiques asociados a un proyecto. Se migrará
          completamente en una fase posterior.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProjectApiques;
