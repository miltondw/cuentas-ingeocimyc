import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const ClientHomePage: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <Paper sx={{ p: 4, minWidth: 400 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Inicio del Cliente
      </Typography>
      <Typography variant="body1">
        Bienvenido al panel principal de cliente. Aquí podrás ver tus
        solicitudes, servicios y otra información relevante.
      </Typography>
    </Paper>
  </Box>
);

export default ClientHomePage;
