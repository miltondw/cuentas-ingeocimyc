import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  Alert,
  TableSortLabel,
  Tooltip,
  MenuItem,
  Grid2,
  Box,
  Stack,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
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
  Project,
  ProjectFilters,
  DEFAULT_PROJECT_FILTERS,
} from "@/types/projects";
import { formatNumber, parseNumber } from "@/utils/formatNumber";
import { useQueryClient } from "@tanstack/react-query";
import { useUrlFilters } from "@/hooks/useUrlFilters";
// Types
interface TableColumn {
  id: string;
  label: string;
  sortable: boolean;
  filterType?: "text" | "date" | "select";
  width: number;
}

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
  allProjects: Project[];
  loading: boolean;
  error: string | null;
  modals: {
    delete: boolean;
    payment: boolean;
  };
  selectedProject: Project | null;
  paymentAmount: string;
  expandedRows: Set<number>; // Para controlar qué filas están expandidas
  showAdvancedFilters: boolean; // Para controlar filtros avanzados
  totalProjects: number; // Total de proyectos para paginación
}

// Constants
const tableRowInputs: TableColumn[] = [
  { id: "acciones", label: "Acciones", sortable: false, width: 150 },
  {
    id: "fecha",
    label: "Fecha",
    sortable: true,
    filterType: "date",
    width: 120,
  },
  {
    id: "solicitante",
    label: "Solicitante",
    sortable: true,
    filterType: "text",
    width: 150,
  },
  {
    id: "nombreProyecto",
    label: "Proyecto",
    sortable: true,
    filterType: "text",
    width: 200,
  },
  {
    id: "factura",
    label: "N° Factura",
    sortable: true,
    filterType: "text",
    width: 120,
  },
  {
    id: "valorRetencion",
    label: "% De Retención",
    sortable: true,
    filterType: "text",
    width: 120,
  },
  {
    id: "valor_iva",
    label: "Valor de Iva",
    sortable: true,
    filterType: "text",
    width: 120,
  },
  {
    id: "valor_re",
    label: "Valor de Retención",
    sortable: true,
    filterType: "text",
    width: 120,
  },
  {
    id: "obrero",
    label: "Obrero",
    sortable: true,
    filterType: "text",
    width: 150,
  },
  {
    id: "metodoDePago",
    label: "Método de Pago",
    sortable: true,
    filterType: "text",
    width: 150,
  },
  { id: "costoServicio", label: "Costo Servicio", sortable: true, width: 150 },
  { id: "abono", label: "Abonado", sortable: true, width: 120 },
  { id: "total_gastos", label: "Total Gastos", sortable: true, width: 150 },
  { id: "utilidad_neta", label: "Utilidad Neta", sortable: true, width: 150 },
  { id: "saldo", label: "Saldo", sortable: true, width: 120 },
  {
    id: "estado_cuenta",
    label: "Estado",
    sortable: true,
    filterType: "select",
    width: 120,
  },
  {
    id: "gastos",
    label: "Gastos",
    sortable: false,
    width: 120,
  },
];

// Utility functions

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

