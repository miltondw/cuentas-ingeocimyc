import React from "react";
import {
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
  Slide,
  Collapse,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  AccessTime as LaterIcon,
  Star as StarIcon,
  CloudOff as OfflineIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";

interface PWAInstallBannerProps {
  show: boolean;
  isInstalling: boolean;
  onInstall: () => void;
  onDismiss: (permanent?: boolean) => void;
  onRemindLater: () => void;
  variant?: "minimal" | "detailed" | "card";
  position?: "top" | "bottom";
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  show,
  isInstalling,
  onInstall,
  onDismiss,
  onRemindLater,
  variant = "detailed",
  position = "top",
}) => {
  if (!show) return null;

  const features = [
    { icon: <SpeedIcon fontSize="small" />, text: "Acceso más rápido" },
    { icon: <OfflineIcon fontSize="small" />, text: "Funciona sin internet" },
    { icon: <StarIcon fontSize="small" />, text: "Experiencia nativa" },
  ];

  const MinimalBanner = () => (
    <Alert
      severity="info"
      action={
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            color="inherit"
            size="small"
            onClick={onInstall}
            disabled={isInstalling}
            startIcon={<InstallIcon />}
          >
            {isInstalling ? "Instalando..." : "Instalar"}
          </Button>
          <IconButton size="small" onClick={() => onDismiss()} color="inherit">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      }
      sx={{
        mb: 2,
        "& .MuiAlert-message": { display: "flex", alignItems: "center" },
      }}
    >
      ¿Te gustaría instalar la app para un acceso más rápido?
    </Alert>
  );

  const DetailedBanner = () => (
    <Alert
      severity="info"
      sx={{
        mb: 2,
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        border: "1px solid rgba(33, 150, 243, 0.2)",
        borderRadius: 2,
      }}
      action={
        <IconButton size="small" onClick={() => onDismiss()} color="inherit">
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          📱 ¡Mejora tu experiencia!
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Instala nuestra app para acceso rápido y funciones offline
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1 }}>
          {features.map((feature, index) => (
            <Chip
              key={index}
              icon={feature.icon}
              label={feature.text}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.7rem",
                height: 24,
                backgroundColor: "rgba(33, 150, 243, 0.05)",
                borderColor: "rgba(33, 150, 243, 0.3)",
              }}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={onInstall}
            disabled={isInstalling}
            startIcon={<InstallIcon />}
            sx={{
              background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              },
            }}
          >
            {isInstalling ? "Instalando..." : "Instalar ahora"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onRemindLater}
            startIcon={<LaterIcon />}
            sx={{
              textTransform: "none",
              borderColor: "rgba(33, 150, 243, 0.5)",
              color: "#1976d2",
            }}
          >
            Más tarde
          </Button>
        </Stack>
      </Box>
    </Alert>
  );

  const CardBanner = () => (
    <Card
      elevation={6}
      sx={{
        mb: 2,
        borderRadius: 3,
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        border: "1px solid rgba(33, 150, 243, 0.2)",
        position: "relative",
        overflow: "visible",
      }}
    >
      <IconButton
        size="small"
        onClick={() => onDismiss()}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            <InstallIcon sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2" }}>
              🚀 Instala la App
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Para una experiencia más rápida y cómoda
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1} sx={{ mb: 3 }}>
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box sx={{ color: "#1976d2" }}>{feature.icon}</Box>
              <Typography variant="body2" color="text.secondary">
                {feature.text}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            fullWidth
            onClick={onInstall}
            disabled={isInstalling}
            startIcon={<InstallIcon />}
            sx={{
              background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              py: 1.2,
              "&:hover": {
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {isInstalling ? "Instalando..." : "Instalar Ahora"}
          </Button>
          <Button
            variant="outlined"
            onClick={onRemindLater}
            startIcon={<LaterIcon />}
            sx={{
              textTransform: "none",
              borderColor: "rgba(33, 150, 243, 0.5)",
              color: "#1976d2",
              borderRadius: 2,
              py: 1.2,
              minWidth: "auto",
              px: 2,
            }}
          >
            Después
          </Button>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 2,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => onDismiss(true)}
        >
          No mostrar más
        </Typography>
      </CardContent>
    </Card>
  );

  const renderBanner = () => {
    switch (variant) {
      case "minimal":
        return <MinimalBanner />;
      case "card":
        return <CardBanner />;
      default:
        return <DetailedBanner />;
    }
  };

  if (position === "bottom") {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          p: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <Slide direction="up" in={show} mountOnEnter unmountOnExit>
          <Box sx={{ maxWidth: "sm", mx: "auto" }}>{renderBanner()}</Box>
        </Slide>
      </Box>
    );
  }

  return (
    <Collapse in={show} timeout={300}>
      <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: "md", mx: "auto" }}>
        {renderBanner()}
      </Box>
    </Collapse>
  );
};
