import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from "@mui/material";
import {
  Category as CategoryIcon,
  MiscellaneousServices as ServicesIcon,
  Dashboard as DashboardIcon,
  RequestQuote as RequestIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
import {
  useAdminCategories,
  useAdminServices,
} from "@/api/hooks/useAdminServices";
import { useAdminServiceRequestStats } from "@/api/hooks/useAdminServiceRequests";

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories } = useAdminCategories();
  const { data: services } = useAdminServices();
  const { data: serviceRequestStats } = useAdminServiceRequestStats();

  // Ajustar acceso a la data: ahora categories y services son arrays planos
  const categoriesCount = Array.isArray(categories) ? categories.length : 0;
  const servicesCount = Array.isArray(services) ? services.length : 0;

  const statsCards = [
    {
      title: "Categorías de Servicios",
      count: categoriesCount,
      icon: <CategoryIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      description: "Gestiona las categorías de servicios",
      action: () => navigate(ROUTES.ADMIN.CATEGORIES),
      color: "primary.light",
    },
    {
      title: "Servicios",
      count: servicesCount,
      icon: <ServicesIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      description: "Administra todos los servicios disponibles",
      action: () => navigate(ROUTES.ADMIN.SERVICES),
      color: "secondary.light",
    },
    {
      title: "Solicitudes de Servicio",
      count: serviceRequestStats?.total || 0,
      icon: <RequestIcon sx={{ fontSize: 40, color: "info.main" }} />,
      description: "Gestiona las solicitudes de los clientes",
      action: () => navigate(ROUTES.ADMIN.SERVICE_REQUESTS),
      color: "info.light",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <DashboardIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Panel de Administración
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gestiona servicios, categorías y configuraciones del sistema
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {card.count}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={card.action}
                  sx={{ textTransform: "none" }}
                >
                  Gestionar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Acciones Rápidas
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={() => navigate("/admin/categories/new")}
            >
              Nueva Categoría
            </Button>
            <Button
              variant="outlined"
              startIcon={<ServicesIcon />}
              onClick={() => navigate(ROUTES.ADMIN.SERVICE_NEW)}
            >
              Nuevo Servicio
            </Button>
            <Button
              variant="outlined"
              startIcon={<RequestIcon />}
              onClick={() => navigate(ROUTES.ADMIN.SERVICE_REQUESTS)}
            >
              Ver Solicitudes
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Resumen del Sistema
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            <Chip
              label={`${categoriesCount} Categorías activas`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${servicesCount} Servicios disponibles`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={`${
                serviceRequestStats?.total || 0
              } Solicitudes registradas`}
              color="info"
              variant="outlined"
            />
            <Chip
              label="Sistema funcionando"
              color="success"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminDashboardPage;
