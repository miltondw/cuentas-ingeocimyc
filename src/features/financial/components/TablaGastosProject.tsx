import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  MenuItem,
  Grid2,
  Box,
  Stack,
  Collapse,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import api from "@/api";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import {
  DataTable,
  type ColumnConfig,
  type RowAction,
} from "@/components/common/DataTable";
import DataTablePagination from "@/components/common/DataTablePagination";
import { useServerPagination } from "@/hooks/useServerPagination";
import {
  Project,
  ProjectFilters,
  DEFAULT_PROJECT_FILTERS,
} from "@/types/projects";
import { formatNumber, parseNumber } from "@/utils/formatNumber";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUrlFilters } from "@/hooks/useUrlFilters";

// Constants for select options
const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "completado", label: "Completado" },
  { value: "suspendido", label: "Suspendido" },
  { value: "cancelado", label: "Cancelado" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "credito", label: "Crédito" },
];

// Campos de fecha para filtros
const DATE_FILTER_FIELDS = [
  { key: "startDate", label: "Fecha desde" },
  { key: "endDate", label: "Fecha hasta" },
] as const;

// Types
interface ProjectGastos {
  [key: string]: number;
}

interface ProjectCalculations {
  totalGastos: number;
  saldo: number;
  estadoCuenta: "Pendiente" | "Pagado" | "Abonado";
  utilidadNeta: number;
}

interface AppState {
  modals: {
    delete: boolean;
    payment: boolean;
  };
  selectedProject: Project | null;
  paymentAmount: string;
  showAdvancedFilters: boolean;
}

// Constants
const formatDate = (dateStr: string): string =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" })
    : "";

const getGastos = (project: Project): ProjectGastos => {
  try {
    // Usar la nueva estructura 'expenses' del backend
    const expenses =
      project?.expenses && project.expenses.length > 0
        ? project.expenses[0]
        : null; // Tomar el primer gasto (debería ser único por proyecto)

    if (!expenses) {
      //console.info(`Proyecto ID ${project.id} no tiene datos de gastos.`);
      return {};
    }

    const gastos: ProjectGastos = {};

    // Procesar los campos de gastos fijos
    const camposGastos = [
      "camioneta",
      "campo",
      "obreros",
      "comidas",
      "otros",
      "peajes",
      "combustible",
      "hospedaje",
    ];

    camposGastos.forEach((campo) => {
      const valor = expenses[campo as keyof typeof expenses];
      if (valor && typeof valor === "string") {
        gastos[campo] = parseFloat(valor) || 0;
      }
    });

    // Procesar otrosCampos si existe
    if (
      "otrosCampos" in expenses &&
      expenses.otrosCampos &&
      typeof expenses.otrosCampos === "object"
    ) {
      Object.entries(expenses.otrosCampos).forEach(([key, value]) => {
        if (
          typeof value === "number" &&
          !["id", "gasto_proyecto_id", "id"].includes(key)
        ) {
          gastos[key] = value;
        }
      });
    }

    //  console.info(`✅ Gastos procesados para proyecto ${project.id}:`, gastos);
    return gastos;
  } catch (error) {
    console.warn(`Error procesando gastos para proyecto ${project.id}:`, error);
    return {};
  }
};

const calculateValues = (project: Project): ProjectCalculations => {
  const gastos = getGastos(project);
  const costo = Number(project.costoServicio) || 0;
  const abono = Number(project.abono) || 0;
  const totalGastos = Object.values(gastos).reduce(
    (sum, value) => sum + value,
    0
  );
  const saldo = Math.max(costo - abono, 0);

  const estadoCuenta: "Pendiente" | "Pagado" | "Abonado" =
    abono === 0 ? "Pendiente" : abono >= costo ? "Pagado" : "Abonado";
  const re =
    (Number(project.valorRetencion) / 100) * Number(project.costoServicio);
  const utilidadNeta = Number(costo) - totalGastos - re;

  return { totalGastos, saldo, estadoCuenta, utilidadNeta };
};

