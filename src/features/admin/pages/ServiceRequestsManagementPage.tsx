/**
 * Página de gestión de solicitudes de servicio
 * @file ServiceRequestsManagementPage.tsx
 */

import React, { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
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
  TextField,
  Button,
  Grid2,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TablePagination,
  Stack,
  Checkbox,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  RequestQuote as RequestIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/utils/formatters/dateFormatter";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useAdminServiceRequests,
  useUpdateServiceRequest,
  useDeleteServiceRequest,
  useGeneratePDF,
  useRegeneratePDF,
  useAdminServiceRequestStats,
} from "@/api/hooks/useAdminServiceRequests";
import { useAdminCategories } from "@/api/hooks/useAdminServices";
import type {
  AdminServiceRequestFilters,
  ServiceRequestStatus,
  AdminServiceRequest,
  AdminAdditionalValue,
  APIServiceAdditionalField,
} from "@/types/serviceRequests";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import TableLoading from "../components/TableLoading";

// Estados disponibles para las solicitudes
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
  const navigate = useNavigate();

  // Estados para filtros
  const [filters, setFilters] = useState<AdminServiceRequestFilters>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "DESC",
  });

  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // Estados para modales
  const [selectedRequest, setSelectedRequest] =
    useState<AdminServiceRequest | null>(null);
  const [editStatusRequest, setEditStatusRequest] =
    useState<AdminServiceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceRequestStatus>("pendiente");
  const [deletingRequest, setDeletingRequest] =
    useState<AdminServiceRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estados para selección múltiple
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  // Hooks de datos
  const { data: requestsResponse, isLoading } = useAdminServiceRequests({
    ...filters,
    nameContains: debouncedSearchTerm || undefined,
  });
  const { data: categoriesResponse } = useAdminCategories();
  const { data: statsResponse } = useAdminServiceRequestStats();

  // Hooks de mutaciones
  const updateStatusMutation = useUpdateServiceRequest();
  const deleteMutation = useDeleteServiceRequest();
  const generatePDFMutation = useGeneratePDF();
  const regeneratePDFMutation = useRegeneratePDF();
  const requests = requestsResponse?.data || [];
  const total = requestsResponse?.total || 0;
  const categories = categoriesResponse?.data || [];
  const stats = statsResponse;

  // Memoized values
  const statusStats = useMemo(() => {
    if (!stats) return {};
    return stats.byStatus;
  }, [stats]);
  // Handlers
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
    setSelectedIds(new Set()); // Limpiar selección al cambiar página
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
  const handleFilterChange = (
    field: keyof AdminServiceRequestFilters,
    value: unknown
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset page when filtering
    }));
    setSelectedIds(new Set()); // Limpiar selección al cambiar filtros
  };
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "created_at",
      sortOrder: "DESC",
    });
    setSearchTerm("");
    setSelectedIds(new Set()); // Limpiar selección al limpiar filtros
  };

  const handleUpdateStatus = async () => {
    if (!editStatusRequest) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: editStatusRequest.id,
        data: { status: newStatus },
      });
      setEditStatusRequest(null);
    } catch (_error) {
      // Error handling is done in the hook
    }
  };
  const handleDeleteRequest = async () => {
    if (!deletingRequest) return;

    try {
      await deleteMutation.mutateAsync(deletingRequest.id);
      setDeletingRequest(null);
    } catch (_error) {
      // Error handling is done in the hook
    }
  };
  const handleGeneratePDF = async (id: number) => {
    try {
      await generatePDFMutation.mutateAsync(id);
    } catch (_error) {
      // Error handling is done in the hook
    }
  };
  const handleRegeneratePDF = async (id: number) => {
    try {
      await regeneratePDFMutation.mutateAsync(id);
    } catch (_error) {
      // Error handling is done in the hook
    }
  };

  // Handlers para selección múltiple
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(requests.map((request) => request.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      // Eliminar todas las solicitudes seleccionadas secuencialmente
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
    } catch (_error) {
      // Error handling is done in the hook
    }
  };

  const isAllSelected =
    requests.length > 0 && selectedIds.size === requests.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < requests.length;

  const getStatusInfo = (status: ServiceRequestStatus) => {
    return (
      SERVICE_REQUEST_STATUSES.find((s) => s.value === status) || {
        value: status,
        label: status,
        color: "default" as const,
      }
    );
  };
  /**
   * Función para formatear campos adicionales con nombres descriptivos
   */
  const formatAdditionalValue = (
    value: AdminAdditionalValue,
    additionalFields: APIServiceAdditionalField[]
  ) => {
    // Extraer el ID del campo del fieldName (formato: instance_X_field_Y)
    const fieldIdMatch = value.fieldName.match(/field_(\d+)$/);
    if (!fieldIdMatch) {
      return {
        label: value.fieldName,
        value: value.fieldValue,
        formattedValue: value.fieldValue,
      };
    }

    const fieldId = parseInt(fieldIdMatch[1], 10);
    const field = additionalFields.find((f) => f.id === fieldId);

    if (!field) {
      return {
        label: value.fieldName,
        value: value.fieldValue,
        formattedValue: value.fieldValue,
      };
    } // Formatear el valor según el tipo de campo
    let formattedValue = value.fieldValue;
    if (field.type === "date" && value.fieldValue) {
      try {
        formattedValue = formatDate(value.fieldValue);
      } catch {
        formattedValue = value.fieldValue;
      }
    }

    return {
      label: field.label || field.name,
      value: value.fieldValue,
      formattedValue,
      type: field.type,
      required: field.required,
    };
  };
  /**
   * Función para agrupar campos adicionales por instancia
   */
  const groupAdditionalValuesByInstance = (
    additionalValues: AdminAdditionalValue[],
    additionalFields: APIServiceAdditionalField[]
  ) => {
    const instances = new Map<
      string,
      Array<{
        label: string;
        value: string;
        formattedValue: string;
        type?: string;
        required?: boolean;
      }>
    >();

    additionalValues.forEach((value) => {
      // Extraer número de instancia del fieldName (formato: instance_X_field_Y)
      const instanceMatch = value.fieldName.match(/instance_(\d+)_/);
      const instanceKey = instanceMatch
        ? `Instancia ${instanceMatch[1]}`
        : "General";

      if (!instances.has(instanceKey)) {
        instances.set(instanceKey, []);
      }
      const formattedValue = formatAdditionalValue(value, additionalFields);
      const instanceArray = instances.get(instanceKey);
      if (instanceArray) {
        instanceArray.push(formattedValue);
      }
    });

    return instances;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate("/admin")} size="large">
            <ArrowBackIcon />
          </IconButton>
          <RequestIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Gestión de Solicitudes de Servicio
          </Typography>
        </Box>

        {/* Estadísticas rápidas */}
        {stats && (
          <Grid2 container spacing={2} sx={{ mb: 3 }}>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Solicitudes
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            {SERVICE_REQUEST_STATUSES.map((status) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={status.value}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h4" color={`${status.color}.main`}>
                      {statusStats[status.value] || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {status.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Box>
      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre del cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Limpiar
            </Button>
            {selectedIds.size > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
              >
                Eliminar ({selectedIds.size})
              </Button>
            )}
          </Box>
          {/* Filtros expandibles */}
          {showFilters && (
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.status || ""}
                    label="Estado"
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value || undefined)
                    }
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {SERVICE_REQUEST_STATUSES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filters.categoryId || ""}
                    label="Categoría"
                    onChange={(e) =>
                      handleFilterChange(
                        "categoryId",
                        e.target.value || undefined
                      )
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Fecha desde"
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value || undefined)
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  size="small"
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Fecha hasta"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value || undefined)
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  size="small"
                />
              </Grid2>
            </Grid2>
          )}
        </CardContent>
      </Card>
      {/* Tabla de solicitudes */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Proyecto</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Servicios</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableLoading colSpan={9} />
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      No se encontraron solicitudes de servicio
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => {
                    const statusInfo = getStatusInfo(request.status);
                    const isSelected = selectedIds.has(request.id);

                    return (
                      <TableRow key={request.id} hover selected={isSelected}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) =>
                              handleSelectOne(request.id, e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell>#{request.id}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {request.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {request.identification}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {request.nameProject}
                          </Typography>
                        </TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.selectedServices?.length || 0} servicio(s)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(request.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Cambiar estado">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditStatusRequest(request);
                                  setNewStatus(request.status);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Generar PDF">
                              <IconButton
                                size="small"
                                onClick={() => handleGeneratePDF(request.id)}
                                disabled={generatePDFMutation.isPending}
                              >
                                <PdfIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Regenerar PDF">
                              <IconButton
                                size="small"
                                onClick={() => handleRegeneratePDF(request.id)}
                                disabled={regeneratePDFMutation.isPending}
                              >
                                <RefreshIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeletingRequest(request)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          <TablePagination
            component="div"
            count={total}
            page={filters.page ? filters.page - 1 : 0}
            onPageChange={handlePageChange}
            rowsPerPage={filters.limit || 10}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </CardContent>
      </Card>
      {/* Modal de detalles */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles de Solicitud #{selectedRequest?.id}</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Información del Cliente
                  </Typography>
                  <Typography>
                    <strong>Nombre:</strong> {selectedRequest.name}
                  </Typography>
                  <Typography>
                    <strong>Identificación:</strong>
                    {selectedRequest.identification}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {selectedRequest.email}
                  </Typography>
                  <Typography>
                    <strong>Teléfono:</strong> {selectedRequest.phone}
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Información del Proyecto
                  </Typography>
                  <Typography>
                    <strong>Proyecto:</strong> {selectedRequest.nameProject}
                  </Typography>
                  <Typography>
                    <strong>Ubicación:</strong> {selectedRequest.location}
                  </Typography>
                  <Typography>
                    <strong>Estado:</strong>
                    <Chip
                      label={getStatusInfo(selectedRequest.status).label}
                      color={getStatusInfo(selectedRequest.status).color}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Descripción
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {selectedRequest.description}
                    </Typography>
                  </Paper>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Servicios Solicitados (
                    {selectedRequest.selectedServices?.length || 0})
                  </Typography>
                  {selectedRequest.selectedServices?.map((service) => (
                    <Paper
                      key={service.id}
                      variant="outlined"
                      sx={{ p: 2, mb: 2 }}
                    >
                      <Typography variant="subtitle1">
                        {service.service.code} - {service.service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Categoría: {service.service.category.name}
                      </Typography>
                      <Typography variant="body2">
                        Cantidad: {service.quantity}
                      </Typography>
                      {service.additionalValues?.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            Información adicional:
                          </Typography>
                          {(() => {
                            const groupedValues =
                              groupAdditionalValuesByInstance(
                                service.additionalValues,
                                service.service.additionalFields
                              );

                            return Array.from(groupedValues.entries()).map(
                              ([instanceKey, values]) => (
                                <Box key={instanceKey} sx={{ ml: 1, mt: 0.5 }}>
                                  {groupedValues.size > 1 && (
                                    <Typography
                                      variant="caption"
                                      fontWeight="medium"
                                      color="primary"
                                      display="block"
                                    >
                                      {instanceKey}:
                                    </Typography>
                                  )}
                                  {values.map((formattedValue, idx) => (
                                    <Typography
                                      key={idx}
                                      variant="caption"
                                      display="block"
                                      sx={{
                                        ml: groupedValues.size > 1 ? 1 : 0,
                                      }}
                                    >
                                      <strong>{formattedValue.label}:</strong>
                                      {formattedValue.formattedValue}
                                      {formattedValue.required && (
                                        <Typography
                                          component="span"
                                          color="error"
                                          sx={{ ml: 0.5 }}
                                        >
                                          *
                                        </Typography>
                                      )}
                                    </Typography>
                                  ))}
                                </Box>
                              )
                            );
                          })()}
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Grid2>
              </Grid2>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      {/* Modal de cambio de estado */}
      <Dialog
        open={!!editStatusRequest}
        onClose={() => setEditStatusRequest(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Cambiar Estado - Solicitud #{editStatusRequest?.id}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={newStatus}
              label="Estado"
              onChange={(e) =>
                setNewStatus(e.target.value as ServiceRequestStatus)
              }
            >
              {SERVICE_REQUEST_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStatusRequest(null)}>Cancelar</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updateStatusMutation.isPending}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteDialog
        open={!!deletingRequest}
        onClose={() => setDeletingRequest(null)}
        onConfirm={handleDeleteRequest}
        title="Eliminar Solicitud de Servicio"
        content={`¿Está seguro que desea eliminar la solicitud #${deletingRequest?.id} de ${deletingRequest?.name}? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
      {/* Modal de confirmación de eliminación masiva */}
      <Dialog
        open={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar Múltiples Solicitudes</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
          <Typography>
            ¿Está seguro que desea eliminar <strong>{selectedIds.size}</strong>
            solicitud{selectedIds.size !== 1 ? "es" : ""} de servicio
            seleccionada{selectedIds.size !== 1 ? "s" : ""}?
          </Typography>
          {selectedIds.size > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Solicitudes a eliminar:
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: "auto", mt: 1 }}>
                {requests
                  .filter((request) => selectedIds.has(request.id))
                  .map((request) => (
                    <Typography key={request.id} variant="body2" sx={{ ml: 1 }}>
                      • #{request.id} - {request.name} ({request.nameProject})
                    </Typography>
                  ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowBulkDeleteConfirm(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? "Eliminando..."
              : `Eliminar ${selectedIds.size} solicitud${
                  selectedIds.size !== 1 ? "es" : ""
                }`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceRequestsManagementPage;
