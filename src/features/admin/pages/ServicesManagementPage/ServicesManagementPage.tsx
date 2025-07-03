import { FC, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAdminServices,
  useAdminCategories,
  useDeleteService,
} from "@/api/hooks/useAdminServices";
import type { Service } from "./types/types";
import { useServiceFilters } from "./hooks/useServiceFilters";
import DataTablePagination from "@/components/common/DataTablePagination";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";

import { Container, Paper, Fade } from "@mui/material";
import {
  ServicesFilters,
  ServicesHeader,
  ServicesStats,
  ServicesTable,
} from "./components/index";
// Columnas y acciones y filtros importados

import { getColumns } from "./components/Columns";
import { getRowActions } from "./components/RowActions";

const ServicesManagementPage: FC = () => {
  const navigate = useNavigate();
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Data hooks
  const { data: servicesResponse, isLoading } = useAdminServices();
  const { data: categoriesResponse } = useAdminCategories();
  const deleteMutation = useDeleteService();

  const services = useMemo(
    () =>
      Array.isArray(servicesResponse)
        ? servicesResponse
        : Array.isArray(servicesResponse?.data)
        ? servicesResponse.data
        : [],
    [servicesResponse]
  );
  const categories = useMemo(
    () =>
      Array.isArray(categoriesResponse)
        ? categoriesResponse
        : Array.isArray(categoriesResponse?.data)
        ? categoriesResponse.data
        : [],
    [categoriesResponse]
  );

  // Filtros y paginación
  const {
    searchValue,
    setSearchValue,
    filters,
    updateFilter,
    filteredServices,
    paginatedData,
    paginationData,
    setPage,
    setItemsPerPage,
    goToFirstPage,
  } = useServiceFilters(services);

  const columns = useMemo(() => getColumns(categories), [categories]);
  const rowActions = useMemo(
    () => getRowActions(navigate, setDeletingService),
    [navigate, setDeletingService]
  );

  // Stats
  const total = services.length;
  const filtered = filteredServices.length;
  const categoriesCount = categories.length;
  const additionalFields = services.reduce(
    (acc: number, s: Service) => acc + (s.additionalFields?.length || 0),
    0
  );

  // Handlers
  const handleDeleteService = async () => {
    if (!deletingService) return;
    try {
      await deleteMutation.mutateAsync(deletingService.id);
      setDeletingService(null);
    } catch (_error) {
      console.error("Error deleting service:", _error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <ServicesHeader onCreate={() => navigate("/admin/services/new")} />

      <ServicesStats
        isLoading={isLoading}
        total={total}
        filtered={filtered}
        categories={categoriesCount}
        additionalFields={additionalFields}
      />
      <ServicesFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={filters}
        onFilterChange={updateFilter}
        activeFiltersCount={
          [
            filters.category !== "all",
            filters.hasAdditionalFields !== "all",
            filters.createdDateRange !== "all",
            !!searchValue,
          ].filter(Boolean).length
        }
        onClearAll={() => {
          setSearchValue("");
          updateFilter("category", "all");
          updateFilter("hasAdditionalFields", "all");
          updateFilter("createdDateRange", "all");
          goToFirstPage();
        }}
        filteredCount={filtered}
      />
      <Fade in timeout={600}>
        <Paper
          elevation={filtered > 0 ? 3 : 1}
          sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}
        >
          <ServicesTable
            data={paginatedData as Service[]}
            columns={columns}
            rowActions={rowActions}
            loading={isLoading}
            onRowClick={(row) => navigate(`/admin/services/${row.id}`)}
          />
        </Paper>
      </Fade>
      {paginationData.totalItems > 0 && (
        <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2 }}>
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
