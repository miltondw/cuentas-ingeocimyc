/**
 * Página de gestión de solicitudes de servicio - Rediseño minimalista
 * @file ServiceRequestsManagementPage.tsx
 */

import React, { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
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
  Stack,
  Alert,
  Fade,
  useTheme,
  alpha,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import DataTable from "@/components/common/DataTable";
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
import { ROUTES } from "@/utils/routes";

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
  const theme = useTheme();
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {/* Header responsivo y moderno */}
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
          {/* Header superior - Botón de regreso y icono */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "flex-start", sm: "flex-start" },
            }}
          >
            {" "}
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
            {/* Icono principal - más pequeño en móvil */}{" "}
            <RequestIcon
              sx={{
                fontSize: { xs: 30, sm: 36, md: 40 },
                color: theme.palette.primary.main,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                ml: { xs: 0.5, sm: 0 },
              }}
            />
          </Box>{" "}
          {/* Contenido del título */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              mt: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: { xs: 600, sm: 700 },
                color: theme.palette.text.primary,
                letterSpacing: "-0.02em",
                lineHeight: { xs: 1.3, sm: 1.1 },
                wordBreak: "break-word",
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" }, // h6 en xs, h5 en sm, h4 en md+
              }}
            >
              Gestión de Solicitudes
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: { xs: 0.5, sm: 0.5 },
                display: { xs: "block", sm: "block" },
                lineHeight: 1.4,
                fontSize: { xs: "0.75rem", sm: "0.875rem" }, // caption en xs, body2 en sm+
                maxWidth: { xs: "100%", sm: "400px", md: "none" },
              }}
            >
              Administra y da seguimiento a todas las solicitudes de servicio
            </Typography>
          </Box>
        </Box>{" "}
        {/* Estadísticas responsivas con diseño moderno */}
        {stats && (
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
                <CardContent
                  sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}
                >
                  <AssessmentIcon
                    sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
                  />{" "}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      lineHeight: 1,
                      fontSize: { xs: "2rem", sm: "3rem" }, // h4 en xs, h3 en sm+
                    }}
                  >
                    {stats.total}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.875rem", sm: "1rem" }, // body2 en xs, body1 en sm+
                    }}
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
                <CardContent
                  sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}
                >
                  <ScheduleIcon
                    sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
                  />{" "}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      lineHeight: 1,
                      fontSize: { xs: "2rem", sm: "3rem" }, // h4 en xs, h3 en sm+
                    }}
                  >
                    {statusStats["pendiente"] || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.875rem", sm: "1rem" }, // body2 en xs, body1 en sm+
                    }}
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
                <CardContent
                  sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}
                >
                  <TrendingUpIcon
                    sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
                  />{" "}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      lineHeight: 1,
                      fontSize: { xs: "2rem", sm: "3rem" }, // h4 en xs, h3 en sm+
                    }}
                  >
                    {statusStats["en proceso"] || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.875rem", sm: "1rem" }, // body2 en xs, body1 en sm+
                    }}
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
                <CardContent
                  sx={{ textAlign: "center", py: { xs: 2.5, sm: 3 } }}
                >
                  <CheckCircleIcon
                    sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, opacity: 0.9 }}
                  />{" "}
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      lineHeight: 1,
                      fontSize: { xs: "2rem", sm: "3rem" }, // h4 en xs, h3 en sm+
                    }}
                  >
                    {statusStats["completado"] || 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: "0.875rem", sm: "1rem" }, // body2 en xs, body1 en sm+
                    }}
                  >
                    Completadas
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        )}
      </Box>{" "}
      {/* Sección de filtros responsiva y moderna */}
      <Card
        sx={{
          mb: 4,
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Barra de búsqueda principal */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 2, sm: 2 },
              mb: { xs: 2, sm: 3 },
            }}
          >
            <TextField
              placeholder="Buscar por nombre del cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                order: { xs: 1, sm: 1 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                  "&.Mui-focused": {
                    bgcolor: "white",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
              size="medium"
            />

            {/* Botones de acción - responsive */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                order: { xs: 2, sm: 2 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.25, sm: 1.5 },
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: { xs: "auto", sm: "auto" },
                }}
              >
                Filtros
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.25, sm: 1.5 },
                  textTransform: "none",
                  fontWeight: 600,
                }}
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
                  sx={{
                    borderRadius: 2,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.25, sm: 1.5 },
                    textTransform: "none",
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #f44336, #d32f2f)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #d32f2f, #c62828)",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    Eliminar ({selectedIds.size})
                  </Box>
                  <Box
                    component="span"
                    sx={{ display: { xs: "inline", sm: "none" } }}
                  >
                    ({selectedIds.size})
                  </Box>
                </Button>
              )}
            </Box>
          </Box>

          {/* Filtros expandibles con animación */}
          <Fade in={showFilters}>
            <Box sx={{ display: showFilters ? "block" : "none" }}>
              <Grid2 container spacing={{ xs: 2, sm: 3 }}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filters.status || ""}
                      label="Estado"
                      onChange={(e) =>
                        handleFilterChange(
                          "status",
                          e.target.value || undefined
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "grey.300",
                        },
                      }}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {SERVICE_REQUEST_STATUSES.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
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
                      sx={{
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "grey.300",
                        },
                      }}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {categories.map(
                        (category: { id: number; name: string }) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Fecha desde"
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "startDate",
                        e.target.value || undefined
                      )
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid2>
              </Grid2>
            </Box>
          </Fade>
        </CardContent>
      </Card>
      {/* Tabla mejorada con DataTable */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {" "}
        <DataTable
          data={requests}
          columns={[
            {
              key: "id",
              label: "ID",
              render: (_, request) => (
                <Typography variant="body2" fontWeight="medium">
                  #{(request as AdminServiceRequest).id}
                </Typography>
              ),
            },
            {
              key: "name",
              label: "Cliente",
              render: (_, request) => {
                const req = request as AdminServiceRequest;
                return (
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {req.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {req.identification}
                    </Typography>
                  </Box>
                );
              },
            },
            {
              key: "nameProject",
              label: "Proyecto",
              render: (_, request) => (
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(request as AdminServiceRequest).nameProject}
                </Typography>
              ),
            },
            {
              key: "email",
              label: "Email",
              render: (_, request) => (
                <Typography variant="body2" color="text.secondary">
                  {(request as AdminServiceRequest).email}
                </Typography>
              ),
            },
            {
              key: "status",
              label: "Estado",
              render: (_, request) => {
                const req = request as AdminServiceRequest;
                const statusInfo = getStatusInfo(req.status);
                return (
                  <Chip
                    label={statusInfo.label}
                    color={statusInfo.color}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  />
                );
              },
            },
            {
              key: "services",
              label: "Servicios",
              render: (_, request) => (
                <Typography variant="body2">
                  {(request as AdminServiceRequest).selectedServices?.length ||
                    0}{" "}
                  servicio(s)
                </Typography>
              ),
            },
            {
              key: "created_at",
              label: "Fecha",
              render: (_, request) => (
                <Typography variant="body2">
                  {formatDate((request as AdminServiceRequest).created_at)}
                </Typography>
              ),
            },
            {
              key: "actions",
              label: "Acciones",
              render: (_, request) => {
                const req = request as AdminServiceRequest;
                return (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedRequest(req)}
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Cambiar estado">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditStatusRequest(req);
                          setNewStatus(req.status);
                        }}
                        sx={{
                          color: theme.palette.info.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Generar PDF">
                      <IconButton
                        size="small"
                        onClick={() => handleGeneratePDF(req.id)}
                        disabled={generatePDFMutation.isPending}
                        sx={{
                          color: theme.palette.secondary.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        <PdfIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Regenerar PDF">
                      <IconButton
                        size="small"
                        onClick={() => handleRegeneratePDF(req.id)}
                        disabled={regeneratePDFMutation.isPending}
                        sx={{
                          color: theme.palette.warning.main,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                          },
                        }}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeletingRequest(req)}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                );
              },
            },
          ]}
          loading={isLoading}
          enablePagination={true}
          paginationData={{
            currentPage: filters.page ? filters.page - 1 : 0,
            totalPages: Math.ceil(total / (filters.limit || 10)),
            totalItems: total,
            itemsPerPage: filters.limit || 10,
            startItem: ((filters.page || 1) - 1) * (filters.limit || 10) + 1,
            endItem: Math.min(
              (filters.page || 1) * (filters.limit || 10),
              total
            ),
          }}
          onPageChange={(page) => handlePageChange(null, page)}
          onRowsPerPageChange={(rowsPerPage) =>
            handleRowsPerPageChange({
              target: { value: rowsPerPage.toString() },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          selectable={true}
          selectedRows={selectedIds}
          onSelectionChange={(selectedIds) =>
            setSelectedIds(selectedIds as Set<number>)
          }
          emptyMessage="No se encontraron solicitudes de servicio"
          mobileViewMode="auto"
        />
      </Card>
      {/* Modal de detalles mejorado */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <RequestIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="700">
                Detalles de Solicitud #{selectedRequest?.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Información completa de la solicitud
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Grid2 container spacing={4}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="primary"
                      fontWeight="600"
                    >
                      Información del Cliente
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          NOMBRE COMPLETO
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedRequest.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          IDENTIFICACIÓN
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.identification}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          EMAIL
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          TELÉFONO
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="primary"
                      fontWeight="600"
                    >
                      Información del Proyecto
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          PROYECTO
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {selectedRequest.nameProject}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          UBICACIÓN
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.location}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          ESTADO ACTUAL
                        </Typography>
                        <Chip
                          label={getStatusInfo(selectedRequest.status).label}
                          color={getStatusInfo(selectedRequest.status).color}
                          size="small"
                          sx={{
                            mt: 0.5,
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                        >
                          FECHA DE SOLICITUD
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedRequest.created_at)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: "1px solid",
                      borderColor: alpha(theme.palette.info.main, 0.2),
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="info.main"
                      fontWeight="600"
                    >
                      Descripción del Proyecto
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {selectedRequest.description}
                    </Typography>
                  </Paper>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="primary"
                    fontWeight="600"
                  >
                    Servicios Solicitados (
                    {selectedRequest.selectedServices?.length || 0})
                  </Typography>
                  <Stack spacing={2}>
                    {selectedRequest.selectedServices?.map((service, index) => (
                      <Paper
                        key={service.id}
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: "white",
                          border: "1px solid",
                          borderColor: "grey.200",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 40,
                              height: 40,
                              borderRadius: "50%",
                              bgcolor: theme.palette.primary.main,
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              fontWeight="600"
                              gutterBottom
                            >
                              {service.service.code} - {service.service.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Categoría: {service.service.category.name}
                            </Typography>
                            <Typography variant="body1">
                              Cantidad: <strong>{service.quantity}</strong>
                            </Typography>
                          </Box>
                        </Box>

                        {service.additionalValues?.length > 0 && (
                          <Box
                            sx={{
                              mt: 2,
                              pt: 2,
                              borderTop: "1px solid",
                              borderColor: "grey.200",
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              gutterBottom
                            >
                              Información adicional:
                            </Typography>
                            {(() => {
                              const groupedValues =
                                groupAdditionalValuesByInstance(
                                  service.additionalValues,
                                  service.service.additionalFields
                                );
                              // Obtener todos los nombres de campos adicionales en orden
                              const additionalFieldNames =
                                service.service.additionalFields.map(
                                  (f) => f.label
                                );
                              // Construir filas: cada grupo es una muestra
                              const rows = Array.from(
                                groupedValues.values()
                              ).map((values) => {
                                // Mapear los valores a un objeto {label: valor}
                                const valueMap: Record<string, string> = {};
                                values.forEach((v) => {
                                  valueMap[v.label] = v.formattedValue;
                                });
                                return valueMap;
                              });
                              if (
                                rows.length === 0 ||
                                additionalFieldNames.length === 0
                              ) {
                                return (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    No hay información adicional para mostrar.
                                  </Typography>
                                );
                              }
                              return (
                                <Box sx={{ overflowX: "auto", mt: 1 }}>
                                  <Table
                                    size="small"
                                    sx={{
                                      minWidth: 400,
                                      backgroundColor: "white",
                                      borderRadius: 1,
                                    }}
                                  >
                                    <TableHead>
                                      <TableRow>
                                        {additionalFieldNames.map((label) => (
                                          <TableCell
                                            key={label}
                                            sx={{
                                              fontWeight: 700,
                                              backgroundColor: "grey.100",
                                              borderRight: "1px solid",
                                              borderColor: "grey.200",
                                            }}
                                          >
                                            {label}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {rows.map((row, idx) => (
                                        <TableRow key={idx}>
                                          {additionalFieldNames.map((label) => (
                                            <TableCell
                                              key={label}
                                              sx={{
                                                borderRight: "1px solid",
                                                borderColor: "grey.200",
                                              }}
                                            >
                                              {row[label] ?? "-"}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              );
                            })()}
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Grid2>
              </Grid2>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button
            onClick={() => setSelectedRequest(null)}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cerrar
          </Button>
          {selectedRequest && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedRequest(null);
                navigate(
                  ROUTES.ADMIN.SERVICE_REQUEST_EDIT.replace(
                    ":id",
                    String(selectedRequest.id)
                  )
                );
              }}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                ml: 2,
              }}
            >
              Editar
            </Button>
          )}
        </DialogActions>
      </Dialog>{" "}
      {/* Modal de cambio de estado mejorado */}
      <Dialog
        open={!!editStatusRequest}
        onClose={() => setEditStatusRequest(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <EditIcon color="info" />
            <Box>
              <Typography variant="h6" fontWeight="700">
                Cambiar Estado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Solicitud #{editStatusRequest?.id}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={newStatus}
              label="Estado"
              onChange={(e) =>
                setNewStatus(e.target.value as ServiceRequestStatus)
              }
              sx={{
                borderRadius: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "grey.300",
                },
              }}
            >
              {SERVICE_REQUEST_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button
            onClick={() => setEditStatusRequest(null)}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={updateStatusMutation.isPending}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              background: `linear-gradient(135deg, ${
                theme.palette.primary.main
              }, ${alpha(theme.palette.primary.main, 0.8)})`,
              "&:hover": {
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.9
                )}, ${alpha(theme.palette.primary.main, 0.7)})`,
              },
            }}
          >
            {updateStatusMutation.isPending ? "Actualizando..." : "Actualizar"}
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
      />{" "}
      {/* Modal de confirmación de eliminación masiva mejorado */}
      <Dialog
        open={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DeleteIcon color="error" />
            <Box>
              <Typography variant="h6" fontWeight="700">
                Eliminar Múltiples Solicitudes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta acción no se puede deshacer
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
          >
            <Typography fontWeight="600">
              ¡Atención! Esta acción es irreversible
            </Typography>
          </Alert>

          <Typography variant="body1" gutterBottom>
            ¿Está seguro que desea eliminar <strong>{selectedIds.size}</strong>{" "}
            solicitud{selectedIds.size !== 1 ? "es" : ""} de servicio
            seleccionada{selectedIds.size !== 1 ? "s" : ""}?
          </Typography>

          {selectedIds.size > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="600"
                gutterBottom
              >
                Solicitudes a eliminar:
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Stack spacing={1}>
                  {requests
                    .filter((request) => selectedIds.has(request.id))
                    .map((request) => (
                      <Box
                        key={request.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: "white",
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          color="error"
                        >
                          #{request.id}
                        </Typography>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {request.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.nameProject}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                </Stack>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button
            onClick={() => setShowBulkDeleteConfirm(false)}
            disabled={deleteMutation.isPending}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #f44336, #d32f2f)",
              "&:hover": {
                background: "linear-gradient(135deg, #d32f2f, #c62828)",
              },
            }}
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
