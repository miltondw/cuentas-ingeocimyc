import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
  Fade,
  Paper,
  Tooltip,
  Skeleton,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MiscellaneousServices as ServicesIcon,
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useAdminServices,
  useAdminCategories,
  useDeleteService,
} from "@/api/hooks/useAdminServices";
import type { Service } from "@/types/admin";
import {
  DataTable,
  ColumnConfig,
  RowAction,
} from "@/components/common/DataTable";
import {
  SearchAndFilter,
  FilterField,
} from "@/components/common/SearchAndFilter";
import DataTablePagination from "@/components/common/DataTablePagination";
import { usePagination } from "@/hooks/usePagination";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import type { FilterValue } from "@/types/labFilters";

const ServicesManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [searchValue, setSearchValue] = useState("");

  // Filtros con URL persistence
  const { filters, updateFilter } = useUrlFilters({
    defaultFilters: {
      category: "all",
      hasAdditionalFields: "all",
      createdDateRange: "all",
    },
  });

  // Hooks de datos
  const { data: servicesResponse, isLoading } = useAdminServices();
  const { data: categoriesResponse } = useAdminCategories();
  const deleteMutation = useDeleteService();

  const services = servicesResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Filtrar servicios por categoría y búsqueda
  const filteredServices = services.filter((service) => {
    // Filtro por categoría
    const matchesCategory =
      filters.category === "all" ||
      service.categoryId.toString() === filters.category;

    // Filtro por búsqueda
    const matchesSearch =
      !searchValue ||
      service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      service.code.toLowerCase().includes(searchValue.toLowerCase());

    // Filtro por campos adicionales
    const matchesAdditionalFields =
      filters.hasAdditionalFields === "all" ||
      (filters.hasAdditionalFields === "with" &&
        service.additionalFields &&
        service.additionalFields.length > 0) ||
      (filters.hasAdditionalFields === "without" &&
        (!service.additionalFields || service.additionalFields.length === 0));

    // Filtro por fecha de creación
    const matchesDateRange = (() => {
      if (filters.createdDateRange === "all") return true;

      const serviceDate = new Date(service.created_at);
      const now = new Date();

      switch (filters.createdDateRange) {
        case "today": {
          return serviceDate.toDateString() === now.toDateString();
        }
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return serviceDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return serviceDate >= monthAgo;
        }
        case "year": {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return serviceDate >= yearAgo;
        }
        default:
          return true;
      }
    })();

    return (
      matchesCategory &&
      matchesSearch &&
      matchesAdditionalFields &&
      matchesDateRange
    );
  });

  // Estado de paginación - usando hook personalizado
  const {
    paginatedData,
    paginationData,
    setPage,
    setItemsPerPage,
    goToFirstPage,
  } = usePagination({
    data: filteredServices,
    initialPage: 1,
    initialItemsPerPage: 10,
  });
  // Handlers para resetear página cuando cambien filtros
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    goToFirstPage();
  };

  const handleFilterChange = (key: string, value: unknown) => {
    updateFilter(key as keyof typeof filters, value as FilterValue);
    goToFirstPage();
  };

  const handleClearAllFilters = () => {
    setSearchValue("");
    updateFilter("category", "all");
    updateFilter("hasAdditionalFields", "all");
    updateFilter("createdDateRange", "all");
    goToFirstPage();
  };

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

  // Calcular filtros activos
  const activeFiltersCount = [
    filters.category !== "all",
    filters.hasAdditionalFields !== "all",
    filters.createdDateRange !== "all",
    !!searchValue,
  ].filter(Boolean).length;
  // Configuración de columnas para DataTable
  const columns: ColumnConfig[] = [
    {
      key: "code",
      label: "Código",
      sortable: true,
      render: (value) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={String(value)}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: "monospace",
              fontWeight: "bold",
              borderColor: "primary.main",
              color: "primary.main",
            }}
          />
        </Box>
      ),
    },
    {
      key: "name",
      label: "Nombre",
      sortable: true,
      render: (value) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" color="text.primary">
            {String(value)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "categoryId",
      label: "Categoría",
      render: (value) => (
        <Chip
          label={getCategoryName(value as number)}
          size="small"
          color={getCategoryColor(value as number)}
          variant="filled"
          sx={{
            fontWeight: 500,
            "& .MuiChip-label": {
              px: 1.5,
            },
          }}
        />
      ),
    },
    {
      key: "additionalFields",
      label: "Campos Adicionales",
      render: (value) => {
        const fields = value as Service["additionalFields"];
        const count = fields?.length || 0;
        return (
          <Tooltip
            title={
              count > 0
                ? `${count} campos configurados`
                : "Sin campos adicionales"
            }
          >
            <Chip
              label={`${count} campos`}
              size="small"
              color={count > 0 ? "success" : "default"}
              variant={count > 0 ? "filled" : "outlined"}
              icon={<BuildIcon sx={{ fontSize: 16 }} />}
              sx={{
                fontWeight: 500,
                "& .MuiChip-icon": {
                  fontSize: 16,
                },
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      sortable: true,
      render: (value) => (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {formatDate(value as string)}
          </Typography>
        </Box>
      ),
    },
  ]; // Configuración de acciones por fila
  const rowActions: RowAction[] = [
    {
      key: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      action: (service) =>
        navigate(`/admin/services/${(service as Service).id}`),
      color: "secondary",
    },
    {
      key: "edit",
      label: "Editar servicio",
      icon: <EditIcon />,
      action: (service) =>
        navigate(`/admin/services/${(service as Service).id}/edit`),
      color: "primary",
    },
    {
      key: "delete",
      label: "Eliminar servicio",
      icon: <DeleteIcon />,
      color: "error",
      action: (service) => setDeletingService(service as Service),
    },
  ];

  // Configuración de filtros
  const filterFields: FilterField[] = [
    {
      key: "category",
      label: "Categoría",
      type: "select",
      options: [
        { value: "all", label: "Todas las categorías" },
        ...categories.map((cat) => ({
          value: cat.id.toString(),
          label: cat.name,
          count: services.filter((s) => s.categoryId === cat.id).length,
        })),
      ],
    },
    {
      key: "hasAdditionalFields",
      label: "Campos Adicionales",
      type: "select",
      options: [
        { value: "all", label: "Todos" },
        { value: "with", label: "Con campos adicionales" },
        { value: "without", label: "Sin campos adicionales" },
      ],
    },
    {
      key: "createdDateRange",
      label: "Fecha de Creación",
      type: "select",
      options: [
        { value: "all", label: "Todas las fechas" },
        { value: "today", label: "Hoy" },
        { value: "week", label: "Última semana" },
        { value: "month", label: "Último mes" },
        { value: "year", label: "Último año" },
      ],
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Enhanced Header with gradient background */}
      <Paper
        elevation={0}
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderRadius: 3,
          p: 4,
          mb: 4,
          border: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Volver al panel de administración">
              <IconButton
                onClick={() => navigate("/admin")}
                size="large"
                sx={{
                  backgroundColor: "background.paper",
                  boxShadow: 1,
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    transform: "translateX(-2px)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <ServicesIcon sx={{ fontSize: 40, color: "primary.main" }} />
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  color="primary.main"
                >
                  Gestión de Servicios
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Administra todos los servicios disponibles en el sistema
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Add Service Button */}
          <Tooltip title="Crear nuevo servicio">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/admin/services/new")}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Nuevo Servicio
            </Button>
          </Tooltip>
        </Box>
      </Paper>
      {/* Enhanced Quick Stats */}
      <Fade in timeout={800}>
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
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                background: "rgba(255,255,255,0.1)",
                transform: "skewX(-15deg)",
                transformOrigin: "top right",
              },
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
                <AnalyticsIcon sx={{ fontSize: 32, opacity: 0.8 }} />
                <Typography variant="h4" fontWeight="bold">
                  {isLoading ? (
                    <Skeleton
                      width={60}
                      sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  ) : (
                    services.length
                  )}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
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
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                background: "rgba(255,255,255,0.1)",
                transform: "skewX(-15deg)",
                transformOrigin: "top right",
              },
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
                <Typography variant="h4" fontWeight="bold">
                  {isLoading ? (
                    <Skeleton
                      width={60}
                      sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  ) : (
                    filteredServices.length
                  )}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
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
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                background: "rgba(255,255,255,0.1)",
                transform: "skewX(-15deg)",
                transformOrigin: "top right",
              },
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
                <Typography variant="h4" fontWeight="bold">
                  {isLoading ? (
                    <Skeleton
                      width={60}
                      sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  ) : (
                    categories.length
                  )}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
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
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                background: "rgba(255,255,255,0.1)",
                transform: "skewX(-15deg)",
                transformOrigin: "top right",
              },
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
                <Typography variant="h4" fontWeight="bold">
                  {isLoading ? (
                    <Skeleton
                      width={60}
                      sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  ) : (
                    services.reduce(
                      (acc, service) =>
                        acc + (service.additionalFields?.length || 0),
                      0
                    )
                  )}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Campos adicionales
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Fade>
      {/* Enhanced Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CategoryIcon sx={{ color: "primary.main", fontSize: 24 }} />
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{
              background: (theme) =>
                `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Filtros de Búsqueda
          </Typography>

          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} filtro${
                activeFiltersCount > 1 ? "s" : ""
              } activo${activeFiltersCount > 1 ? "s" : ""}`}
              size="small"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          )}

          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}
          >
            {(searchValue ||
              filters.category !== "all" ||
              filters.hasAdditionalFields !== "all" ||
              filters.createdDateRange !== "all") && (
              <>
                <Chip
                  label={`${filteredServices.length} resultado${
                    filteredServices.length !== 1 ? "s" : ""
                  }`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Tooltip title="Limpiar todos los filtros">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearAllFilters}
                    sx={{
                      minWidth: "auto",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "error.main",
                        color: "error.contrastText",
                        borderColor: "error.main",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    Limpiar
                  </Button>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <SearchAndFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar servicios por nombre o código..."
          filters={filterFields}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          showFilterCount
          collapsible={true}
          initialExpanded={true}
          size="small"
          variant="outlined"
        />

        {/* Mensaje de ayuda cuando no hay filtros activos */}
        {activeFiltersCount === 0 && !searchValue && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: (theme) => alpha(theme.palette.info.main, 0.05),
              border: (theme) =>
                `1px dashed ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              color="info.main"
              sx={{ fontStyle: "italic" }}
            >
              💡 Utiliza los filtros para encontrar servicios específicos por
              categoría, campos adicionales o fecha de creación
            </Typography>
          </Box>
        )}
      </Box>

      {/* Enhanced Data Table */}
      <Fade in timeout={600}>
        <Paper
          elevation={activeFiltersCount > 0 ? 3 : 1}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: (theme) =>
              `1px solid ${alpha(
                activeFiltersCount > 0
                  ? theme.palette.primary.main
                  : theme.palette.divider,
                activeFiltersCount > 0 ? 0.3 : 0.1
              )}`,
            transition: "all 0.3s ease-in-out",
            transform: activeFiltersCount > 0 ? "scale(1.002)" : "scale(1)",
          }}
        >
          <DataTable
            data={paginatedData as Service[]}
            columns={columns}
            keyField="id"
            rowActions={rowActions}
            loading={isLoading}
            title="Lista de Servicios"
            emptyMessage={
              searchValue ||
              filters.category !== "all" ||
              filters.hasAdditionalFields !== "all" ||
              filters.createdDateRange !== "all"
                ? `No se encontraron servicios que coincidan con los filtros aplicados. ${
                    activeFiltersCount > 0
                      ? `Intenta ajustar o eliminar algunos de los ${activeFiltersCount} filtros activos.`
                      : "Intenta con otros criterios de búsqueda."
                  }`
                : "No hay servicios registrados en el sistema. ¡Crea el primer servicio para comenzar!"
            }
            onRowClick={(service) =>
              navigate(`/admin/services/${(service as Service).id}`)
            }
          />
        </Paper>
      </Fade>
      {/* Enhanced Pagination */}
      {paginationData.totalItems > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.paper, 0.7),
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <DataTablePagination
            paginationData={paginationData}
            onPageChange={setPage}
            onRowsPerPageChange={setItemsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Servicios por página:"
            showFirstLastButtons={true}
            showRowsPerPage={true}
          />
        </Paper>
      )}
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
