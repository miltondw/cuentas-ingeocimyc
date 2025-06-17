import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Container,
} from "@mui/material";

interface PageLoadingFallbackProps {
  message?: string;
  type?: "page" | "component" | "minimal";
  height?: string | number;
}

export const PageLoadingFallback: React.FC<PageLoadingFallbackProps> = ({
  message = "Cargando...",
  type = "page",
  height = "50vh",
}) => {
  if (type === "minimal") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (type === "component") {
    return (
      <Box p={2}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" />
      </Box>
    );
  }

  // type === 'page'
  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height={height}
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>

        {/* Skeleton para contenido de página */}
        <Box width="100%" maxWidth={600} mt={4}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" />
        </Box>
      </Box>
    </Container>
  );
};

export default PageLoadingFallback;
