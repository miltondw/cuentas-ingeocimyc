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
// Importar el tipo ProjectFinance para tipar correctamente si se usa directamente
import type { ProjectFinance } from "@/types/typesProject/projectTypes";
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

// Función auxiliar para formatear valores monetarios
const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  return `$${formatNumber(numValue)}`;
};

// Configuración de columnas para DataTable
const createTableColumns = (
  calculations: Record<string, ProjectCalculations>
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
      <Box
        sx={{
          maxHeight: 100, // 3 líneas aprox
          width: 200,
          overflow: "auto",
          whiteSpace: "pre-line",
          wordBreak: "break-word",
          pr: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: "medium", lineHeight: 1.3 }}
        >
          {value as string}
        </Typography>
      </Box>
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
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: "#2d3748",
            background: "linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)",
            px: 2,
            py: 1,
            borderRadius: 2,
            border: "1px solid #81e6d9",
          }}
        >
          {formatCurrency(value as string)}
        </Typography>
      </Box>
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
      return (
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "600",
              color: "#2d3748",
              background: "linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%)",
              px: 2,
              py: 1,
              borderRadius: 2,
              border: "1px solid #f6ad55",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            💰 {formatCurrency(calc?.totalGastos || 0)}
          </Typography>
        </Box>
      );
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
      const isPositive = utilidad >= 0;

      return (
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              color: "white",
              background: isPositive
                ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                : "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
              px: 2,
              py: 1,
              borderRadius: 2,
              border: `1px solid ${isPositive ? "#68d391" : "#fc8181"}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span>{isPositive ? "📈" : "📉"}</span>
            {formatCurrency(utilidad)}
          </Typography>
        </Box>
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
      const saldo = calc?.saldo || 0;

      return (
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: "600",
              color: saldo > 0 ? "#c53030" : "#38a169",
              background:
                saldo > 0
                  ? "linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)"
                  : "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
              px: 2,
              py: 1,
              borderRadius: 2,
              border: saldo > 0 ? "1px solid #fc8181" : "1px solid #68d391",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span>{saldo > 0 ? "⏰" : "✅"}</span>
            {formatCurrency(saldo)}
          </Typography>
        </Box>
      );
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

      const getEstadoConfig = (estado: string) => {
        switch (estado) {
          case "Pagado":
            return {
              bg: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              icon: "✅",
            };
          case "Abonado":
            return {
              bg: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
              icon: "⏳",
            };
          case "Pendiente":
          default:
            return {
              bg: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
              icon: "❌",
            };
        }
      };

      const config = getEstadoConfig(estado);

      return (
        <Box
          sx={{
            background: config.bg,
            color: "white",
            px: 2,
            py: 1,
            borderRadius: 2,
            textAlign: "center",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <span>{config.icon}</span>
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

  // Acceder correctamente a la estructura anidada
  const paginated = response.data.data;

  // Procesar los datos para aplanar los campos de finanzas[0] al nivel del proyecto
  const processedData =
    paginated.data?.map((p: Project) => {
      // Si la API retorna 'finanzas', aplanar el primer objeto de ese array
      const fin = (
        p.finanzas && p.finanzas.length > 0 ? p.finanzas[0] : null
      ) as ProjectFinance | null;
      return {
        ...p,
        costoServicio: fin ? fin.costoServicio : "",
        abono: fin ? fin.abono : "",
        factura: fin ? fin.factura : "",
        valorRetencion: fin ? fin.valorRetencion : "",
        obrero: fin ? fin.obrero : "",
        metodoDePago: fin ? fin.metodoDePago : "",
        estado: fin ? fin.estado : "",
        valor_re:
          fin && fin.valorRetencion && fin.costoServicio
            ? (Number(fin.valorRetencion) / 100) * Number(fin.costoServicio)
            : 0,
        valor_iva:
          fin && fin.costoServicio ? 0.19 * Number(fin.costoServicio) : 0,
      };
    }) || [];

  return {
    data: processedData,
    total: paginated.total || 0,
    page: paginated.page || filters.page || 1,
    limit: paginated.limit || filters.limit || 10,
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

    // Validar que no exceda el saldo pendiente
    const maxPayment =
      Number(state.selectedProject?.costoServicio ?? 0) -
      Number(state.selectedProject?.abono ?? 0);

    if (numericValue > maxPayment) {
      showNotification({
        severity: "warning",
        message: `El monto no puede exceder el saldo pendiente de $${formatNumber(
          maxPayment
        )}`,
        duration: 3000,
      });
      setState((prev) => ({ ...prev, paymentAmount: String(maxPayment) }));
    } else {
      setState((prev) => ({ ...prev, paymentAmount: String(numericValue) }));
    }
  };

  const handleFullPayment = () => {
    const saldoPendiente =
      Number(state.selectedProject?.costoServicio ?? 0) -
      Number(state.selectedProject?.abono ?? 0);
    setState((prev) => ({ ...prev, paymentAmount: String(saldoPendiente) }));
  };
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <LoadingOverlay loading={true}>
            <Typography variant="h6" sx={{ color: "#4c51bf", fontWeight: 600 }}>
              🔄 Cargando proyectos...
            </Typography>
          </LoadingOverlay>
        </Paper>
      </Box>
    );
  }
  // Calcular todos los valores para cada proyecto
  const projectCalculations = projects.reduce((acc, project) => {
    acc[project.id] = calculateValues(project);
    return acc;
  }, {} as Record<string, ProjectCalculations>);

  // Configurar columnas y acciones para DataTable
  const tableColumns = createTableColumns(projectCalculations);
  const rowActions = createRowActions(
    navigate,
    openPaymentDialog,
    openDeleteDialog,
    projectCalculations
  );

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        width: "90%",
        margin: "0 auto",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 3 },
          width: "100%",
          overflow: "hidden",
          borderRadius: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Header mejorado */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
            background: "linear-gradient(135deg, #667eea 0%, #008380 100%)",
            color: "white",
            p: 3,
            borderRadius: 2,
            mx: -3,
            mt: -3,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="700"
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem" },
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              💼 Gestión de Proyectos
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/crear-proyecto"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 3,
              minWidth: "fit-content",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              fontSize: "0.95rem",
              textTransform: "none",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.3)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Nuevo Proyecto
          </Button>
        </Box>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
            variant="filled"
          >
            Error al cargar proyectos: {error.message}
          </Alert>
        )}

        {/* Filtros mejorados */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)",
            border: "1px solid #e3e8ff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "#4c51bf",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            🔍 Filtros de Búsqueda
          </Typography>

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
                    <SearchIcon sx={{ mr: 1, color: "primary.main" }} />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                    },
                  },
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                    },
                  },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.8)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                    },
                  },
                }}
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
                sx={{
                  borderRadius: 2,
                  borderColor: "#e3e8ff",
                  color: "#4c51bf",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#4c51bf",
                    background: "rgba(76, 81, 191, 0.04)",
                  },
                }}
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
                  sx={{
                    whiteSpace: "nowrap",
                    minWidth: "fit-content",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    borderColor: "#f56565",
                    color: "#f56565",
                    "&:hover": {
                      borderColor: "#e53e3e",
                      background: "rgba(245, 101, 101, 0.04)",
                    },
                  }}
                >
                  Limpiar
                </Button>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  📊 {paginationData.totalItems} resultado(s)
                </Box>
              </Stack>
            </Grid2>
          </Grid2>
          {/* Filtros avanzados mejorados */}
          <Collapse in={state.showAdvancedFilters}>
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: "2px dashed #e3e8ff",
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  color: "#4c51bf",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                ⚙️ Filtros Avanzados
              </Typography>
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                        },
                      },
                    }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                        },
                      },
                    }}
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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          background: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 1)",
                          },
                          "&.Mui-focused": {
                            background: "rgba(255, 255, 255, 1)",
                            boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                          },
                        },
                      }}
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.8)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                        },
                      },
                    }}
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
        {/* Tabla con wrapper mejorado */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 3,
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            "& .MuiDataGrid-root": {
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.95rem",
              },
              "& .MuiDataGrid-row": {
                transition: "all 0.2s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              },
            },
          }}
        >
          {isEmpty && !isLoading ? (
            <Box
              sx={{
                p: 6,
                textAlign: "center",
                background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: "4rem",
                  mb: 2,
                  opacity: 0.6,
                }}
              >
                📋
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  color: "#4c51bf",
                  fontWeight: 600,
                }}
              >
                No se encontraron proyectos
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#718096",
                  mb: 3,
                  maxWidth: 400,
                  mx: "auto",
                }}
              >
                No hay proyectos que coincidan con los filtros aplicados.
                Intenta ajustar los criterios de búsqueda o crear un nuevo
                proyecto.
              </Typography>
              <Button
                component={Link}
                to="/crear-proyecto"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Crear Primer Proyecto
              </Button>
            </Box>
          ) : (
            <DataTable
              data={projects}
              columns={tableColumns as ColumnConfig[]}
              keyField="id"
              rowActions={rowActions as RowAction[]}
              loading={isLoading}
              emptyMessage="No se encontraron proyectos"
            />
          )}
        </Paper>
        {/* Paginación mejorada */}
        {!isEmpty && (
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: 2,
              p: 2,
              border: "1px solid #e3e8ff",
            }}
          >
            <DataTablePagination
              paginationData={paginationData}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Proyectos por página:"
              showFirstLastButtons={true}
              showRowsPerPage={true}
            />
          </Box>
        )}
      </Paper>

      {/* Modal de Confirmación de Eliminación mejorado */}
      <Dialog
        open={state.modals.delete}
        onClose={closeModals}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.2rem",
          }}
        >
          ⚠️ Confirmar Eliminación
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <DialogContentText sx={{ fontSize: "1rem", color: "#4a5568" }}>
            ¿Está seguro de que desea eliminar el proyecto{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#2d3748" }}>
              &quot;{state.selectedProject?.nombreProyecto}&quot;
            </Box>
            ? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={closeModals}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 25px rgba(229, 62, 62, 0.3)",
              },
            }}
          >
            🗑️ Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Registro de Pago mejorado */}
      <Dialog
        open={state.modals.payment}
        onClose={closeModals}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.2rem",
          }}
        >
          💰 Registrar Pago
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <DialogContentText sx={{ mb: 3, fontSize: "1rem" }}>
            <Box
              sx={{
                background: "rgba(72, 187, 120, 0.1)",
                borderRadius: 2,
                p: 2,
                border: "1px solid rgba(72, 187, 120, 0.2)",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, color: "#2d3748" }}
              >
                📋 {state.selectedProject?.nombreProyecto}
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Costo Total:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#2d3748" }}
                  >
                    ${formatNumber(state.selectedProject?.costoServicio || 0)}
                  </Typography>
                </Grid2>
                <Grid2 size={6}>
                  <Typography variant="body2" color="text.secondary">
                    Abonado:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#48bb78" }}
                  >
                    ${formatNumber(state.selectedProject?.abono || 0)}
                  </Typography>
                </Grid2>
              </Grid2>
              <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #e2e8f0" }}>
                <Typography variant="body2" color="text.secondary">
                  Saldo Pendiente:
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#e53e3e" }}
                >
                  $
                  {formatNumber(
                    Number(state.selectedProject?.costoServicio ?? 0) -
                      Number(state.selectedProject?.abono ?? 0)
                  )}
                </Typography>
              </Box>
            </Box>
          </DialogContentText>

          <TextField
            fullWidth
            label="💵 Monto del Pago"
            value={formatNumber(state.paymentAmount)}
            onChange={handlePaymentAmountChange}
            variant="outlined"
            placeholder="0"
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.8)",
                fontSize: "1.1rem",
                "&:hover": {
                  background: "rgba(255, 255, 255, 1)",
                },
                "&.Mui-focused": {
                  background: "rgba(255, 255, 255, 1)",
                  boxShadow: "0 0 0 3px rgba(72, 187, 120, 0.1)",
                },
              },
              "& .MuiInputLabel-root": {
                fontWeight: 500,
              },
            }}
            autoFocus
            helperText="💡 Ingrese el monto del pago que desea registrar"
          />

          {/* Botón de pago completo */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              onClick={handleFullPayment}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                borderColor: "#4c51bf",
                color: "#4c51bf",
                "&:hover": {
                  borderColor: "#3c366b",
                  background: "rgba(76, 81, 191, 0.04)",
                },
              }}
            >
              🎯 Pagar Saldo Completo
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={closeModals}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={!state.paymentAmount || Number(state.paymentAmount) <= 0}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #38a169 0%, #2f855a 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 25px rgba(72, 187, 120, 0.3)",
              },
              "&:disabled": {
                background: "#cbd5e0",
                color: "#a0aec0",
              },
            }}
          >
            💰 Registrar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablaGastosProject;
