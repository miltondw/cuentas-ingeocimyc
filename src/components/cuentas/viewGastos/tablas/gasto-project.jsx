import { useState, useEffect, useCallback } from "react";
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
  Grid2,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import api from "../../../../api";

// Cabeceras para columnas calculadas e inputs de gastos
const tableRowInputs = [
  "Acciones",
  "Fecha",
  "Solicitante",
  "Nombre Proyecto",
  "Costo Servicio",
  "Abonado",
  "Total Gastos",
  "Saldo",
  "Estado Cuenta",
  "Utilidad Neta",
];
const tableTextField = [
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

// Función para formatear números
const formatNumber = (number) => {
  const n = Number(number) || 0;
  const options = Number.isInteger(n)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return new Intl.NumberFormat("es", options).format(n);
};

// Formatea la fecha en un formato legible
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es");
};

const isNumeric = (value) => !isNaN(value) && value !== "" && value !== null;

const getGastos = (project) =>
  project.gastos && project.gastos.length > 0 ? project.gastos[0] : {};

const calculateTotalGastos = (project) => {
  const gastos = getGastos(project);
  return tableTextField.reduce(
    (sum, field) => sum + (parseFloat(gastos[field]) || 0),
    0
  );
};

const calculateSaldo = (project) => {
  const costo = parseFloat(project.costo_servicio) || 0;
  const abono = parseFloat(project.abono) || 0;
  return costo > abono ? costo - abono : 0;
};

