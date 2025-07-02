import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  RequestQuote as RequestIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme, alpha } from "@mui/material/styles";

interface ServiceRequestsHeaderProps {
  title?: string;
  subtitle?: string;
}

const ServiceRequestsHeader: React.FC<ServiceRequestsHeaderProps> = ({
  title = "Gestión de Solicitudes",
  subtitle = "Administra y da seguimiento a todas las solicitudes de servicio",
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 2, sm: 2, md: 3 },
          mb: { xs: 2, sm: 3 },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: { xs: 2, md: 3 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          border: { xs: "1px solid", sm: "none" },
          borderColor: {
            xs: alpha(theme.palette.primary.main, 0.1),
            sm: "transparent",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "flex-start", sm: "flex-start" },
          }}
        >
          <IconButton
            onClick={() => navigate("/admin")}
            size="large"
            sx={{
              bgcolor: "white",
              boxShadow: { xs: 2, sm: 1 },
              flexShrink: 0,
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              "&:hover": {
                bgcolor: "grey.50",
                transform: "translateY(-1px)",
                boxShadow: { xs: 3, sm: 2 },
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <ArrowBackIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
          </IconButton>
          <RequestIcon
            sx={{
              fontSize: { xs: 30, sm: 36, md: 40 },
              color: theme.palette.primary.main,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              ml: { xs: 0.5, sm: 0 },
            }}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, mt: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: { xs: 600, sm: 700 },
              color: theme.palette.text.primary,
              letterSpacing: "-0.02em",
              lineHeight: { xs: 1.3, sm: 1.1 },
              wordBreak: "break-word",
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: { xs: 0.5, sm: 0.5 },
              display: { xs: "block", sm: "block" },
              lineHeight: 1.4,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              maxWidth: { xs: "100%", sm: "400px", md: "none" },
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceRequestsHeader;
