import React, { useState, useEffect, useMemo } from "react";
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
  Pagination,
  Alert,
  TableSortLabel,
  Tooltip,
  MenuItem,
  Grid2,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PaymentIcon from "@mui/icons-material/Payment";
import EditIcon from "@mui/icons-material/Edit";
import api from "@/api";
import { useNotifications } from "@/api/hooks/useNotifications";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { ProjectFilters } from "@/types/api";

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

interface Project {
  proyecto_id: string;
  fecha: string;
  solicitante: string;
  nombre_proyecto: string;
  factura?: string;
  valor_retencion: number;
  valor_iva: number;
  valor_re: number;
  obrero: string;
  metodo_de_pago: string;
  costo_servicio: number;
  abono: number;
  gastos?: {
    [key: string]: number | { [key: string]: number };
  };
}

interface ProjectCalculations {
  totalGastos: number;
  saldo: number;
  estadoCuenta: "Pendiente" | "Pagado" | "Abonado";
  utilidadNeta: number;
}

// Usando ProjectFilters importado desde types/api.ts para consistencia con API.md
type Filters = ProjectFilters;

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface AppState {
  allProjects: Project[];
  filters: Filters;
  sortConfig: SortConfig;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  modals: {
    delete: boolean;
    payment: boolean;
  };
  selectedProject: Project | null;
  paymentAmount: string;
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
    id: "nombre_proyecto",
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
    id: "valor_retencion",
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
    id: "metodo_de_pago",
    label: "Método de Pago",
    sortable: true,
    filterType: "text",
    width: 150,
  },
  { id: "costo_servicio", label: "Costo Servicio", sortable: true, width: 150 },
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
];

const fixedGastoFields = [
  "camioneta",
  "campo",
  "obreros",
  "comidas",
  "otros",
  "peajes",
  "combustible",
  "hospedaje",
];

// Utility functions
const formatNumber = (value: number | string): string =>
  value === "" || isNaN(Number(value))
    ? ""
    : Number(value).toLocaleString("en-US");

const unformatNumber = (value: string): string => value.replace(/,/g, "");

const formatDate = (dateStr: string): string =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" })
    : "";

