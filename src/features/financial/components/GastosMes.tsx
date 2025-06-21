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
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import api from "@/api";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
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

      const apiData: ApiResponse = response.data;

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
      <LoadingOverlay loading={true}>
        Cargando gastos mensuales...
      </LoadingOverlay>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, width: "100%", overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gastos de la Empresa por Mes
          </Typography>
          <Button
            component={Link}
            to="/crear-gasto-mes"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Nuevo Gasto Mensual
          </Button>
        </Box>
        {/* Error Alert */}
        {state.error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setState((prev) => ({ ...prev, error: null }))}
          >
            {state.error}
          </Alert>
        )}
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>
          <Grid2 container spacing={2}>
            {/* Filtros de fecha */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Año"
                value={state.filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                placeholder="2025"
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Mes"
                value={state.filters.month}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                placeholder="01-12"
                fullWidth
                variant="outlined"
                size="small"
                inputProps={{ min: "01", max: "12", pattern: "[0-9]{2}" }}
              />
            </Grid2>
            {/* Filtros de montos */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Monto Mínimo"
                value={state.filters.minAmount}
                onChange={(e) =>
                  handleFilterChange("minAmount", e.target.value)
                }
                placeholder="100000"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Monto Máximo"
                value={state.filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange("maxAmount", e.target.value)
                }
                placeholder="5000000"
                fullWidth
                variant="outlined"
                size="small"
                type="number"
              />
            </Grid2>
            {/* Filtros de categoría */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Tiene Categorías Extras"
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
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Con categorías extras</MenuItem>
                <MenuItem value="false">Sin categorías extras</MenuItem>
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Nombre de Categoría"
                value={state.filters.categoryName}
                onChange={(e) =>
                  handleFilterChange("categoryName", e.target.value)
                }
                placeholder="COMPRA_DE_GATO"
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid2>
            {/* Filtros de ordenamiento */}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Ordenar por"
                value={state.filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
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
                label="Orden"
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
                color="error"
                fullWidth
                sx={{ height: 40 }}
              >
                Limpiar Filtros
              </Button>
            </Grid2>
            {/* Información de resultados */}
            <Grid2 size={{ xs: 12 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {state.totalItems} resultado{state.totalItems !== 1 ? "s" : ""}
                encontrado
                {state.totalItems !== 1 ? "s" : ""} - Página {state.currentPage}
                de {state.totalPages}
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>
        {/* Gastos Tables */}
        {gastosPorMes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No se encontraron gastos mensuales
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {state.filters.year || state.filters.month
                ? "Intenta cambiar el filtro de fecha o crear un nuevo registro"
                : "Crea tu primer registro de gastos mensuales"}
            </Typography>
          </Paper>
        ) : (
          gastosPorMes.map((mesData) => (
            <Box
              key={mesData.id}
              sx={{
                mb: 4,
                boxShadow: 3,
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              {/* Month Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="h5" component="div" fontWeight="bold">
                  {mesData.mesDeGasto}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Button
                    component={Link}
                    to={`/crear-gasto-mes/${mesData.id}`}
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    size="small"
                  >
                    Editar
                  </Button>
                  <IconButton
                    onClick={() => openDeleteDialog(mesData.id)}
                    color="error"
                    aria-label="eliminar gasto mensual"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Gastos Table */}
              <TableContainer
                sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold", width: "70%" }}>
                        Concepto
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", width: "30%" }}
                        align="right"
                      >
                        Valor Mensual
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mesData.expenses.map((gasto, idx) => (
                      <TableRow
                        key={`${mesData.id}-${idx}`}
                        hover
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {gasto.name}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: "monospace" }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            $ {formatNumber(gasto.value)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                      <TableCell
                        sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Total Gastos del Mes
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          fontFamily: "monospace",
                          color: "primary.main",
                        }}
                        align="right"
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="primary"
                        >
                          $ {formatNumber(mesData.totalGastos)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}
        {/* Pagination */}
        {state.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={state.totalPages}
              page={state.currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={state.deleteDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Confirmar Eliminación
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este registro de gastos
            mensuales? Esta acción no se puede deshacer y se perderán todos los
            datos asociados.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeDeleteDialog}
            color="inherit"
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TablaGastosEmpresa;
