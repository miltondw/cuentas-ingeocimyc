import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MiscellaneousServices as ServicesIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAdminServices,
  useAdminCategories,
  useDeleteService,
} from "@/api/hooks/useAdminServices";
import type { Service } from "@/types/admin";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";

const ServicesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Hooks de datos
  const { data: servicesResponse, isLoading } = useAdminServices();
  const { data: categoriesResponse } = useAdminCategories();
  const deleteMutation = useDeleteService();

  const services = servicesResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Filtrar servicios por categoría
  const filteredServices =
    categoryFilter === "all"
      ? services
      : services.filter(
          (service) => service.categoryId.toString() === categoryFilter
        );

  const handleDeleteService = async () => {
    if (!deletingService) return;

    try {
      await deleteMutation.mutateAsync(deletingService.id);
      setDeletingService(null);
    } catch (_error) {
      // El error ya se maneja en el hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Sin categoría";
  };

  const getCategoryColor = (categoryId: number) => {
    const colors = [
      "primary",
      "secondary",
      "success",
      "warning",
      "info",
    ] as const;
    return colors[categoryId % colors.length];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate("/admin")} size="large">
            <ArrowBackIcon />
          </IconButton>
          <ServicesIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Servicios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Administra todos los servicios disponibles en el sistema
        </Typography>
      </Box>
      {/* Filters and Actions */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={`${filteredServices.length} servicios`}
            color="primary"
            variant="outlined"
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por categoría</InputLabel>
            <Select
              value={categoryFilter}
              label="Filtrar por categoría"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">Todas las categorías</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/services/new")}
        >
          Nuevo Servicio
        </Button>
      </Box>
      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Campos Adicionales</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Cargando servicios...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {categoryFilter === "all"
                        ? "No hay servicios registrados"
                        : "No hay servicios en esta categoría"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {service.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{service.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategoryName(service.categoryId)}
                          size="small"
                          color={getCategoryColor(service.categoryId)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${
                            service.additionalFields?.length || 0
                          } campos`}
                          size="small"
                          color={
                            service.additionalFields?.length
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>{formatDate(service.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/admin/services/${service.id}`)
                          }
                          title="Ver detalles"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/admin/services/${service.id}/edit`)
                          }
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeletingService(service)}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      {/* Quick Stats */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {services.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de servicios
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="secondary">
              {categories.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Categorías activas
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="success.main">
              {services.reduce(
                (acc, service) => acc + (service.additionalFields?.length || 0),
                0
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Campos adicionales
            </Typography>
          </CardContent>
        </Card>{" "}
      </Box>{" "}
      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDeleteDialog
        open={!!deletingService}
        title="Eliminar Servicio"
        content={`¿Estás seguro de que deseas eliminar el servicio "${deletingService?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteService}
        onClose={() => setDeletingService(null)}
      />
    </Container>
  );
};

export default ServicesManagementPage;
