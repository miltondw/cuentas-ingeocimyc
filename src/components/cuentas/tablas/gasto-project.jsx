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
import api from "@api";

const tableRowInputs = [
  { id: "acciones", label: "Acciones", sortable: false, width: 150 },
  { id: "fecha", label: "Fecha", sortable: true, filterType: "date", width: 120 },
  { id: "solicitante", label: "Solicitante", sortable: true, filterType: "text", width: 150 },
  { id: "nombre_proyecto", label: "Proyecto", sortable: true, filterType: "text", width: 200 },
  { id: "factura", label: "N° Factura", sortable: true, filterType: "text", width: 120 },
  { id: "valor_retencion", label: "% De Retención", sortable: true, filterType: "text", width: 120 },

  { id: "valor_iva", label: "Valor de Iva", sortable: true, filterType: "text", width: 120 },
  { id: "valor_re", label: "Valor de Retención", sortable: true, filterType: "text", width: 120 },

  { id: "obrero", label: "Obrero", sortable: true, filterType: "text", width: 150 },
  { id: "metodo_de_pago", label: "Método de Pago", sortable: true, filterType: "text", width: 150 },
  { id: "costo_servicio", label: "Costo Servicio", sortable: true, width: 150 },
  { id: "abono", label: "Abonado", sortable: true, width: 120 },
  { id: "total_gastos", label: "Total Gastos", sortable: true, width: 150 },
  { id: "utilidad_neta", label: "Utilidad Neta", sortable: true, width: 150 },
  { id: "saldo", label: "Saldo", sortable: true, width: 120 },
  { id: "estado_cuenta", label: "Estado", sortable: true, filterType: "select", width: 120 },
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

const formatNumber = (value) => (value === "" || isNaN(value) ? "" : Number(value).toLocaleString("en-US"));
const unformatNumber = (value) => value.replace(/,/g, "");
const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" }) : "";

const getGastos = (project) => {
  try {
    const gastos = project.gastos || {};
    const otrosCampos = gastos.otros_campos || {};

    // Sumar los valores de los campos fijos
    const gastosFijos = Object.entries(gastos).reduce((total, [key, value]) => {
      if (!["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)) {
        total[key] = (parseFloat(total[key]) || 0) + (parseFloat(value) || 0);
      }
      return total;
    }, {});

    // Sumar los valores de otros_campos
    const gastosOtrosCampos = Object.entries(otrosCampos).reduce((total, [key, value]) => {
      total[key] = (parseFloat(total[key]) || 0) + (parseFloat(value) || 0);
      return total;
    }, {});

    // Combinar ambos resultados
    return { ...gastosFijos, ...gastosOtrosCampos };
  } catch {
    return {};
  }
};

const calculateValues = (project) => {
  const gastos = getGastos(project);
  const costo = parseFloat(project.costo_servicio) || 0;
  const abono = Number(unformatNumber(project.abono)) || 0;
  const totalGastos = Object.values(gastos).reduce((sum, value) => sum + value, 0);
  const saldo = Math.max(costo - abono, 0);
  const estadoCuenta = abono === 0 ? "Pendiente" : abono >= costo ? "Pagado" : "Abonado";
  const re = (Number(project.valor_retencion) / 100) * project.costo_servicio;
  const utilidadNeta = costo - totalGastos - re;

  return { totalGastos, saldo, estadoCuenta, utilidadNeta };
};

const colorEstadoCuenta = (estado) => {
  switch (estado) {
    case "Pendiente": return "#f44336";
    case "Pagado": return "#4caf50";
    case "Abonado": return "#ff9800";
    default: return "transparent";
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
    totalPages: 1,
    modals: { delete: false, payment: false },
    selectedProject: null,
    paymentAmount: "",
  });

  const rowsPerPage = 10;

  const buildQueryParams = () => {
    const params = {
      page: state.currentPage,
      limit: rowsPerPage,
    };

    Object.entries(state.filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    return params;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = buildQueryParams();
        const response = await api.get("/projects", { params });
        const proyectos = response.data?.proyectos?.map((p) => ({
          ...p,
          valor_re: p.valor_retencion ? (Number(p.valor_retencion) / 100) * p.costo_servicio : 0,
          valor_iva: p.costo_servicio ? 0.19 * p.costo_servicio : 0,
        })) || [];

        setState((prev) => ({
          ...prev,
          allProjects: proyectos,
          totalPages: response.data?.totalPages || 1,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: `Error al cargar proyectos: ${error.message}`,
          loading: false,
        }));
      }
    };

    fetchProjects();
  }, [state.filters, state.currentPage]);

  const handlePageChange = (event, page) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };





  const handleSort = (field) => {
    setState((prev) => ({
      ...prev,
      sortConfig: {
        field,
        direction: prev.sortConfig.field === field && prev.sortConfig.direction === "asc" ? "desc" : "asc",
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
        fechaInicio: "",
        fechaFin: "",
        solicitante: "",
        nombre_proyecto: "",
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
      console.log(paymentAmount, "paymentAmount")
      await api.patch(`/projects/${selectedProject.proyecto_id}/abonar`, {
        abono: unformatNumber(paymentAmount),
      });

      const response = await api.get("/projects");
      setState((prev) => ({
        ...prev,
        allProjects: response.data.proyectos,
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

      setState((prev) => ({
        ...prev,
        allProjects: prev.allProjects.filter(
          (project) => project.proyecto_id !== state.selectedProject.proyecto_id
        ),
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
      // Campos adicionales en el nivel principal de gastos
      Object.keys(getGastos(project)).forEach((key) => {
        if (!fixedGastoFields.includes(key) && !["gasto_proyecto_id", "proyecto_id", "otros_campos"].includes(key)) {
          fields.add(key);
        }
      });

      // Campos dentro de otros_campos
      const otrosCampos = project.gastos?.otros_campos || {};
      Object.keys(otrosCampos).forEach((key) => {
        fields.add(key);
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

        <Grid2 container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(state.filters).map(([key, value]) => (
            <Grid2 key={key} size={{ xs: 12, sm: 6 }} md={3}>
              {key === "estado_cuenta" ? (
                <TextField
                  select
                  fullWidth
                  label="Estado de cuenta"
                  value={value.toString()}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ display: "block", width: "100%" }}
                  slotProps={{ inputLabel: { shrink: true } }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {["Pendiente", "Abonado", "Pagado"].map((option, index) => (
                    <MenuItem key={index} value={option}>{option}</MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label={`Filtrar por ${key.replace("_", " ")}`}
                  value={value.toString()}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  variant="outlined"
                  size="small"
                  type={key.includes("fecha") ? "date" : "text"}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            </Grid2>
          ))}
          <Grid2 size={{ xs: 12 }}>
            <Button onClick={handleClearFilters} variant="outlined" color="error" fullWidth>
              Limpiar Filtros
            </Button>
          </Grid2>
        </Grid2>

        {state.loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
        ) : (
          <>
            <Table sx={{ minWidth: "800px", border: "1px solid #ccc" }}>
              <TableHead>
                <TableRow>
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
                    <TableCell key={field} sx={{ whiteSpace: "nowrap" }}>
                      {field} {/* Solo muestra el nombre del campo, no accede a gastos */}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {state.allProjects.map((project) => {
                  const { totalGastos, saldo, estadoCuenta, utilidadNeta } = calculateValues(project);
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

                      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(project.fecha)}</TableCell>

                      {["solicitante", "nombre_proyecto", "factura"].map(
                        (field, index) => (
                          <TableCell key={index} sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>
                            {
                              field == "factura" && project[field] ?
                                `SYCO-${project[field]}` : typeof project[field] == 'number' ?
                                  formatNumber(project[field]) : project[field] || "-"
                            }
                          </TableCell>
                        )
                      )}

                      {["valor_retencion", "valor_iva", "valor_re"].map(
                        (field, index) => (
                          <TableCell key={index} sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>
                            {
                              Number(project.valor_retencion) > 0 ? formatNumber(project[field]) : "-"
                            }
                          </TableCell>
                        )
                      )}

                      {["obrero", "metodo_de_pago"].map(
                        (field, index) => (
                          <TableCell key={index} sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>

                            {
                              typeof project[field] == 'number' ? formatNumber(project[field]) : project[field] || "-"
                            }
                          </TableCell>
                        )
                      )}

                      {[["costo_servicio", project.costo_servicio], ["abono", project.abono]].map(
                        ([, value], index) => (
                          <TableCell key={index} sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>{`$ ${formatNumber(value)}`}</TableCell>
                        )
                      )}
                      <TableCell sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>{`$ ${formatNumber(totalGastos)}`}</TableCell>
                      <TableCell
                        sx={{
                          color: utilidadNeta < 0 ? "#f44336" : "#4caf50",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {`$ ${formatNumber(utilidadNeta)}`}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>{`$ ${formatNumber(saldo)}`}</TableCell>
                      <TableCell sx={{ backgroundColor: colorEstadoCuenta(estadoCuenta), color: "white" }}>
                        {estadoCuenta}
                      </TableCell>
                      {[...fixedGastoFields, ...extraFields].map((field) => (
                        <TableCell key={field} sx={{ whiteSpace: "nowrap", border: " 1px solid #ccc", textAlign: "center" }}>
                          {gastos[field] ? `$ ${formatNumber(gastos[field])}` : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              count={state.totalPages}
              page={state.currentPage}
              onChange={handlePageChange}
              sx={{ mt: 3, display: "flex", justifyContent: "center" }}
            />
          </>
        )}
      </TableContainer>

      <Dialog
        open={state.modals.payment}
        onClose={() => setState((prev) => ({ ...prev, modals: { ...prev.modals, payment: false } }))}
      >
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          {state.selectedProject && (
            <>
              <DialogContentText>
                Costo del servicio: $ {formatNumber(state.selectedProject.costo_servicio)}
              </DialogContentText>
              <DialogContentText>
                Abonado actualmente: $ {formatNumber(state.selectedProject.abono)}
              </DialogContentText>
              <DialogContentText>
                Saldo pendiente: $ {formatNumber(calculateValues(state.selectedProject).saldo)}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Monto del pago"
                fullWidth
                value={formatNumber(state.paymentAmount) || ""}
                onChange={(e) => setState((prev) => ({ ...prev, paymentAmount: unformatNumber(e.target.value) }))}
                error={parseFloat(state.paymentAmount) > calculateValues(state.selectedProject).saldo}
                helperText={
                  parseFloat(state.paymentAmount) > calculateValues(state.selectedProject).saldo
                    ? "El monto excede el saldo pendiente"
                    : ""
                }
              />

            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState((prev) => ({ ...prev, modals: { ...prev.modals, payment: false } }))}>
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

      <Dialog
        open={state.modals.delete}
        onClose={() => setState((prev) => ({ ...prev, modals: { ...prev.modals, delete: false } }))}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar el proyecto {state.selectedProject?.nombre_proyecto}? Esta acción no se puede
            deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState((prev) => ({ ...prev, modals: { ...prev.modals, delete: false } }))}>
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