import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Pagination,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Grid2,
  MenuItem,
  Skeleton,
  Chip,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import api from "@/api";
import { useNotifications } from "@/hooks/useNotifications";
import { formatNumber } from "@/utils/formatNumber";

// Types actualizados para la nueva estructura de la API
interface GastoItem {
  name: string;
  value: number;
}

interface GastoMes {
  id: number;
  mes: string;
  salarios: string;
  luz: string;
  agua: string;
  arriendo: string;
  internet: string;
  salud: string;
  otrosCampos?: { [key: string]: number } | null;
}

interface ApiResponse {
  data: GastoMes[];
  total: number;
  page: number;
  limit: number;
}

interface TransformedGasto {
  id: string;
  mesDeGasto: string;
  expenses: GastoItem[];
  originalDate: string;
  totalGastos: number;
}

interface AppState {
  expenses: GastoMes[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  totalItems: number;
  deleteDialog: {
    open: boolean;
    selectedId: string | null;
  };
  // Nuevos filtros
  filters: {
    year: string;
    month: string;
    minAmount: string;
    maxAmount: string;
    hasCategory: boolean | null;
    categoryName: string;
    sortBy: string;
    sortOrder: "ASC" | "DESC";
  };
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

// Campos fijos de gastos mensuales
const fixedExpenseFields = [
  { key: "salarios", label: "SALARIOS" },
  { key: "luz", label: "LUZ" },
  { key: "agua", label: "AGUA" },
  { key: "arriendo", label: "ARRIENDO" },
  { key: "internet", label: "INTERNET" },
  { key: "salud", label: "SALUD" },
];

const transformData = (data: GastoMes[]): TransformedGasto[] => {
  return data.map((item) => {
    const formattedMonth = formatDate(item.mes);

    const expenses: GastoItem[] = [];

    // Agregar campos fijos
    fixedExpenseFields.forEach((field) => {
      const value =
        parseFloat(item[field.key as keyof GastoMes] as string) || 0;
      if (value > 0) {
        expenses.push({
          name: field.label,
          value: value,
        });
      }
    }); // Agregar campos de otrosCampos si existen
    if (item.otrosCampos && typeof item.otrosCampos === "object") {
      Object.entries(item.otrosCampos).forEach(([nombre, monto]) => {
        expenses.push({
          name: nombre.replace(/_/g, " ").toUpperCase(),
          value: parseFloat(String(monto)) || 0,
        });
      });
    }

    const totalGastos = expenses.reduce(
      (total, gasto) => total + gasto.value,
      0
    );

    return {
      id: item.id.toString(),
      mesDeGasto: `Gastos de ${formattedMonth}`,
      expenses,
      originalDate: item.mes,
      totalGastos,
    };
  });
};

const TablaGastosEmpresa: React.FC = () => {
  const { showNotification, showError } = useNotifications();
  const [state, setState] = useState<AppState>({
    expenses: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    loading: false,
    error: null,
    deleteDialog: {
      open: false,
      selectedId: null,
    },
    filters: {
      year: "",
      month: "",
      minAmount: "",
      maxAmount: "",
      hasCategory: null,
      categoryName: "",
      sortBy: "mes",
      sortOrder: "DESC",
    },
  });

  const rowsPerPage = 10;
  const fetchGastos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const params: Record<string, string | number | boolean> = {
        page: state.currentPage,
        limit: rowsPerPage,
      };

      // Agregar filtros solo si tienen valores
      if (state.filters.year) params.year = state.filters.year;
      if (state.filters.month) params.month = state.filters.month;
      if (state.filters.minAmount)
        params.minAmount = parseFloat(state.filters.minAmount);
      if (state.filters.maxAmount)
        params.maxAmount = parseFloat(state.filters.maxAmount);
      if (state.filters.hasCategory !== null)
        params.hasCategory = state.filters.hasCategory;
      if (state.filters.categoryName)
        params.categoryName = state.filters.categoryName;
      if (state.filters.sortBy) params.sortBy = state.filters.sortBy;
      if (state.filters.sortOrder) params.sortOrder = state.filters.sortOrder;

      const response = await api.get("/gastos-mes/expenses", { params });

      // Ajuste: acceder a la data anidada
      const apiData: ApiResponse = response.data.data;

      setState((prev) => ({
        ...prev,
        expenses: apiData.data || [],
        totalPages: Math.ceil(apiData.total / rowsPerPage),
        totalItems: apiData.total,
        loading: false,
      }));

      if (apiData.data?.length === 0) {
        showNotification({
          severity: "info",
          message: "No se encontraron gastos para los filtros seleccionados",
          duration: 3000,
        });
      }
    } catch (error) {
      const errorMessage = `Error al cargar gastos: ${
        (error as Error).message
      }`;
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      showError(errorMessage);
    }
  }, [state.currentPage, state.filters, showNotification, showError]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };
  const handleFilterChange = (
    filterName: keyof typeof state.filters,
    value: string | boolean | null
  ) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterName]: value,
      },
      currentPage: 1, // Reset to first page when filtering
    }));
  };

  const clearAllFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: {
        year: "",
        month: "",
        minAmount: "",
        maxAmount: "",
        hasCategory: null,
        categoryName: "",
        sortBy: "mes",
        sortOrder: "DESC",
      },
      currentPage: 1,
    }));
    showNotification({
      severity: "info",
      message: "Todos los filtros han sido eliminados",
      duration: 2000,
    });
  };

  const handleDelete = async () => {
    const { selectedId } = state.deleteDialog;
    if (!selectedId) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      await api.delete(`/gastos-mes/expenses/${selectedId}`);

      showNotification({
        severity: "success",
        message: "El registro de gastos ha sido eliminado correctamente",
        duration: 3000,
      });

      await fetchGastos();
      closeDeleteDialog();
    } catch (error) {
      const errorMessage = `Error al eliminar gasto: ${
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

  const openDeleteDialog = (id: string) => {
    setState((prev) => ({
      ...prev,
      deleteDialog: {
        open: true,
        selectedId: id,
      },
    }));
  };

  const closeDeleteDialog = () => {
    setState((prev) => ({
      ...prev,
      deleteDialog: {
        open: false,
        selectedId: null,
      },
    }));
  };
  const gastosPorMes = useMemo(
    () => transformData(state.expenses),
    [state.expenses]
  );

  if (state.loading) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
          {/* Loading Header */}
          <Box sx={{ mb: 3 }}>
            <Skeleton
              variant="rectangular"
              height={80}
              sx={{
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%)",
              }}
            />
          </Box>

          {/* Loading Filters */}
          <Box sx={{ mb: 3 }}>
            <Skeleton
              variant="rectangular"
              height={120}
              sx={{
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, #f8f8f8 25%, transparent 37%, #f8f8f8 63%)",
              }}
            />
          </Box>

          {/* Loading Cards */}
          {[1, 2, 3].map((item) => (
            <Box key={item} sx={{ mb: 3 }}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, #f5f5f5 25%, transparent 37%, #f5f5f5 63%)",
                }}
              />
            </Box>
          ))}

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              🔄 Cargando gastos mensuales...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Por favor espera mientras obtenemos la información
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
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
            background: "linear-gradient(135deg, #34495e 0%, #2c3e50 100%)",
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
                color: "white",
              }}
            >
              🏢 Gastos de la Empresa por Mes
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/crear-gasto-mes"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 3,
              minWidth: "fit-content",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              fontSize: "0.95rem",
              textTransform: "none",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.25)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Nuevo Gasto Mensual
          </Button>
        </Box>
        {/* Error Alert mejorado */}
        {state.error && (
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
            onClose={() => setState((prev) => ({ ...prev, error: null }))}
          >
            {state.error}
          </Alert>
        )}

        {/* Filtros mejorados */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #718096 0%, #4a5568 100%)",
            border: "1px solid #a0aec0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "white",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            🔍 Filtros de Búsqueda
          </Typography>
          <Grid2 container spacing={2}>
            {/* Filtros de fecha */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="🗓️ Año"
                value={state.filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                placeholder="2025"
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(52, 73, 94, 0.2)",
                    },
                  },
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="📅 Mes"
                value={state.filters.month}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                placeholder="01-12"
                fullWidth
                variant="outlined"
                size="small"
                inputProps={{ min: "01", max: "12", pattern: "[0-9]{2}" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(52, 73, 94, 0.2)",
                    },
                  },
                }}
              />
            </Grid2>
            {/* Filtros de montos */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="💰 Monto Mínimo"
                value={state.filters.minAmount}
                onChange={(e) =>
                  handleFilterChange("minAmount", e.target.value)
                }
                placeholder="100000"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(245, 101, 101, 0.1)",
                    },
                  },
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="💸 Monto Máximo"
                value={state.filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange("maxAmount", e.target.value)
                }
                placeholder="5000000"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(245, 101, 101, 0.1)",
                    },
                  },
                }}
              />
            </Grid2>
            {/* Filtros de categoría */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="📂 Categorías Extras"
                value={
                  state.filters.hasCategory === null
                    ? ""
                    : state.filters.hasCategory.toString()
                }
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : e.target.value === "true";
                  handleFilterChange("hasCategory", value);
                }}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(245, 101, 101, 0.1)",
                    },
                  },
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Con categorías extras</MenuItem>
                <MenuItem value="false">Sin categorías extras</MenuItem>
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="🏷️ Nombre de Categoría"
                value={state.filters.categoryName}
                onChange={(e) =>
                  handleFilterChange("categoryName", e.target.value)
                }
                placeholder="COMPRA_DE_GATO"
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(245, 101, 101, 0.1)",
                    },
                  },
                }}
              />
            </Grid2>
            {/* Filtros de ordenamiento */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="📊 Ordenar por"
                value={state.filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(245, 101, 101, 0.1)",
                    },
                  },
                }}
              >
                <MenuItem value="mes">Mes</MenuItem>
                <MenuItem value="total">Total</MenuItem>
                <MenuItem value="salarios">Salarios</MenuItem>
                <MenuItem value="luz">Luz</MenuItem>
                <MenuItem value="agua">Agua</MenuItem>
                <MenuItem value="arriendo">Arriendo</MenuItem>
                <MenuItem value="internet">Internet</MenuItem>
                <MenuItem value="salud">Salud</MenuItem>
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="🔄 Orden"
                value={state.filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange(
                    "sortOrder",
                    e.target.value as "ASC" | "DESC"
                  )
                }
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 1)",
                    },
                    "&.Mui-focused": {
                      background: "rgba(255, 255, 255, 1)",
                      boxShadow: "0 0 0 3px rgba(245, 101, 101, 0.1)",
                    },
                  },
                }}
              >
                <MenuItem value="DESC">Descendente</MenuItem>
                <MenuItem value="ASC">Ascendente</MenuItem>
              </TextField>
            </Grid2>
            {/* Botón para limpiar filtros */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                onClick={clearAllFilters}
                variant="outlined"
                fullWidth
                sx={{
                  height: 40,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  borderColor: "#718096",
                  color: "white",
                  "&:hover": {
                    borderColor: "#2d3748",
                    background: "rgba(113, 128, 150, 0.1)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                🧹 Limpiar Filtros
              </Button>
            </Grid2>
            {/* Información de resultados */}
            <Grid2 size={{ xs: 12 }}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)",
                  color: "white",
                  px: 3,
                  py: 2,
                  borderRadius: 2,
                  mt: 2,
                  textAlign: "center",
                  fontWeight: 500,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                📊 {state.totalItems} resultado
                {state.totalItems !== 1 ? "s" : ""} encontrado
                {state.totalItems !== 1 ? "s" : ""} - Página {state.currentPage}{" "}
                de {state.totalPages}
              </Box>
            </Grid2>
          </Grid2>
        </Paper>

        {/* Resumen estadístico */}
        {gastosPorMes.length > 0 && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)",
              color: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              📊 Análisis Financiero
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {gastosPorMes.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Registros Mensuales
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ${" "}
                    {formatNumber(
                      gastosPorMes.reduce(
                        (total, mes) => total + mes.totalGastos,
                        0
                      )
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Acumulado
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    ${" "}
                    {formatNumber(
                      gastosPorMes.length > 0
                        ? gastosPorMes.reduce(
                            (total, mes) => total + mes.totalGastos,
                            0
                          ) / gastosPorMes.length
                        : 0
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Promedio Mensual
                  </Typography>
                </Box>
              </Grid2>
            </Grid2>
          </Paper>
        )}

        {/* Gastos Tables mejorados */}
        {/* Estado vacío mejorado */}
        {gastosPorMes.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
              color: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontSize: "3rem",
              }}
            >
              📊
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
              }}
            >
              No se encontraron gastos mensuales
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                opacity: 0.9,
                fontSize: "1.1rem",
              }}
            >
              {state.filters.year || state.filters.month
                ? "🔍 Intenta cambiar el filtro de fecha o crear un nuevo registro"
                : "🚀 Crea tu primer registro de gastos mensuales"}
            </Typography>
            <Button
              component={Link}
              to="/crear-gasto-mes"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.3)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                },
              }}
            >
              Crear Primer Gasto
            </Button>
          </Paper>
        ) : (
          gastosPorMes.map((mesData) => (
            <Paper
              key={mesData.id}
              elevation={6}
              sx={{
                mb: 4,
                p: 3,
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              {/* Month Header mejorado */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  background:
                    "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
                  color: "white",
                  p: 2,
                  borderRadius: 2,
                  mx: -3,
                  mt: -3,
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    display: "flex",
                    color: "white",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  📊 {mesData.mesDeGasto}
                  <Chip
                    label={`${mesData.expenses.length} categorías`}
                    size="small"
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      fontWeight: 500,
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Tooltip title="Editar gastos del mes" arrow>
                    <Button
                      component={Link}
                      to={`/crear-gasto-mes/${mesData.id}`}
                      variant="contained"
                      startIcon={<EditIcon />}
                      size="small"
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.3)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      Editar
                    </Button>
                  </Tooltip>
                  <Tooltip title="Eliminar registro completo" arrow>
                    <IconButton
                      onClick={() => openDeleteDialog(mesData.id)}
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        "&:hover": {
                          background: "rgba(245, 101, 101, 0.8)",
                          transform: "translateY(-1px)",
                        },
                      }}
                      aria-label="eliminar gasto mensual"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {/* Gastos Table mejorada */}{" "}
              <TableContainer
                sx={{
                  border: "2px solid rgba(74, 85, 104, 0.3)",
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.8)",
                  overflow: "hidden",
                }}
                role="region"
                aria-label={`Tabla de gastos para ${mesData.mesDeGasto}`}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        background:
                          "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          width: "70%",
                          color: "white",
                          fontSize: "1rem",
                          py: 2,
                        }}
                      >
                        💰 Concepto
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          width: "30%",
                          color: "white",
                          fontSize: "1rem",
                          py: 2,
                        }}
                        align="right"
                      >
                        💵 Valor Mensual
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mesData.expenses.map((gasto, idx) => (
                      <TableRow
                        key={`${mesData.id}-${idx}`}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "rgba(74, 85, 104, 0.05)",
                          },
                          "&:hover": {
                            backgroundColor: "rgba(74, 85, 104, 0.15)",
                            transform: "scale(1.01)",
                            transition: "all 0.2s ease",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #38a169 0%, #2f855a 100%)",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "#2d3748",
                              }}
                            >
                              {gasto.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontFamily: "monospace",
                            py: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: "1rem",
                              color: "#2d3748",
                              background:
                                "linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            $ {formatNumber(gasto.value)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow
                      sx={{
                        background:
                          "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          color: "white",
                          py: 2.5,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: "rgba(255, 255, 255, 0.8)",
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            }}
                          >
                            🏆 Total Gastos del Mes
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          fontFamily: "monospace",
                          color: "white",
                          py: 2.5,
                        }}
                        align="right"
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          }}
                        >
                          $ {formatNumber(mesData.totalGastos)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))
        )}
        {/* Paginación mejorada */}
        {state.totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              p: 2,
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: 2,
              border: "1px solid rgba(74, 85, 104, 0.3)",
            }}
          >
            <Pagination
              count={state.totalPages}
              page={state.currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  fontWeight: 500,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
                    color: "white",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
                    color: "white",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #dd6b20 0%, #c05621 100%)",
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Modal de Confirmación de Eliminación mejorado */}
      <Dialog
        open={state.deleteDialog.open}
        onClose={closeDeleteDialog}
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
            background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.2rem",
            pb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            ⚠️ Confirmar Eliminación
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontSize: "3rem",
            }}
          >
            🗑️
          </Typography>
          <DialogContentText sx={{ fontSize: "1rem", color: "#4a5568", mb: 2 }}>
            ¿Estás seguro de que deseas eliminar este registro de gastos
            mensuales? Esta acción no se puede deshacer y se perderán todos los
            datos asociados.
          </DialogContentText>
          <Box
            sx={{
              background: "rgba(229, 62, 62, 0.1)",
              borderRadius: 2,
              p: 2,
              border: "1px solid rgba(229, 62, 62, 0.2)",
            }}
          >
            <Typography variant="body2" color="error.main" fontWeight={500}>
              💡 Esta acción es irreversible
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={closeDeleteDialog}
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
            autoFocus
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #c53030 0%, #9c2a2a 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 25px rgba(197, 48, 48, 0.3)",
              },
            }}
          >
            🗑️ Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablaGastosEmpresa;
