import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import { FC } from "react";

interface Props {
  isLoading: boolean;
  total: number;
  filtered: number;
  categories: number;
  additionalFields: number;
}

const ServicesStats: FC<Props> = ({
  isLoading,
  total,
  filtered,
  categories,
  additionalFields,
}) => (
  <Box
    sx={{
      mb: 4,
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "1fr 1fr",
        lg: "repeat(4, 1fr)",
      },
      gap: 2,
    }}
  >
    <Card
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <AnalyticsIcon sx={{ fontSize: 32, opacity: 0.8, color: "white" }} />
          <Typography variant="h4" fontWeight="bold" color="white">
            {isLoading ? (
              <Skeleton width={60} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
            ) : (
              total
            )}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }} color="white">
          Total de servicios
        </Typography>
      </CardContent>
    </Card>
    <Card
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 32, opacity: 0.8 }} />
          <Typography variant="h4" fontWeight="bold" color="white">
            {isLoading ? (
              <Skeleton width={60} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
            ) : (
              filtered
            )}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }} color="white">
          Servicios filtrados
        </Typography>
      </CardContent>
    </Card>
    <Card
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <CategoryIcon sx={{ fontSize: 32, opacity: 0.8 }} />
          <Typography variant="h4" fontWeight="bold" color="white">
            {isLoading ? (
              <Skeleton width={60} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
            ) : (
              categories
            )}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }} color="white">
          Categorías activas
        </Typography>
      </CardContent>
    </Card>
    <Card
      sx={{
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <BuildIcon sx={{ fontSize: 32, opacity: 0.8 }} />
          <Typography variant="h4" fontWeight="bold" color="white">
            {isLoading ? (
              <Skeleton width={60} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
            ) : (
              additionalFields
            )}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }} color="white">
          Campos adicionales
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export default ServicesStats;