const TablaGastosProject: React.FC = () => {
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
    allProjects: [],
    loading: false,
    error: null,
    modals: { delete: false, payment: false },
    selectedProject: null,
    paymentAmount: "",
    expandedRows: new Set<number>(),
    showAdvancedFilters: false,
    totalProjects: 0,
  });

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
  ); // Funciones de manejo
  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      updateFilter("page", newPage + 1); // MUI usa 0-indexed, nosotros 1-indexed
    },
    [updateFilter]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateFilters({
        limit: parseInt(event.target.value, 10),
        page: 1,
      });
    },
    [updateFilters]
  );

  const handleSort = useCallback(
    (field: string) => {
      const isCurrentField = filters.sortBy === field;
      const newOrder =
        isCurrentField && filters.sortOrder === "DESC" ? "ASC" : "DESC";
      updateFilters({
        sortBy: field as ProjectFilters["sortBy"],
        sortOrder: newOrder,
        page: 1,
      });
    },
    [filters.sortBy, filters.sortOrder, updateFilters]
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

  useEffect(() => {
    const buildQueryParams = () => {
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

      return params;
    };
    const fetchProjects = async (retryCount = 0) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = buildQueryParams();
        const response = await api.get("/projects", { params });

        const proyectos =
          response.data.data?.map((p: Project) => ({
            ...p,
            valor_re: p.valorRetencion
              ? (Number(p.valorRetencion) / 100) * Number(p.costoServicio)
              : 0,
            valor_iva: Number(p.costoServicio)
              ? 0.19 * Number(p.costoServicio)
              : 0,
          })) || [];

        setState((prev) => ({
          ...prev,
          allProjects: proyectos,
          totalProjects: response.data.total || 0,
          loading: false,
        }));

        if (proyectos.length === 0) {
          showNotification({
            severity: "info",

            message: "No se encontraron proyectos con los filtros aplicados",
            duration: 3000,
          });
        }
      } catch (error) {
        // Retry automático para errores de red
        const axiosError = error as {
          code?: string;
          response?: { status: number };
          message?: string;
        };
        if (
          retryCount < 2 &&
          (axiosError?.code === "NETWORK_ERROR" ||
            (axiosError?.response?.status &&
              axiosError.response.status >= 500) ||
            axiosError?.message?.includes("fetch"))
        ) {
          console.warn(
            `Reintentando carga de proyectos (${retryCount + 1}/3)...`
          );
          setTimeout(
            () => fetchProjects(retryCount + 1),
            1000 * (retryCount + 1)
          );
          return;
        }

        const errorMessage = `Error al cargar proyectos: ${
          (error as Error).message
        }`;
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        showError(errorMessage);
      }
    };

    if (!filtersLoading) {
      fetchProjects();
    }
  }, [filters, filtersLoading, showNotification, showError]);
  const handlePayment = async () => {
    const { selectedProject, paymentAmount } = state;
    if (!selectedProject || !paymentAmount) {
      showError("Proyecto o monto de pago no válido");
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));

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

      // Invalidar las queries de proyectos para refrescar automáticamente
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setState((prev) => ({
        ...prev,
        allProjects: prev.allProjects.map((project) => {
          if (project.id === selectedProject.id) {
            return {
              ...project,
              abono: String(Number(project.abono) + Number(montoNumerico)),
            };
          }
          return project;
        }),
        modals: { ...prev.modals, payment: false },
        selectedProject: null,
        paymentAmount: "",
        loading: false,
      }));
    } catch (error) {
      const errorMessage = `Error al procesar el pago: ${
        (error as Error).message
      }`;
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      showError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!state.selectedProject) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      await api.delete(`/projects/${state.selectedProject.id}`);

      showNotification({
        severity: "success",
        message: `El proyecto "${state.selectedProject.nombreProyecto}" ha sido eliminado correctamente`,
        duration: 3000,
      });
      setState((prev) => ({
        ...prev,
        allProjects: prev.allProjects.filter(
          (project) => project.id !== (state.selectedProject?.id || "")
        ),
        modals: { ...prev.modals, delete: false },
        selectedProject: null,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = `Error al eliminar proyecto: ${
        (error as Error).message
      }`;
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
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

  // Función para alternar la expansión de una fila
  const toggleRowExpansion = (projectId: number) => {
    setState((prev) => {
      const newExpandedRows = new Set(prev.expandedRows);
      if (newExpandedRows.has(projectId)) {
        newExpandedRows.delete(projectId);
      } else {
        newExpandedRows.add(projectId);
      }
      return {
        ...prev,
        expandedRows: newExpandedRows,
      };
    });
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

  if (state.loading) {
    return (
      <LoadingOverlay loading={true}>Cargando proyectos...</LoadingOverlay>
    );
  }

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
        </Box>
        {state.error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setState((prev) => ({ ...prev, error: null }))}
          >
            {state.error}
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
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="suspendido">Suspendido</MenuItem>
                <MenuItem value="cancelado">Cancelado</MenuItem>
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
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  {state.totalProjects} resultado(s)
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
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Fecha desde"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={filters.startDate || ""}
                    onChange={(e) => updateFilter("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Fecha hasta"
                    type="date"
                    variant="outlined"
                    size="small"
                    value={filters.endDate || ""}
                    onChange={(e) => updateFilter("endDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid2>
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
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="efectivo">Efectivo</MenuItem>
                    <MenuItem value="transferencia">Transferencia</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="credito">Crédito</MenuItem>
                  </TextField>
                </Grid2>
              </Grid2>
            </Box>
          </Collapse>
        </Paper>
        {/* Tabla */}
        <TableContainer
          sx={{
            maxHeight: 600,
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            // Mejorar responsive
            overflowX: "auto",
            "& .MuiTable-root": {
              minWidth: { xs: 800, md: 1200 },
            },
          }}
        >
          <Table stickyHeader sx={{ minWidth: { xs: 800, md: 1200 } }}>
            <TableHead>
              <TableRow>
                {tableRowInputs.map(({ id, label, sortable, width }) => (
                  <TableCell
                    key={id}
                    sx={{
                      width,
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {sortable ? (
                      <TableSortLabel
                        active={filters.sortBy === id}
                        direction={
                          filters.sortBy === id
                            ? filters.sortOrder === "ASC"
                              ? "asc"
                              : "desc"
                            : "desc"
                        }
                        onClick={() => handleSort(id)}
                      >
                        {label}
                      </TableSortLabel>
                    ) : (
                      label
                    )}
                  </TableCell>
                ))}{" "}
              </TableRow>
            </TableHead>
            <TableBody>
              {state.allProjects.map((project) => {
                const calculations = calculateValues(project);
                const isExpanded = state.expandedRows.has(project.id); // Verificar si la fila está expandida
                return (
                  <React.Fragment key={project.id}>
                    <TableRow
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                        "&:hover": { backgroundColor: "#f0f0f0" },
                      }}
                    >
                      {/* Columna de Acciones */}
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {" "}
                          <Tooltip title="Editar proyecto">
                            <span>
                              <IconButton
                                component={Link}
                                to={`/crear-proyecto/${project.id}`}
                                size="small"
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Registrar pago">
                            <span>
                              <IconButton
                                onClick={() => openPaymentDialog(project)}
                                size="small"
                                color="success"
                                disabled={
                                  calculations.estadoCuenta === "Pagado"
                                }
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>{" "}
                          <Tooltip title="Eliminar proyecto">
                            <span>
                              <IconButton
                                onClick={() => openDeleteDialog(project)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      {/* Datos del proyecto */}
                      <TableCell>{formatDate(project.fecha)}</TableCell>
                      <TableCell>{project.solicitante}</TableCell>
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {project.nombreProyecto}
                      </TableCell>
                      <TableCell>{project.factura || "N/A"}</TableCell>
                      <TableCell>{project.valorRetencion}%</TableCell>
                      <TableCell>${formatNumber(project.valor_iva)}</TableCell>
                      <TableCell>${formatNumber(project.valor_re)}</TableCell>
                      <TableCell>{project.obrero}</TableCell>
                      <TableCell>{project.metodoDePago}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        ${formatNumber(project.costoServicio)}
                      </TableCell>
                      <TableCell>${formatNumber(project.abono)}</TableCell>
                      <TableCell>
                        ${formatNumber(calculations.totalGastos)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color:
                            calculations.utilidadNeta >= 0 ? "green" : "red",
                        }}
                      >
                        ${formatNumber(calculations.utilidadNeta)}
                      </TableCell>
                      <TableCell>${formatNumber(calculations.saldo)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: colorEstadoCuenta(
                              calculations.estadoCuenta
                            ),
                            color: "white",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            textAlign: "center",
                            fontSize: "0.875rem",
                            fontWeight: "medium",
                          }}
                        >
                          {calculations.estadoCuenta}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {" "}
                        <Tooltip
                          title={isExpanded ? "Ocultar gastos" : "Ver gastos"}
                        >
                          <span>
                            <IconButton
                              onClick={() => toggleRowExpansion(project.id)}
                              size="small"
                              color="primary"
                            >
                              {isExpanded ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>{" "}
                      {/* Columnas dinámicas para campos extra */}
                    </TableRow>
                    {/* Fila expandida con detalles de gastos */}
                    {isExpanded && (
                      <TableRow>
                        {/* Celdas vacías para las primeras columnas */}
                        <TableCell /> {/* Acciones */}
                        <TableCell /> {/* Fecha */}
                        <TableCell /> {/* Solicitante */}
                        <TableCell /> {/* Nombre Proyecto */}
                        <TableCell /> {/* Factura */}
                        <TableCell /> {/* Valor Retención */}
                        <TableCell /> {/* Valor IVA */}
                        <TableCell /> {/* Valor RE */}
                        {/* Celda con el contenido de gastos que ocupa las últimas columnas */}
                        <TableCell colSpan={8} sx={{ p: 0 }}>
                          <Box sx={{ p: 2, backgroundColor: "#f9f9f9", ml: 2 }}>
                            <Typography
                              variant="subtitle2"
                              gutterBottom
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              📊 Detalles de Gastos
                            </Typography>
                            <Table
                              size="small"
                              sx={{ backgroundColor: "white", borderRadius: 1 }}
                            >
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      backgroundColor: "#e3f2fd",
                                    }}
                                  >
                                    Descripción
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      fontWeight: "bold",
                                      backgroundColor: "#e3f2fd",
                                    }}
                                  >
                                    Valor
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {Object.entries(getGastos(project)).map(
                                  ([description, value]) =>
                                    value > 0 && (
                                      <TableRow key={description} hover>
                                        <TableCell
                                          sx={{
                                            borderBottom: "1px solid #eee",
                                          }}
                                        >
                                          {description}
                                        </TableCell>
                                        <TableCell
                                          align="right"
                                          sx={{
                                            borderBottom: "1px solid #eee",
                                            fontWeight: "medium",
                                          }}
                                        >
                                          ${formatNumber(value)}
                                        </TableCell>
                                      </TableRow>
                                    )
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>{" "}
        </TableContainer>
        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={state.totalProjects}
          rowsPerPage={filters.limit || 10}
          page={(filters.page || 1) - 1} // Convertir de 1-indexed a 0-indexed para MUI
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
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