const getGastos = (project: Project): ProjectGastos => {
  try {
    const gastos = project.gastos || {};
    const otrosCampos =
      (gastos.otros_campos as { [key: string]: number }) || {};

    // Sumar los valores de los campos fijos
    const gastosFijos = Object.entries(gastos).reduce(
      (total: ProjectGastos, [key, value]) => {
        if (
          !["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)
        ) {
          total[key] =
            (parseFloat(String(total[key])) || 0) +
            (parseFloat(String(value)) || 0);
        }
        return total;
      },
      {}
    );

    // Sumar los valores de otros_campos
    const gastosOtrosCampos = Object.entries(otrosCampos).reduce(
      (total: ProjectGastos, [key, value]) => {
        total[key] =
          (parseFloat(String(total[key])) || 0) +
          (parseFloat(String(value)) || 0);
        return total;
      },
      {}
    );

    // Combinar ambos resultados
    return { ...gastosFijos, ...gastosOtrosCampos };
  } catch {
    return {};
  }
};

const calculateValues = (project: Project): ProjectCalculations => {
  const gastos = getGastos(project);
  const costo = parseFloat(String(project.costo_servicio)) || 0;
  const abono = Number(unformatNumber(String(project.abono))) || 0;
  const totalGastos = Object.values(gastos).reduce(
    (sum, value) => sum + value,
    0
  );
  const saldo = Math.max(costo - abono, 0);
  const estadoCuenta: "Pendiente" | "Pagado" | "Abonado" =
    abono === 0 ? "Pendiente" : abono >= costo ? "Pagado" : "Abonado";
  const re = (Number(project.valor_retencion) / 100) * project.costo_servicio;
  const utilidadNeta = costo - totalGastos - re;

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

const GastosProject: React.FC = () => {
  const { showNotification, showError } = useNotifications();
  const [state, setState] = useState<AppState>({
    allProjects: [],
    filters: {
      status: undefined, // Alineado con API.md
      solicitante: "",
      nombreProyecto: "", // Alineado con API.md
      obrero: "", // Alineado con API.md
      startDate: "", // Alineado con API.md
      endDate: "", // Alineado con API.md
      metodoDePago: undefined, // Alineado con API.md
    },
    sortConfig: { field: "fecha", direction: "desc" },
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    modals: { delete: false, payment: false },
    selectedProject: null,
    paymentAmount: "",
  });

  const rowsPerPage = 10;

  useEffect(() => {
    const buildQueryParams = () => {
      const params: Record<string, string | number> = {
        page: state.currentPage,
        limit: rowsPerPage,
      };

      Object.entries(state.filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      return params;
    };

    const fetchProjects = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = buildQueryParams();
        const response = await api.get("/projects", { params });
        const proyectos =
          response.data?.proyectos?.map((p: Project) => ({
            ...p,
            valor_re: p.valor_retencion
              ? (Number(p.valor_retencion) / 100) * p.costo_servicio
              : 0,
            valor_iva: p.costo_servicio ? 0.19 * p.costo_servicio : 0,
          })) || [];

        setState((prev) => ({
          ...prev,
          allProjects: proyectos,
          totalPages: response.data?.totalPages || 1,
          loading: false,
        }));

        if (proyectos.length === 0) {
          showNotification({
            type: "info",
            title: "Sin resultados",
            message: "No se encontraron proyectos con los filtros aplicados",
            duration: 3000,
          });
        }
      } catch (error) {
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

    fetchProjects();
  }, [state.filters, state.currentPage, showNotification, showError]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSort = (field: string) => {
    setState((prev) => ({
      ...prev,
      sortConfig: {
        field,
        direction:
          prev.sortConfig.field === field && prev.sortConfig.direction === "asc"
            ? "desc"
            : "asc",
      },
      currentPage: 1,
    }));
  };
  const handleFilterChange = (field: string, value: string | undefined) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [field]: value },
      currentPage: 1,
    }));
  };
  const handleClearFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: {
        status: undefined, // Alineado con API.md
        solicitante: "",
        nombreProyecto: "", // Alineado con API.md
        obrero: "", // Alineado con API.md
        startDate: "", // Alineado con API.md
        endDate: "", // Alineado con API.md
        metodoDePago: undefined, // Alineado con API.md
      },
      currentPage: 1,
    }));
    showNotification({
      type: "info",
      message: "Filtros limpiados correctamente",
      duration: 2000,
    });
  };

  const handlePayment = async () => {
    const { selectedProject, paymentAmount } = state;
    if (!selectedProject || !paymentAmount) {
      showError("Proyecto o monto de pago no válido");
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));

      await api.patch(`/projects/${selectedProject.proyecto_id}/abonar`, {
        abono: unformatNumber(paymentAmount),
      });

      showNotification({
        type: "success",
        title: "Pago Procesado",
        message: `Se ha registrado el abono de $${formatNumber(
          paymentAmount
        )} al proyecto ${selectedProject.nombre_proyecto}`,
        duration: 4000,
      });

      // Refresh projects
      const response = await api.get("/projects");
      setState((prev) => ({
        ...prev,
        allProjects: response.data.proyectos,
        modals: { ...prev.modals, payment: false },
        paymentAmount: "",
        selectedProject: null,
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

      await api.delete(`/projects/${state.selectedProject.proyecto_id}`);

      showNotification({
        type: "success",
        title: "Proyecto Eliminado",
        message: `El proyecto "${state.selectedProject.nombre_proyecto}" ha sido eliminado correctamente`,
        duration: 3000,
      });

      setState((prev) => ({
        ...prev,
        allProjects: prev.allProjects.filter(
          (project) =>
            project.proyecto_id !== state.selectedProject!.proyecto_id
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
  const extraFields = useMemo(() => {
    const fields = new Set<string>();
    state.allProjects.forEach((project) => {
      // Campos adicionales en el nivel principal de gastos
      Object.keys(getGastos(project)).forEach((key) => {
        if (
          !fixedGastoFields.includes(key) &&
          !["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)
        ) {
          fields.add(key);
        }
      });

      // Campos dentro de otros_campos
      const gastos = project.gastos || {};
      const otrosCampos =
        (gastos.otros_campos as { [key: string]: number }) || {};
      Object.keys(otrosCampos).forEach((key) => {
        fields.add(key);
      });
    });
    return Array.from(fields);
  }, [state.allProjects]);

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
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Proyectos
          </Typography>
          <Button
            component={Link}
            to="/crear-proyecto"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
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
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f8f9fa" }}>
          <Typography variant="h6" gutterBottom>
            Filtros de Búsqueda
          </Typography>{" "}
          <Grid2 container spacing={2}>
            {Object.entries(state.filters).map(([key, value]) => (
              <Grid2 key={key} size={{ xs: 12, sm: 6, md: 3 }}>
                {key === "status" ? (
                  <TextField
                    select
                    fullWidth
                    label="Estado del Proyecto"
                    value={value || ""}
                    onChange={(e) =>
                      handleFilterChange(key, e.target.value || undefined)
                    }
                    variant="outlined"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {["activo", "completado", "suspendido", "cancelado"].map(
                      (option) => (
                        <MenuItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                ) : key === "metodoDePago" ? (
                  <TextField
                    select
                    fullWidth
                    label="Método de Pago"
                    value={value || ""}
                    onChange={(e) =>
                      handleFilterChange(key, e.target.value || undefined)
                    }
                    variant="outlined"
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {["efectivo", "transferencia", "cheque", "credito"].map(
                      (option) => (
                        <MenuItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    label={`Filtrar por ${
                      key === "startDate"
                        ? "Fecha Inicio"
                        : key === "endDate"
                        ? "Fecha Fin"
                        : key === "nombreProyecto"
                        ? "Nombre Proyecto"
                        : key === "metodoDePago"
                        ? "Método de Pago"
                        : key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                    }`}
                    value={value || ""}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    variant="outlined"
                    size="small"
                    type={key.includes("Date") ? "date" : "text"}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              </Grid2>
            ))}
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                onClick={handleClearFilters}
                variant="outlined"
                color="error"
                fullWidth
                sx={{ height: 40 }}
              >
                Limpiar Filtros
              </Button>
            </Grid2>
          </Grid2>
        </Paper>

        {/* Tabla */}
        <TableContainer
          sx={{ maxHeight: 600, border: "1px solid #e0e0e0", borderRadius: 1 }}
        >
          <Table stickyHeader sx={{ minWidth: 1200 }}>
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
                        active={state.sortConfig.field === id}
                        direction={
                          state.sortConfig.field === id
                            ? state.sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort(id)}
                      >
                        {label}
                      </TableSortLabel>
                    ) : (
                      label
                    )}
                  </TableCell>
                ))}
                {/* Columnas dinámicas para campos extra */}
                {extraFields.map((field) => (
                  <TableCell
                    key={field}
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      minWidth: 120,
                    }}
                  >
                    {field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {state.allProjects.map((project) => {
                const calculations = calculateValues(project);
                return (
                  <TableRow
                    key={project.proyecto_id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    {/* Columna de Acciones */}
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Editar proyecto">
                          <IconButton
                            component={Link}
                            to={`/crear-proyecto/${project.proyecto_id}`}
                            size="small"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Registrar pago">
                          <IconButton
                            onClick={() => openPaymentDialog(project)}
                            size="small"
                            color="success"
                            disabled={calculations.estadoCuenta === "Pagado"}
                          >
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar proyecto">
                          <IconButton
                            onClick={() => openDeleteDialog(project)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    {/* Datos del proyecto */}
                    <TableCell>{formatDate(project.fecha)}</TableCell>
                    <TableCell>{project.solicitante}</TableCell>
                    <TableCell sx={{ fontWeight: "medium" }}>
                      {project.nombre_proyecto}
                    </TableCell>
                    <TableCell>{project.factura || "N/A"}</TableCell>
                    <TableCell>{project.valor_retencion}%</TableCell>
                    <TableCell>${formatNumber(project.valor_iva)}</TableCell>
                    <TableCell>${formatNumber(project.valor_re)}</TableCell>
                    <TableCell>{project.obrero}</TableCell>
                    <TableCell>{project.metodo_de_pago}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      ${formatNumber(project.costo_servicio)}
                    </TableCell>
                    <TableCell>${formatNumber(project.abono)}</TableCell>
                    <TableCell>
                      ${formatNumber(calculations.totalGastos)}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: calculations.utilidadNeta >= 0 ? "green" : "red",
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

                    {/* Columnas dinámicas para campos extra */}
                    {extraFields.map((field) => {
                      const gastos = getGastos(project);
                      return (
                        <TableCell key={field}>
                          ${formatNumber(gastos[field] || 0)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {state.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={state.totalPages}
              page={state.currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={state.modals.delete} onClose={closeModals}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>{" "}
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar el proyecto &quot;
            <strong>{state.selectedProject?.nombre_proyecto}</strong>&quot;?
            Esta acción no se puede deshacer.
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
            Proyecto: <strong>{state.selectedProject?.nombre_proyecto}</strong>
            <br />
            Costo Total:{" "}
            <strong>
              ${formatNumber(state.selectedProject?.costo_servicio || 0)}
            </strong>
            <br />
            Abonado:{" "}
            <strong>${formatNumber(state.selectedProject?.abono || 0)}</strong>
          </DialogContentText>
          <TextField
            fullWidth
            label="Monto del Pago"
            value={state.paymentAmount}
            onChange={(e) =>
              setState((prev) => ({ ...prev, paymentAmount: e.target.value }))
            }
            variant="outlined"
            type="number"
            inputProps={{ min: 0 }}
            sx={{ mt: 2 }}
            autoFocus
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

export default GastosProject;