const colorEstadoCuenta = (estado: string): string => {
  switch (estado) {
    case "Pendiente":
      return "#f44336";
    case "Pagado":
      return "#4caf50";
    case "Abonado":
      return "#ff9800";
    default:
      return "transparent";
  }
};

// Función auxiliar para formatear valores monetarios
const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  return `$${formatNumber(numValue)}`;
};

// Configuración de columnas para DataTable
const createTableColumns = (
  calculations: Record<string, ProjectCalculations>,
  colorEstadoCuenta: (estado: string) => string
): ColumnConfig<Project>[] => [
  {
    key: "fecha",
    label: "Fecha",
    sortable: true,
    width: 120,
    render: (value) => formatDate(value as string),
  },
  {
    key: "solicitante",
    label: "Solicitante",
    sortable: true,
    width: 150,
  },
  {
    key: "nombreProyecto",
    label: "Proyecto",
    sortable: true,
    width: 200,
    render: (value) => (
      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
        {value as string}
      </Typography>
    ),
  },
  {
    key: "factura",
    label: "N° Factura",
    sortable: true,
    width: 120,
    render: (value) => (value as string) || "N/A",
  },
  {
    key: "valorRetencion",
    label: "% De Retención",
    sortable: true,
    width: 120,
    render: (value) => `${value}%`,
  },
  {
    key: "valor_iva",
    label: "Valor de Iva",
    sortable: true,
    width: 120,
    render: (value) => formatCurrency(value as number),
  },
  {
    key: "valor_re",
    label: "Valor de Retención",
    sortable: true,
    width: 120,
    render: (value) => formatCurrency(value as number),
  },
  {
    key: "obrero",
    label: "Obrero",
    sortable: true,
    width: 150,
  },
  {
    key: "metodoDePago",
    label: "Método de Pago",
    sortable: true,
    width: 150,
  },
  {
    key: "costoServicio",
    label: "Costo Servicio",
    sortable: true,
    width: 150,
    render: (value) => (
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {formatCurrency(value as string)}
      </Typography>
    ),
  },
  {
    key: "abono",
    label: "Abonado",
    sortable: true,
    width: 120,
    render: (value) => formatCurrency(value as string),
  },
  {
    key: "total_gastos",
    label: "Total Gastos",
    sortable: true,
    width: 150,
    render: (_, row) => {
      const calc = calculations[row.id];
      return formatCurrency(calc?.totalGastos || 0);
    },
  },
  {
    key: "utilidad_neta",
    label: "Utilidad Neta",
    sortable: true,
    width: 150,
    render: (_, row) => {
      const calc = calculations[row.id];
      const utilidad = calc?.utilidadNeta || 0;
      return (
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: utilidad >= 0 ? "green" : "red",
          }}
        >
          {formatCurrency(utilidad)}
        </Typography>
      );
    },
  },
  {
    key: "saldo",
    label: "Saldo",
    sortable: true,
    width: 120,
    render: (_, row) => {
      const calc = calculations[row.id];
      return formatCurrency(calc?.saldo || 0);
    },
  },
  {
    key: "estado_cuenta",
    label: "Estado",
    sortable: true,
    width: 120,
    render: (_, row) => {
      const calc = calculations[row.id];
      const estado = calc?.estadoCuenta || "Pendiente";
      return (
        <Box
          sx={{
            backgroundColor: colorEstadoCuenta(estado),
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: "medium",
          }}
        >
          {estado}
        </Box>
      );
    },
  },
];

// Configuración de acciones para DataTable
const createRowActions = (
  navigate: ReturnType<typeof useNavigate>,
  openPaymentDialog: (project: Project) => void,
  openDeleteDialog: (project: Project) => void,
  _calculations: Record<string, ProjectCalculations>
): RowAction<Project>[] => [
  {
    key: "edit",
    label: "Editar proyecto",
    icon: <EditIcon fontSize="small" />,
    color: "primary",
    action: (project) => navigate(`/crear-proyecto/${project.id}`),
  },
  {
    key: "payment",
    label: "Registrar pago",
    icon: <PaymentIcon fontSize="small" />,
    color: "primary",
    action: (project) => openPaymentDialog(project),
  },
  {
    key: "delete",
    label: "Eliminar proyecto",
    icon: <DeleteIcon fontSize="small" />,
    color: "error",
    action: openDeleteDialog,
  },
];

