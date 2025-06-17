import { Box, Typography, Container, Paper } from "@mui/material";
import { ReactNode } from "react";

interface CardLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Layout para elementos tipo tarjeta con título y descripción opcional
 * Útil para formularios, detalles, y otros componentes contenidos
 */
const CardLayout = ({ title, description, children }: CardLayoutProps) => {
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {children}
      </Paper>
    </Container>
  );
};

export default CardLayout;