const getEstadoCuenta = (project) => {
  const costo = parseFloat(project.costo_servicio) || 0;
  const abono = parseFloat(project.abono) || 0;
  if (abono === 0) return "Pendiente";
  if (abono === costo) return "Pagado";
  if (abono < costo) return "Abonado";
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

const calculateUtilidadNeta = (project) => {
  const costo = parseFloat(project.costo_servicio) || 0;
  return costo - calculateTotalGastos(project);
};

const GastosProject = () => {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState({
    solicitante: "",
    proyecto: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [open, setOpen] = useState(false); // Modal para abonar
  const [selectedProject, setSelectedProject] = useState(null);
  const [abono, setAbono] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Actualiza la página al cambiar algún filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Función memoizada para obtener proyectos, evitando recrearla en cada render
  const fetchProjects = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
      ...(search.solicitante && { solicitante: search.solicitante }),
      ...(search.proyecto && { proyecto: search.proyecto }),
      ...(search.fechaInicio && { fechaInicio: search.fechaInicio }),
      ...(search.fechaFin && { fechaFin: search.fechaFin }),
    };

    try {
      const response = await api.get("/projects", { params });
      if (response.data && response.data.data) {
        setProjects(response.data.data.proyectos);
        setTotal(response.data.data.total);
      } else {
        console.error("Respuesta inválida de la API", response.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [currentPage, search]); // Se actualiza solo cuando currentPage o search cambian

  // Ejecuta fetchProjects cuando fetchProjects (y por ende currentPage o search) cambian
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handlers para eliminación
  const handleOpenDeleteModal = (project) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const handleDelete = async (proyecto_id) => {
    try {
      await api.delete(`/projects/${proyecto_id}`);
      setProjects((prev) =>
        prev.filter((project) => project.proyecto_id !== proyecto_id)
      );
      setDeleteModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error eliminando el proyecto:", error);
    }
  };

  // Handlers para abonar
  const handleOpenAbonarModal = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleCloseAbonarModal = () => {
    setOpen(false);
    setSelectedProject(null);
    setAbono("");
  };

  const handleAbonar = async () => {
    if (!selectedProject) return;
    try {
      const projectId = selectedProject.proyecto_id;
      const additionalAbono = parseFloat(abono) || 0;
      await api.patch(`/projects/${projectId}/abonar`, {
        abono: additionalAbono,
      });
      await fetchProjects(); // Se usa la función memorizada para actualizar la lista
      handleCloseAbonarModal();
    } catch (error) {
      console.error("Error actualizando el abono:", error);
    }
  };

  const handleClearFilters = () => {
    setSearch({
      solicitante: "",
      proyecto: "",
      fechaInicio: "",
      fechaFin: "",
    });
  };

  // Array para generar los filtros de búsqueda de forma dinámica
  const filterFields = [
    { label: "Buscar Solicitante", key: "solicitante", type: "text" },
    { label: "Buscar Proyecto", key: "proyecto", type: "text" },
    { label: "Fecha Inicio", key: "fechaInicio", type: "date" },
    { label: "Fecha Fin", key: "fechaFin", type: "date" },
  ];
  /*   const cabezeraTitles = [
    "Acciones",
    "Fecha",
    "Solicitante",
    "Nombre Proyecto",
    "Costo Servicio",
    "Abonado",
  ]; */

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{ width: "90vw", margin: "3rem auto", p: 2 }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Lista de Proyectos
        </Typography>
        <Grid2 container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          {filterFields.map(({ label, key, type }) => (
            <Grid2 xs="auto" key={key}>
              <TextField
                label={label}
                variant="filled"
                type={type}
                value={search[key]}
                onChange={(e) =>
                  setSearch((prev) => ({ ...prev, [key]: e.target.value }))
                }
                {...(type === "date" && { InputLabelProps: { shrink: true } })}
              />
            </Grid2>
          ))}
          <Grid2 xs="auto">
            <Button
              variant="contained"
              color="error"
              onClick={handleClearFilters}
              sx={{ mt: 1 }}
            >
              Limpiar
            </Button>
          </Grid2>
        </Grid2>

        <Table sx={{ width: "90vw", minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {tableRowInputs.map((header) => (
                <TableCell
                  key={header}
                  sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                >
                  {header}
                </TableCell>
              ))}
              {tableTextField.map((field) => (
                <TableCell
                  key={field}
                  sx={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {field}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              const totalGastos = calculateTotalGastos(project);
              const saldo = calculateSaldo(project);
              const estadoCuenta = getEstadoCuenta(project);
              const utilidadNeta = calculateUtilidadNeta(project);
              const gastos = getGastos(project);

              return (
                <TableRow key={project.proyecto_id}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Link to={`/crear-proyecto/${project.proyecto_id}`}>
                      Ver Detalles
                    </Link>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteModal(project)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenAbonarModal(project)}
                    >
                      <AddIcon />
                    </IconButton>
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
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{`$ ${formatNumber(
                    project.costo_servicio
                  )}`}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{`$ ${formatNumber(
                    project.abono
                  )}`}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{`$ ${formatNumber(
                    totalGastos
                  )}`}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {`$ ${
                      estadoCuenta === "Pagado"
                        ? formatNumber(0)
                        : formatNumber(saldo)
                    }`}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: colorEstadoCuenta(estadoCuenta),
                      color: "#fff",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {estadoCuenta}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {`$ ${formatNumber(utilidadNeta)}`}
                  </TableCell>
                  {tableTextField.map((field) => (
                    <TableCell key={field} sx={{ whiteSpace: "nowrap" }}>
                      {isNumeric(gastos[field])
                        ? `$ ${formatNumber(parseFloat(gastos[field]))}`
                        : gastos[field]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Pagination
          count={Math.ceil(total / rowsPerPage)}
          page={currentPage}
          onChange={(event, page) => setCurrentPage(page)}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />
      </TableContainer>

      {/* Modal para Abonar */}
      <Dialog open={open} onClose={handleCloseAbonarModal}>
        <DialogTitle>Abonar Proyecto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Costo del Servicio: $
            {selectedProject
              ? formatNumber(parseFloat(selectedProject.costo_servicio))
              : ""}
          </DialogContentText>
          <DialogContentText>
            Saldo pendiente: $
            {selectedProject
              ? formatNumber(calculateSaldo(selectedProject))
              : ""}
          </DialogContentText>
          <DialogContentText>
            Abonado: $
            {selectedProject
              ? formatNumber(parseFloat(selectedProject.abono))
              : ""}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Valor a Abonar"
            type="number"
            fullWidth
            value={abono}
            onChange={(e) => setAbono(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAbonarModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAbonar} color="primary">
            Abonar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de eliminación */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el proyecto{" "}
            {selectedProject?.nombre_proyecto}? Esta acción no se puede
            deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(selectedProject.proyecto_id)}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GastosProject;
