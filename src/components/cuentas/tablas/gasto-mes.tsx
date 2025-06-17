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
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import api from "@/api";
import { useNotifications } from "@/api/hooks/useNotifications";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";

// Types
interface GastoItem {
  name: string;
  value: number;
}

interface GastoMes {
  gasto_empresa_id: string;
  mes: string;
  otros_campos?: { [key: string]: number };
  [key: string]: string | number | { [key: string]: number } | undefined;
}

interface TransformedGasto {
  id: string;
  mesDeGasto: string;
  gastos: GastoItem[];
  originalDate: string;
  totalGastos: number;
}

interface AppState {
  gastos: GastoMes[];
  currentPage: number;
  selectedDate: string;
  totalPages: number;
  loading: boolean;
  error: string | null;
  deleteDialog: {
    open: boolean;
    selectedId: string | null;
  };
}

// Utility functions
const formatNumber = (value: number): string =>
  new Intl.NumberFormat("es-ES").format(value);

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const transformData = (data: GastoMes[]): TransformedGasto[] => {
  return data.map((item) => {
    const formattedMonth = formatDate(item.mes);

    const gastos: GastoItem[] = Object.entries(item)
      .filter(
        ([key, value]) =>
          !["gasto_empresa_id", "mes", "otros_campos"].includes(key) &&
          value !== null &&
          value !== undefined
      )
      .map(([key, value]) => ({
        name: key.replace(/_/g, " ").toUpperCase(),
        value: parseFloat(String(value)),
      }));

    // Add gastos from otros_campos
    if (item.otros_campos && typeof item.otros_campos === "object") {
      Object.entries(item.otros_campos).forEach(([nombre, monto]) => {
        gastos.push({
          name: nombre.replace(/_/g, " ").toUpperCase(),
          value: parseFloat(String(monto)),
        });
      });
    }

    const totalGastos = gastos.reduce((total, gasto) => total + gasto.value, 0);

    return {
      id: item.gasto_empresa_id,
      mesDeGasto: `Gasto de ${formattedMonth}`,
      gastos,
      originalDate: item.mes,
      totalGastos,
    };
  });
};

const TablaGastosEmpresa: React.FC = () => {
  const { showNotification, showError } = useNotifications();

  const [state, setState] = useState<AppState>({
    gastos: [],
    currentPage: 1,
    selectedDate: "",
    totalPages: 1,
    loading: false,
    error: null,
    deleteDialog: {
      open: false,
      selectedId: null,
    },
  });

  const rowsPerPage = 10;

  const fetchGastos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.get("/gastos-mes", {
        params: {
          page: state.currentPage,
          limit: rowsPerPage,
        },
      });

      const { data } = response;
      setState((prev) => ({
        ...prev,
        gastos: data.data.gastos || [],
        totalPages: Math.ceil((data.data.total || 0) / rowsPerPage),
        loading: false,
      }));

      if (data.data.gastos?.length === 0) {
        showNotification({
          type: "info",
          title: "Sin resultados",
          message: "No se encontraron gastos para el período seleccionado",
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
  }, [state.currentPage, showNotification, showError]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleDateFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setState((prev) => ({
      ...prev,
      selectedDate: event.target.value,
      currentPage: 1,
    }));
  };

  const handleDelete = async () => {
    const { selectedId } = state.deleteDialog;
    if (!selectedId) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      await api.delete(`/gastos-mes/${selectedId}`);

      showNotification({
        type: "success",
        title: "Gasto Eliminado",
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
    () => transformData(state.gastos),
    [state.gastos]
  );

  const filteredData = useMemo(() => {
    if (!state.selectedDate) return gastosPorMes;

    const selected = new Date(state.selectedDate);
    return gastosPorMes.filter(({ originalDate }) => {
      const date = new Date(originalDate);
      return (
        date.getUTCFullYear() === selected.getUTCFullYear() &&
        date.getUTCMonth() === selected.getUTCMonth()
      );
    });
  }, [state.selectedDate, gastosPorMes]);

  const clearDateFilter = () => {
    setState((prev) => ({ ...prev, selectedDate: "", currentPage: 1 }));
    showNotification({
      type: "info",
      message: "Filtro de fecha eliminado",
      duration: 2000,
    });
  };

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
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                type="month"
                label="Filtrar por Mes"
                value={state.selectedDate}
                onChange={handleDateFilterChange}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                onClick={clearDateFilter}
                variant="outlined"
                color="error"
                fullWidth
                sx={{ height: 40 }}
                disabled={!state.selectedDate}
              >
                Limpiar Filtro
              </Button>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <Typography variant="body2" color="textSecondary">
                {filteredData.length} resultado
                {filteredData.length !== 1 ? "s" : ""} encontrado
                {filteredData.length !== 1 ? "s" : ""}
              </Typography>
            </Grid2>
          </Grid2>
        </Paper>

        {/* Gastos Tables */}
        {filteredData.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No se encontraron gastos mensuales
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {state.selectedDate
                ? "Intenta cambiar el filtro de fecha o crear un nuevo registro"
                : "Crea tu primer registro de gastos mensuales"}
            </Typography>
          </Paper>
        ) : (
          filteredData.map((mesData) => (
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
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
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
                    {mesData.gastos.map((gasto, idx) => (
                      <TableRow
                        key={idx}
                        hover
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        <TableCell>{gasto.name}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontFamily: "monospace" }}
                        >
                          $ {formatNumber(gasto.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                      <TableCell
                        sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
                      >
                        Total Gastos
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
                        $ {formatNumber(mesData.totalGastos)}
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
        <DialogTitle sx={{ pb: 1 }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este registro de gastos
            mensuales? Esta acción no se puede deshacer.
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
