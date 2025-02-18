import { useState, useEffect, useMemo } from "react";
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
  CircularProgress,
  Alert,
  TableSortLabel,
  Tooltip,
  MenuItem,
  Grid2,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../../api";

const tableRowInputs = [
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
    width: 200,
  },
  {
    id: "valor_iva",
    label: "Valor del Iva",
    sortable: true,
    filterType: "text",
    width: 200,
  },
  {
    id: "obrero",
    label: "Obrero",
    sortable: true,
    filterType: "text",
    width: 200,
  },
  {
    id: "metodo_pago",
    label: "Método Pago",
    sortable: true,
    filterType: "text",
    width: 150,
  },
  { id: "costo_servicio", label: "Costo Servicio", sortable: true, width: 150 },
  { id: "abonado", label: "Abonado", sortable: true, width: 120 },
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
  "transporte",
  "otros",
  "peajes",
  "combustible",
  "hospedaje",
];

const formatNumber = (number) =>
  new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(number) || 0);

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" })
    : "";

const getGastos = (project) => {
  try {
    return (project.gastos || []).reduce((total, gasto) => {
      const current = { ...gasto, ...(gasto.otros_campos || {}) };

      // Sumar campos fijos
      fixedGastoFields.forEach((field) => {
        total[field] =
          (parseFloat(total[field]) || 0) + (parseFloat(current[field]) || 0);
      });

      // Sumar campos adicionales
      Object.entries(current).forEach(([key, value]) => {
        if (
          !fixedGastoFields.includes(key) &&
          !["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)
        ) {
          total[key] = (parseFloat(total[key]) || 0) + (parseFloat(value) || 0);
        }
      });

      return total;
    }, {});
  } catch {
    return {};
  }
};

const calculateValues = (project) => {
  const gastos = getGastos(project);
  const costo = parseFloat(project.costo_servicio) || 0;
  const abono = parseFloat(project.abono) || 0;

  const fixedGastos = fixedGastoFields.reduce(
    (acc, field) => acc + (parseFloat(gastos[field]) || 0),
    0
  );

  const extraGastos = Object.entries(gastos).reduce(
    (acc, [key, value]) =>
      !fixedGastoFields.includes(key) &&
      !["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)
        ? acc + (parseFloat(value) || 0)
        : acc,
    0
  );

  const totalGastos = fixedGastos + extraGastos;
  const saldo = Math.max(costo - abono, 0);
  const estadoCuenta =
    abono === 0 ? "Pendiente" : abono >= costo ? "Pagado" : "Abonado";
  const utilidadNeta = costo - totalGastos;

  return { totalGastos, saldo, estadoCuenta, utilidadNeta };
};

const colorEstadoCuenta = (estado) => {
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

const GastosProject = () => {
  const [state, setState] = useState({
    allProjects: [],
    filters: {
      fechaInicio: "",
      fechaFin: "",
      solicitante: "",
      nombre_proyecto: "",
      estado_cuenta: "",
    },
    sortConfig: { field: "fecha", direction: "desc" },
    loading: false,
    error: null,
    currentPage: 1,
    modals: { delete: false, payment: false },
    selectedProject: null,
    paymentAmount: "",
  });

  const rowsPerPage = 5;

  useEffect(() => {
    const fetchProjects = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await api.get("/projects");
        if (response.data?.data) {
          setState((prev) => ({
            ...prev,
            allProjects: response.data.data.proyectos,
            loading: false,
          }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Error al cargar proyectos: ${error.message}`,
          loading: false,
        }));
      }
    };
    fetchProjects();
    console.log(state.allProjects,"state.allProjects",paginatedProjects,"paginatedProjects")
  }, []);

  // Procesamiento de datos con filtros y ordenamiento
  const processedProjects = useMemo(() => {
    return state.allProjects
      .filter((project) => {
        const values = calculateValues(project);
        const projectDate = new Date(project.fecha);
        const filterStart = state.filters.fechaInicio
          ? new Date(state.filters.fechaInicio)
          : null;
        const filterEnd = state.filters.fechaFin
          ? new Date(state.filters.fechaFin)
          : null;

        return Object.entries(state.filters).every(([key, value]) => {
          if (!value) return true;

          if (key === "fechaInicio" || key === "fechaFin") {
            return (
              (!filterStart || projectDate >= filterStart) &&
              (!filterEnd || projectDate <= filterEnd)
            );
          }

          if (key === "estado_cuenta") {
            return values.estadoCuenta.toLowerCase() === value.toLowerCase();
          }

          const projectValue = project[key]?.toString().toLowerCase() || "";
          return projectValue.includes(value.toLowerCase());
        });
      })
      .sort((a, b) => {
        const { field, direction } = state.sortConfig;
        const multiplier = direction === "asc" ? 1 : -1;
        const aValue = field in a ? a[field] : calculateValues(a)[field];
        const bValue = field in b ? b[field] : calculateValues(b)[field];

        return (aValue > bValue ? 1 : -1) * multiplier;
      });
  }, [state.allProjects, state.filters, state.sortConfig]);
  // Paginación
  const paginatedProjects = useMemo(() => {
    const start = (state.currentPage - 1) * rowsPerPage;
    return processedProjects.slice(start, start + rowsPerPage);
  }, [processedProjects, state.currentPage]);

  const handleSort = (field) => {
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

  const handleFilterChange = (field, value) => {
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
        fecha: "",
        solicitante: "",
        nombre_proyecto: "",
        metodo_pago: "",
        estado_cuenta: "",
      },
      currentPage: 1,
    }));
  };

  const handlePayment = async () => {
    const { selectedProject, paymentAmount } = state;
    if (!selectedProject || !paymentAmount) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      // 1. Enviar pago al servidor
      await api.patch(`/projects/${selectedProject.proyecto_id}/abonar`, {
        abono: parseFloat(paymentAmount),
      });

      // 2. Recargar datos frescos desde el servidor
      const response = await api.get("/projects");
      const nuevosProyectos = response.data.data.proyectos;

      // 3. Actualizar estado con los nuevos datos
      setState((prev) => ({
        ...prev,
        allProjects: nuevosProyectos,
        modals: { ...prev.modals, payment: false },
        paymentAmount: "",
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Error al procesar el pago: ${error.message}`,
        loading: false,
      }));
    }
  };
  const handleDelete = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await api.delete(`/projects/${state.selectedProject.proyecto_id}`);

      const updatedProjects = state.allProjects.filter(
        (project) => project.proyecto_id !== state.selectedProject.proyecto_id
      );

      setState((prev) => ({
        ...prev,
        allProjects: updatedProjects,
        modals: { ...prev.modals, delete: false },
        selectedProject: null,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Error al eliminar proyecto: ${error.message}`,
        loading: false,
      }));
    }
  };

  const extraFields = useMemo(() => {
    const fields = new Set();
    state.allProjects.forEach((project) => {
      Object.keys(getGastos(project)).forEach((key) => {
        if (
          !fixedGastoFields.includes(key) &&
          !["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)
        ) {
          fields.add(key);
        }
      });
    });
    return Array.from(fields);
  }, [state.allProjects]);

  return (
    <>
      <TableContainer component={Paper} sx={{ m: 3, p: 2, width: "90vw" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Gestión de Proyectos
        </Typography>

        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* Filtros */}
        <Grid2 container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(state.filters).map(([key, value]) => (
            <Grid2 item key={key} xs={12} sm={6} md={3}>
              {key === "estado_cuenta" ? (
                <TextField
                  select
                  fullWidth
                  label="Estado de cuenta"
                  value={value}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{display:"block",width:150}}
                  slotProps={{ inputLabel: { shrink: true } }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Abonado">Abonado</MenuItem>
                  <MenuItem value="Pagado">Pagado</MenuItem>
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label={`Filtrar por ${key.replace("_", " ")}`}
                  value={value}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  variant="outlined"
                  size="small"
                  type={key.includes("fecha") ? "date" : "text"}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            </Grid2>
          ))}
          <Grid2 item xs={12}>
            <Button
              onClick={handleClearFilters}
              variant="outlined"
              color="error"
              fullWidth
            >
              Limpiar Filtros
            </Button>
          </Grid2>
        </Grid2>

        {/* Tabla */}
        {state.loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        ) : (
          <>
            <Table sx={{ minWidth: "800px", border: "1px solid #ccc" }}>
              <TableHead>
                <TableRow>
                  {/* console.log(tableRowInputs) */}
                  {tableRowInputs.map(({ id, label, sortable }) => (
                    <TableCell key={id} sx={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {sortable ? (
                          <TableSortLabel
                            active={state.sortConfig.field === id}
                            direction={state.sortConfig.direction}
                            onClick={() => handleSort(id)}
                          >
                            {label}
                          </TableSortLabel>
                        ) : (
                          label
                        )}
                      </div>
                    </TableCell>
                  ))}
                  {[...fixedGastoFields, ...extraFields].map((field) => (
                    <TableCell
                      key={field}
                      sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}
                    >
                      {field}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedProjects.map((project) => {
                  const { totalGastos, saldo, estadoCuenta, utilidadNeta } =
                    calculateValues(project);
                  const gastos = getGastos(project);

                  return (
                    <TableRow key={project.proyecto_id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Ver detalles">
                          <Link to={`/crear-proyecto/${project.proyecto_id}`}>
                            <Button size="small">Detalles</Button>
                          </Link>
                        </Tooltip>
                        <Tooltip title="Eliminar proyecto">
                          <IconButton
                            color="error"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                selectedProject: project,
                                modals: { ...prev.modals, delete: true },
                              }))
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Agregar pago">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                selectedProject: project,
                                modals: { ...prev.modals, payment: true },
                              }))
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(project.fecha)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {project.solicitante}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {project.nombre_proyecto}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {project.factura || "-"}
                      </TableCell>{" "}

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {project.valor_iva + " %" || "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {project.obrero || "-"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {project.metodo_de_pago || "-"}
                      </TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap" }}
                      >{`$ ${formatNumber(project.costo_servicio)}`}</TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap" }}
                      >{`$ ${formatNumber(project.abono)}`}</TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap" }}
                      >{`$ ${formatNumber(totalGastos)}`}</TableCell>
                      
                     
                      <TableCell
                        sx={{
                          color: utilidadNeta < 0 ? "#f44336" : "#4caf50",
                          fontWeight: "bold",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {`$ ${formatNumber(utilidadNeta)}`}
                      </TableCell>
                      <TableCell
                        sx={{ whiteSpace: "nowrap" }}
                      >{`$ ${formatNumber(saldo)}`}</TableCell>
                       <TableCell
                        sx={{
                          backgroundColor: colorEstadoCuenta(estadoCuenta),
                          color: "white",
                        }}
                      >
                        {estadoCuenta}
                      </TableCell>
                      {[...fixedGastoFields, ...extraFields].map((field) => (
                        <TableCell key={field}  sx={{ whiteSpace: "nowrap" }}>
                          {gastos[field]
                            ? `$ ${formatNumber(gastos[field])}`
                            : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              count={Math.ceil(processedProjects.length / rowsPerPage)}
              page={state.currentPage}
              onChange={(_, page) =>
                setState((prev) => ({ ...prev, currentPage: page }))
              }
              sx={{ mt: 3, display: "flex", justifyContent: "center" }}
            />
          </>
        )}
      </TableContainer>

      {/* Modal de Pago */}
      <Dialog
        open={state.modals.payment}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            modals: { ...prev.modals, payment: false },
          }))
        }
      >
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          {state.selectedProject && (
            <>
              <DialogContentText>
                Costo del servicio: ${" "}
                {formatNumber(state.selectedProject.costo_servicio)}
              </DialogContentText>
              <DialogContentText>
                Abonado actualmente: ${" "}
                {formatNumber(state.selectedProject.abono)}
              </DialogContentText>
              <DialogContentText>
                Saldo pendiente: ${" "}
                {formatNumber(calculateValues(state.selectedProject).saldo)}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Monto del pago"
                type="number"
                fullWidth
                value={state.paymentAmount}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    paymentAmount: e.target.value,
                  }))
                }
                error={
                  parseFloat(state.paymentAmount) >
                  calculateValues(state.selectedProject).saldo
                }
                helperText={
                  parseFloat(state.paymentAmount) >
                  calculateValues(state.selectedProject).saldo
                    ? "El monto excede el saldo pendiente"
                    : ""
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                modals: { ...prev.modals, payment: false },
              }))
            }
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            color="primary"
            disabled={!state.paymentAmount || state.loading}
          >
            {state.loading ? <CircularProgress size={24} /> : "Confirmar Pago"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Eliminación */}
      <Dialog
        open={state.modals.delete}
        onClose={() =>
          setState((prev) => ({
            ...prev,
            modals: { ...prev.modals, delete: false },
          }))
        }
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar el proyecto
            {state.selectedProject?.nombre_proyecto}? Esta acción no se puede
            deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setState((prev) => ({
                ...prev,
                modals: { ...prev.modals, delete: false },
              }))
            }
          >
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" disabled={state.loading}>
            {state.loading ? <CircularProgress size={24} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GastosProject;
