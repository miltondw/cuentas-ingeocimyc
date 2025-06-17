import { Box, CircularProgress, Typography } from "@mui/material";

interface PageLoadingFallbackProps {
  message?: string;
  type?: "page" | "component";
  height?: string;
}

/**
 * Componente de carga que muestra un spinner y un mensaje opcional
 * Se puede usar para páginas completas o componentes individuales
 */
export const PageLoadingFallback = ({
  message = "Cargando...",
  type = "page",
  height = type === "page" ? "100vh" : "400px",
}: PageLoadingFallbackProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height,
        width: "100%",
        position: type === "page" ? "fixed" : "relative",
        top: 0,
        left: 0,
        backgroundColor:
          type === "page" ? "rgba(255, 255, 255, 0.9)" : "transparent",
        zIndex: type === "page" ? 1000 : 1,
      }}
    >
      <CircularProgress size={type === "page" ? 60 : 40} />
      <Typography
        variant={type === "page" ? "h6" : "body1"}
        sx={{ mt: 2, textAlign: "center" }}
      >
        {message}
      </Typography>
    </Box>
  );
};