// Función para fetch de proyectos con el formato correcto para paginación de servidor
const fetchProjects = async (filters: ProjectFilters) => {
  const params: Record<string, string | number> = {
    page: filters.page || 1,
    limit: filters.limit || 10,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "boolean") {
        params[key] = value ? "true" : "false";
      } else if (Array.isArray(value)) {
        params[key] = value.join(",");
      } else {
        params[key] = value;
      }
    }
  });

  const response = await api.get("/projects", { params });

  // Procesar los datos para agregar campos calculados
  const processedData =
    response.data.data?.map((p: Project) => ({
      ...p,
      valor_re: p.valorRetencion
        ? (Number(p.valorRetencion) / 100) * Number(p.costoServicio)
        : 0,
      valor_iva: Number(p.costoServicio) ? 0.19 * Number(p.costoServicio) : 0,
    })) || [];

  return {
    data: processedData,
    total: response.data.total || 0,
    page: response.data.page || filters.page || 1,
    limit: response.data.limit || filters.limit || 10,
  };
};

// Hook personalizado para proyectos con paginación
const useProjectsWithPagination = (filters: ProjectFilters, enabled = true) => {
  const queryResult = useQuery({
    queryKey: ["projects-financial", filters],
    queryFn: () => fetchProjects(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // Retry logic similar al original
      const axiosError = error as {
        code?: string;
        response?: { status: number };
        message?: string;
      };

      if (
        failureCount < 2 &&
        (axiosError?.code === "NETWORK_ERROR" ||
          (axiosError?.response?.status && axiosError.response.status >= 500) ||
          axiosError?.message?.includes("fetch"))
      ) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  return useServerPagination<Project>({
    apiResponse: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
  });
};

const TablaGastosProject: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification, showError } = useNotifications();
  const queryClient = useQueryClient();

  // Hook de filtros con URL params
  const {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    isLoading: filtersLoading,
  } = useUrlFilters<ProjectFilters>({
    defaultFilters: DEFAULT_PROJECT_FILTERS,
    debounceMs: 300,
    excludeFromUrl: [], // Incluir todos los filtros en la URL
  });

  // Estado local para inputs de texto (sin debounce en la UI)
  const [localInputs, setLocalInputs] = useState({
    search: filters.search || "",
    solicitante: filters.solicitante || "",
    nombreProyecto: filters.nombreProyecto || "",
    obrero: filters.obrero || "",
  });
  const [state, setState] = useState<AppState>({
    modals: { delete: false, payment: false },
    selectedProject: null,
    paymentAmount: "",
    showAdvancedFilters: false,
  });
  // Hook de paginación con datos del servidor
  const {
    data: projects,
    isLoading,
    paginationData,
    isEmpty,
    error,
  } = useProjectsWithPagination(filters, !filtersLoading);

  // Sincronizar inputs locales con filtros cuando cambien desde URL
  useEffect(() => {
    setLocalInputs({
      search: filters.search || "",
      solicitante: filters.solicitante || "",
      nombreProyecto: filters.nombreProyecto || "",
      obrero: filters.obrero || "",
    });
  }, [
    filters.search,
    filters.solicitante,
    filters.nombreProyecto,
    filters.obrero,
  ]);

  // Función para manejar cambios en inputs de texto con debounce
  const handleTextInputChange = useCallback(
    (field: keyof typeof localInputs, value: string) => {
      // Actualizar estado local inmediatamente (sin debounce)
      setLocalInputs((prev) => ({ ...prev, [field]: value }));

      // Actualizar filtros con debounce
      updateFilter(field, value);
    },
    [updateFilter]
  ); // Handlers simplificados para paginación
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );

  const handleRowsPerPageChange = useCallback(
    (newLimit: number) => {
      updateFilters({
        limit: newLimit,
        page: 1, // Resetear a la primera página
      });
    },
    [updateFilters]
  );
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setLocalInputs({
      search: "",
      solicitante: "",
      nombreProyecto: "",
      obrero: "",
    });
    setState((prev) => ({ ...prev, showAdvancedFilters: false }));
    showNotification({
      severity: "info",
      message: "Filtros limpiados correctamente",
      duration: 2000,
    });
  }, [clearFilters, showNotification]);

  // Mostrar notificación cuando no hay datos (manejado por el hook)
  useEffect(() => {
    if (!isLoading && isEmpty && !error) {
      showNotification({
        severity: "info",
        message: "No se encontraron proyectos con los filtros aplicados",
        duration: 3000,
      });
    }
  }, [isLoading, isEmpty, error, showNotification]);
  const handlePayment = async () => {
    const { selectedProject, paymentAmount } = state;
    if (!selectedProject || !paymentAmount) {
      showError("Proyecto o monto de pago no válido");
      return;
    }

    try {
      // Convertir a número para enviar al backend
      const montoNumerico = Number(paymentAmount);

      await api.patch(`/projects/${selectedProject.id}/payment`, {
        monto: montoNumerico,
      });

      showNotification({
        severity: "success",
        message: `Se ha registrado el abono de $${formatNumber(
          montoNumerico
        )} al proyecto ${selectedProject.nombreProyecto}`,
        duration: 4000,
      });

      // Invalidar las queries para refrescar automáticamente
      await queryClient.invalidateQueries({
        queryKey: ["projects-financial"],
      });

      setState((prev) => ({
        ...prev,
        modals: { ...prev.modals, payment: false },
        selectedProject: null,
        paymentAmount: "",
      }));
    } catch (error) {
      const errorMessage = `Error al procesar el pago: ${
        (error as Error).message
      }`;
      showError(errorMessage);
    }
  };
  const handleDelete = async () => {
    if (!state.selectedProject) return;

    try {
      await api.delete(`/projects/${state.selectedProject.id}`);

      showNotification({
        severity: "success",
        message: `El proyecto "${state.selectedProject.nombreProyecto}" ha sido eliminado correctamente`,
        duration: 3000,
      });

      // Invalidar las queries para refrescar automáticamente
      await queryClient.invalidateQueries({
        queryKey: ["projects-financial"],
      });

      setState((prev) => ({
        ...prev,
        modals: { ...prev.modals, delete: false },
        selectedProject: null,
      }));
    } catch (error) {
      const errorMessage = `Error al eliminar proyecto: ${
        (error as Error).message
      }`;
      showError(errorMessage);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setState((prev) => ({
      ...prev,
      selectedProject: project,
      modals: { ...prev.modals, delete: true },
    }));
  };

  const openPaymentDialog = (project: Project) => {
    setState((prev) => ({
      ...prev,
      selectedProject: project,
      modals: { ...prev.modals, payment: true },
      paymentAmount: "",
    }));
  };

  const closeModals = () => {
    setState((prev) => ({
      ...prev,
      modals: { delete: false, payment: false },
      selectedProject: null,
      paymentAmount: "",
    }));
  };

  const handlePaymentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // Permitir solo números y comas
    const cleaned = value.replace(/[^\d,]/g, "");
    // Guardar el valor sin comas para los cálculos
    const numericValue = parseNumber(cleaned);
    setState((prev) => ({ ...prev, paymentAmount: String(numericValue) }));
  };
  if (isLoading) {
    return (
      <LoadingOverlay loading={true}>Cargando proyectos...</LoadingOverlay>
    );
  }
  // Calcular todos los valores para cada proyecto
  const projectCalculations = projects.reduce((acc, project) => {
    acc[project.id] = calculateValues(project);
    return acc;
  }, {} as Record<string, ProjectCalculations>);

  // Configurar columnas y acciones para DataTable
  const tableColumns = createTableColumns(
    projectCalculations,
    colorEstadoCuenta
  );
  const rowActions = createRowActions(
    navigate,
    openPaymentDialog,
    openDeleteDialog,
    projectCalculations
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, width: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: "1rem",
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
          >
            Gestión de Proyectos
          </Typography>
          <Button
            component={Link}
            to="/crear-proyecto"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, minWidth: "fit-content" }}
          >
            Nuevo Proyecto
          </Button>
        </Box>{" "}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error al cargar proyectos: {error.message}
          </Alert>
        )}
        {/* Filtros */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Buscar proyecto"
                variant="outlined"
                size="small"
                value={localInputs.search}
                onChange={(e) =>
                  handleTextInputChange("search", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="Solicitante"
                variant="outlined"
                size="small"
                value={localInputs.solicitante}
                onChange={(e) =>
                  handleTextInputChange("solicitante", e.target.value)
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Estado"
                variant="outlined"
                size="small"
                value={filters.status || ""}
                onChange={(e) =>
                  updateFilter("status", e.target.value || undefined)
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  state.showAdvancedFilters ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )
                }
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    showAdvancedFilters: !prev.showAdvancedFilters,
                  }))
                }
              >
                Más Filtros
              </Button>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems="center"
              >
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                  sx={{ whiteSpace: "nowrap", minWidth: "fit-content" }}
                >
                  Limpiar
                </Button>{" "}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  {paginationData.totalItems} resultado(s)
                </Typography>
              </Stack>
            </Grid2>
          </Grid2>
          {/* Filtros avanzados */}
          <Collapse in={state.showAdvancedFilters}>
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Nombre del Proyecto"
                    variant="outlined"
                    size="small"
                    value={localInputs.nombreProyecto}
                    onChange={(e) =>
                      handleTextInputChange("nombreProyecto", e.target.value)
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Obrero"
                    variant="outlined"
                    size="small"
                    value={localInputs.obrero}
                    onChange={(e) =>
                      handleTextInputChange("obrero", e.target.value)
                    }
                  />
                </Grid2>
                {DATE_FILTER_FIELDS.map((field) => (
                  <Grid2 key={field.key} size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label={field.label}
                      type="date"
                      variant="outlined"
                      size="small"
                      value={filters[field.key] || ""}
                      onChange={(e) => updateFilter(field.key, e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid2>
                ))}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    label="Método de Pago"
                    variant="outlined"
                    size="small"
                    value={filters.metodoDePago || ""}
                    onChange={(e) =>
                      updateFilter("metodoDePago", e.target.value || undefined)
                    }
                  >
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid2>
              </Grid2>
            </Box>
          </Collapse>
        </Paper>
        {/* Tabla */}{" "}
        <DataTable
          data={projects}
          columns={tableColumns as ColumnConfig[]}
          keyField="id"
          rowActions={rowActions as RowAction[]}
          loading={isLoading}
          emptyMessage="No se encontraron proyectos"
        />{" "}
        {/* Paginación */}
        {!isEmpty && (
          <DataTablePagination
            paginationData={paginationData}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Proyectos por página:"
            showFirstLastButtons={true}
            showRowsPerPage={true}
          />
        )}
      </Paper>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={state.modals.delete} onClose={closeModals}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el proyecto &quot;
            <strong>{state.selectedProject?.nombreProyecto}</strong>&quot;? Esta
            acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModals} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Registro de Pago */}
      <Dialog
        open={state.modals.payment}
        onClose={closeModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Proyecto: <strong>{state.selectedProject?.nombreProyecto}</strong>
            <br />
            Costo Total:
            <strong>
              ${formatNumber(state.selectedProject?.costoServicio || 0)}
            </strong>
            <br />
            Abonado:
            <strong>${formatNumber(state.selectedProject?.abono || 0)}</strong>
            <br /> Saldo:
            <strong>
              $
              {formatNumber(
                Number(state.selectedProject?.costoServicio ?? 0) -
                  Number(state.selectedProject?.abono ?? 0)
              )}
            </strong>
          </DialogContentText>

          <TextField
            fullWidth
            label="Monto del Pago"
            value={formatNumber(state.paymentAmount)}
            onChange={handlePaymentAmountChange}
            variant="outlined"
            placeholder="0"
            sx={{ mt: 2 }}
            autoFocus
            helperText="Ingrese el monto del pago"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModals} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            color="primary"
            variant="contained"
            disabled={!state.paymentAmount || Number(state.paymentAmount) <= 0}
          >
            Registrar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablaGastosProject;
