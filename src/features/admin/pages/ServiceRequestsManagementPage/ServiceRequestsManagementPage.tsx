import React, { useMemo, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { authService } from "@/features/auth/services/authService";
import type { RegisterDto } from "@/types/auth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
import { Container } from "@mui/material";
import {
  ServiceRequestsHeader,
  ServiceRequestsStats,
  ServiceRequestsFilters,
  ServiceRequestsTable,
  ServiceRequestDetailsModal,
  ServiceRequestStatusEditModal,
  BulkDeleteConfirmModal,
} from "./components";
import {
  getServiceRequestColumns,
  ServiceRequestTableHandlers,
  GetStatusInfo,
} from "./columns";
import {
  useAdminServiceRequests,
  useDeleteServiceRequest,
  useGeneratePDF,
  useRegeneratePDF,
  useAdminServiceRequestStats,
} from "@/api/hooks/useAdminServiceRequests";
import {
  useAdminCategories,
  useUpdateServiceRequestStatus,
} from "@/api/hooks/useAdminServices";
import type {
  AdminServiceRequestFilters,
  ServiceRequestStatus,
  AdminServiceRequest,
} from "./types";
import { useDebounce } from "@/hooks/useDebounce";

const SERVICE_REQUEST_STATUSES: Array<{
  value: ServiceRequestStatus;
  label: string;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}> = [
  { value: "pendiente", label: "Pendiente", color: "warning" },
  { value: "en proceso", label: "En Proceso", color: "info" },
  { value: "completado", label: "Completado", color: "success" },
  { value: "cancelado", label: "Cancelado", color: "error" },
];

const ServiceRequestsManagementPage: React.FC = () => {
  // Filtros y búsqueda
  const [filters, setFilters] = useState<AdminServiceRequestFilters>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "DESC",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showFilters, setShowFilters] = useState(false);

  // Modales y selección
  const [selectedRequest, setSelectedRequest] =
    useState<AdminServiceRequest | null>(null);
  const navigate = useNavigate();
  const [editStatusRequest, setEditStatusRequest] =
    useState<AdminServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceRequestStatus>("pendiente");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  // Estado para creación de usuario cliente por fila
  const [creatingClientUserId, setCreatingClientUserId] = useState<
    number | null
  >(null);

  // Data hooks
  const { data: requestsResponse, isLoading } = useAdminServiceRequests({
    ...filters,
    nameContains: debouncedSearchTerm || undefined,
  });
  const { data: categoriesResponse } = useAdminCategories();
  const { data: statsResponse } = useAdminServiceRequestStats();

  // Mutations
  const updateStatusMutation = useUpdateServiceRequestStatus();
  const deleteMutation = useDeleteServiceRequest();
  const generatePDFMutation = useGeneratePDF();
  const regeneratePDFMutation = useRegeneratePDF();

  const requests = requestsResponse?.data || [];
  const total = requestsResponse?.total || 0;
  const categories = categoriesResponse || [];
  const stats = statsResponse;

  // Memoized stats
  const statusStats = useMemo(() => {
    if (!stats) return {};
    return stats.byStatus;
  }, [stats]);

  // Notificaciones
  const { showSuccess, showError } = useNotifications();

  // Handler para crear usuario cliente
  const handleCreateClientUser = async (request: AdminServiceRequest) => {
    setCreatingClientUserId(request.id);
    const password = `${request.identification}.Ing$`;
    const registerDto: RegisterDto = {
      email: request.email,
      password,
      confirmPassword: password,
      name: request.name,
      role: "client",
    };
    try {
      await authService.register(registerDto);
      showSuccess("Usuario cliente creado exitosamente");
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al crear usuario cliente"
      );
    } finally {
      setCreatingClientUserId(null);
    }
  };

  // Handlers para la tabla
  const handlers: ServiceRequestTableHandlers = {
    onView: (request) => setSelectedRequest(request),
    onEditStatus: (request) => {
      setEditStatusRequest(request);
      setNewStatus(request.status);
    },
    onDelete: () => {}, // No-op para cumplir con el tipo
    onGeneratePDF: (id) => handleGeneratePDF(id),
    onRegeneratePDF: (id) => handleRegeneratePDF(id),
    isGeneratingPDF: (_id) => generatePDFMutation.isPending,
    isRegeneratingPDF: (_id) => regeneratePDFMutation.isPending,
    onCreateClientUser: handleCreateClientUser,
    isCreatingClientUser: (id) => creatingClientUserId === id,
  };

  const getStatusInfo: GetStatusInfo = (status) => {
    return (
      SERVICE_REQUEST_STATUSES.find((s) => s.value === status) || {
        value: status,
        label: status,
        color: "default",
      }
    );
  };

  // Tabla paginación
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
    setSelectedIds(new Set());
  };
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };
  const handleFilterChange = (field: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
    setSelectedIds(new Set());
  };
  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10, sortBy: "created_at", sortOrder: "DESC" });
    setSearchTerm("");
    setSelectedIds(new Set());
  };

  // Mutaciones
  const handleUpdateStatus = async () => {
    if (!editStatusRequest) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: editStatusRequest.id,
        status: newStatus,
      });
      setEditStatusRequest(null);
    } catch {
      // Manejar error si es necesario
    }
  };
  const handleGeneratePDF = async (id: number) => {
    try {
      await generatePDFMutation.mutateAsync(id);
    } catch {
      // Manejar error si es necesario
    }
  };
  const handleRegeneratePDF = async (id: number) => {
    try {
      await regeneratePDFMutation.mutateAsync(id);
    } catch {
      // Manejar error si es necesario
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
    } catch {
      // Manejar error si es necesario
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}
    >
      <ServiceRequestsHeader />
      {stats && (
        <ServiceRequestsStats stats={statusStats} total={stats.total} />
      )}
      <ServiceRequestsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleClearFilters={handleClearFilters}
        categories={categories}
        selectedIds={selectedIds}
        setShowBulkDeleteConfirm={setShowBulkDeleteConfirm}
        deleteMutationPending={deleteMutation.isPending}
      />
      <ServiceRequestsTable
        data={requests}
        columns={getServiceRequestColumns(handlers, getStatusInfo)}
        loading={isLoading}
        paginationData={{
          currentPage: filters.page ? filters.page - 1 : 0,
          totalPages: Math.ceil(total / (filters.limit || 10)),
          totalItems: total,
          itemsPerPage: filters.limit || 10,
          startItem: ((filters.page || 1) - 1) * (filters.limit || 10) + 1,
          endItem: Math.min((filters.page || 1) * (filters.limit || 10), total),
        }}
        onPageChange={(page) => handlePageChange(null, page)}
        onRowsPerPageChange={(rowsPerPage) =>
          handleRowsPerPageChange({
            target: { value: rowsPerPage.toString() },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        selectable={true}
        selectedRows={selectedIds}
        onSelectionChange={(ids) => setSelectedIds(ids as Set<number>)}
      />
      <ServiceRequestDetailsModal
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onEdit={(id) => {
          setSelectedRequest(null);
          navigate(
            ROUTES.ADMIN.SERVICE_REQUEST_EDIT.replace(":id", String(id))
          );
        }}
      />
      <ServiceRequestStatusEditModal
        open={!!editStatusRequest}
        onClose={() => setEditStatusRequest(null)}
        request={editStatusRequest}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        onSave={handleUpdateStatus}
        isLoading={updateStatusMutation.isPending}
        statusOptions={SERVICE_REQUEST_STATUSES.map(({ value, label }) => ({
          value,
          label,
        }))}
      />
      <BulkDeleteConfirmModal
        open={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        count={selectedIds.size}
        isLoading={deleteMutation.isPending}
      />
    </Container>
  );
};

export default ServiceRequestsManagementPage;
