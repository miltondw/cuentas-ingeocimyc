import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
} from "@mui/material";
import {
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
    defaultFilters: { category: "all" },
  });

  // Hooks de datos
  const { data: servicesResponse, isLoading } = useAdminServices();
  const { data: categoriesResponse } = useAdminCategories();
  const deleteMutation = useDeleteService();

  const services = servicesResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Filtrar servicios por categoría y búsqueda
  const filteredServices = services.filter((service) => {
    const matchesCategory =
      filters.category === "all" ||
      service.categoryId.toString() === filters.category;
    const matchesSearch =
      !searchValue ||
      service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      service.code.toLowerCase().includes(searchValue.toLowerCase());
    return matchesCategory && matchesSearch;
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
  // Configuración de columnas para DataTable
  const columns: ColumnConfig[] = [
    {
      key: "code",
      label: "Código",
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {String(value)}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Nombre",
      sortable: true,
    },
    {
      key: "categoryId",
      label: "Categoría",
      render: (value) => (
        <Chip
          label={getCategoryName(value as number)}
          size="small"
          color={getCategoryColor(value as number)}
          variant="outlined"
        />
      ),
    },
    {
      key: "additionalFields",
      label: "Campos Adicionales",
      render: (value) => {
        const fields = value as Service["additionalFields"];
        return (
          <Chip
            label={`${fields?.length || 0} campos`}
            size="small"
            color={fields?.length ? "success" : "default"}
          />
        );
      },
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      sortable: true,
      render: (value) => formatDate(value as string),
    },
  ]; // Configuración de acciones por fila
  const rowActions: RowAction[] = [
    {
      key: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      action: (service) =>
        navigate(`/admin/services/${(service as Service).id}`),
    },
    {
      key: "edit",
      label: "Editar",
      icon: <EditIcon />,
      action: (service) =>
        navigate(`/admin/services/${(service as Service).id}/edit`),
    },
    {
      key: "delete",
      label: "Eliminar",
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
        })),
      ],
    },
  ];

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
      </Box>{" "}
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <SearchAndFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar servicios por nombre o código..."
          filters={filterFields}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          showFilterCount
          collapsible={false}
        />
      </Box>
      {/* Data Table */}{" "}
      <DataTable
        data={paginatedData as Service[]}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        loading={isLoading}
        title="Lista de Servicios"
        emptyMessage={
          filters.category === "all"
            ? "No hay servicios registrados"
            : "No hay servicios en esta categoría"
        }
        onRowClick={(service) =>
          navigate(`/admin/services/${(service as Service).id}`)
        }
      />
      {/* Paginación */}
      {paginationData.totalItems > 0 && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setItemsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Servicios por página:"
          showFirstLastButtons={true}
          showRowsPerPage={true}
        />
      )}
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
              {filteredServices.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Servicios filtrados
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
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
        </Card>
      </Box>
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
