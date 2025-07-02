import React from "react";
import { Card, CardContent, Typography, Box, Grid2 } from "@mui/material";
import {
  Assessment,
  Schedule,
  TrendingUp,
  CheckCircle,
} from "@mui/icons-material";

import { alpha, useTheme } from "@mui/material/styles";

interface ServiceRequestsStatsProps {
  stats: Record<string, number>;
  total: number;
}

const ServiceRequestsStats: React.FC<ServiceRequestsStatsProps> = ({
  stats,
  total,
}) => {
  const theme = useTheme();
  return (
    <Grid2 container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 2, sm: 3 },
            background: `linear-gradient(135deg, ${
              theme.palette.primary.main
            }, ${alpha(theme.palette.primary.main, 0.8)})`,
            color: "white",
            boxShadow: "0 8px 32px rgba(10, 149, 165, 0.3)",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(10, 149, 165, 0.4)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}>
            <Assessment
              sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                lineHeight: 1,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              {total}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Total Solicitudes
            </Typography>
          </CardContent>
          <Box
            sx={{
              position: "absolute",
              top: { xs: -15, sm: -20 },
              right: { xs: -15, sm: -20 },
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
            }}
          />
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            background: "linear-gradient(135deg, #ff9800, #f57c00)",
            color: "white",
            boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(255, 152, 0, 0.4)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}>
            <Schedule
              sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                lineHeight: 1,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              {stats["pendiente"] || 0}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Pendientes
            </Typography>
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            background: "linear-gradient(135deg, #2196f3, #1976d2)",
            color: "white",
            boxShadow: "0 8px 32px rgba(33, 150, 243, 0.3)",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(33, 150, 243, 0.4)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}>
            <TrendingUp
              sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                lineHeight: 1,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              {stats["en proceso"] || 0}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              En Proceso
            </Typography>
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            background: "linear-gradient(135deg, #4caf50, #388e3c)",
            color: "white",
            boxShadow: "0 8px 32px rgba(76, 175, 80, 0.3)",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(76, 175, 80, 0.4)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}>
            <CheckCircle
              sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                lineHeight: 1,
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              {stats["completado"] || 0}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.9, fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Completadas
            </Typography>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default ServiceRequestsStats;
