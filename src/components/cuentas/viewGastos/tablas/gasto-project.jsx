// Dependencies
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Grid2,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  calculateSaldo,
  calculateTotalGastos,
  calculateUtilidadNeta,
  colorEstadoCuenta,
  filteredProjects,
  formatNumber,
  getEstadoCuenta,
  isNumeric,
  tableRowInputs,
  tableTextField,
} from "../../utils";

const GastosProject = ({ listProjects }) => {
  useEffect(() => {
    setProjects(listProjects);
  }, [listProjects]);

  const [projects, setProjects] = useState(listProjects);
  const [search, setSearch] = useState({
    solicitante: "",
    proyecto: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [abono, setAbono] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const paginatedProjects = filteredProjects(projects, search).slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleOpenDeleteModal = (project) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const handleInputChange = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value ? parseFloat(value) : 0;
    setProjects(updatedProjects);
  };

  const handleClearFilters = () => {
    setSearch({
      solicitante: "",
      proyecto: "",
      fechaInicio: "",
      fechaFin: "",
    });
  };

  const handleDelete = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem("formData", JSON.stringify(updatedProjects));
    handleCloseDeleteModal();
  };

  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedProject(null);
    setAbono("");
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedProject(null);
  };

  const handleAbonar = () => {
    const updatedProjects = projects.map((project) => {
      if (project.id === selectedProject.id) {
        return {
          ...project,
          abono: project.abono + parseFloat(abono),
        };
      }
      return project;
    });
    setProjects(updatedProjects);
    localStorage.setItem("formData", JSON.stringify(updatedProjects));
    handleCloseModal();
  };

  return (
    <>
      <TableContainer
        style={{ maxWidth: "90vw", position: "relative", margin: "3rem auto" }}
        component={Paper}
      >
        <Typography variant="h2" gutterBottom color="#000">
          Lista de Proyectos
        </Typography>
        <Grid2
          container
          spacing={2}
          width="100%"
          style={{ placeContent: "center" }}
        >
          <TextField
            label="Buscar Solicitante"
            variant="filled"
            type="text"
            margin="normal"
            value={search.solicitante ?? ""}
            onChange={(e) =>
              setSearch({ ...search, solicitante: e.target.value })
            }
          />
          <TextField
            label="Buscar Proyecto"
            variant="filled"
            type="text"
            margin="normal"
            value={search.proyecto ?? ""}
            onChange={(e) => setSearch({ ...search, proyecto: e.target.value })}
          />
          <TextField
            label="Fecha Inicio"
            variant="filled"
            type="date"
            margin="normal"
            value={search.fechaInicio}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            onChange={(e) =>
              setSearch({ ...search, fechaInicio: e.target.value })
            }
          />
          <TextField
            label="Fecha Fin"
            variant="filled"
            type="date"
            margin="normal"
            value={search.fechaFin ?? ""}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            onChange={(e) => setSearch({ ...search, fechaFin: e.target.value })}
          />
          <Button
            variant="contained"
            style={{ height: "fit-content", placeSelf: "center" }}
            color="error"
            onClick={handleClearFilters}
          >
            Limpiar
          </Button>
        </Grid2>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Acciones
              </TableCell>
              {tableRowInputs.map((cell, index) => (
                <TableCell
                  key={index}
                  sx={{ minWidth: 100, fontWeight: "bold" }}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProjects.map((project, index) => (
              <TableRow key={index}>
                <TableCell sx={{ minWidth: 100 }}>
                  <Link to={`/${project.id}`}>Ver Detalles</Link>
                  <IconButton
                    color="error"
                    onClick={() => handleOpenDeleteModal(project)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenModal(project)}
                  >
                    <AddIcon />
                  </IconButton>
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  {`$ ${formatNumber(calculateTotalGastos(project))}`}
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  {getEstadoCuenta(project) === "Pagado"
                    ? "$ 0"
                    : `$ ${formatNumber(calculateSaldo(project))}`}
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 100,
                    backgroundColor: colorEstadoCuenta(
                      getEstadoCuenta(project)
                    ),
                    color: "#fff",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  {getEstadoCuenta(project)}
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  {`$ ${formatNumber(calculateUtilidadNeta(project))}`}
                </TableCell>
                {tableTextField.map((cell, index) => (
                  <TableCell key={index} sx={{ minWidth: 200 }}>
                    <TextField
                      value={
                        isNumeric(project[cell])
                          ? formatNumber(project[cell]) ?? ""
                          : project[cell] ?? ""
                      }
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              {isNumeric(project[cell]) ? "$" : ""}
                            </InputAdornment>
                          ),
                        },
                      }}
                      onChange={(e) =>
                        handleInputChange(index, cell, e.target.value)
                      }
                      variant="standard"
                      type={cell === "fecha" ? "date" : "text"}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={Math.ceil(
          filteredProjects(projects, search).length / rowsPerPage
        )}
        page={currentPage}
        onChange={handlePageChange}
        style={{
          margin: "1rem auto",
          display: "flex",
          justifyContent: "center",
        }}
      />

      {/* Dialogs para abonar y eliminar */}
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>Abonar Proyecto</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Costo del Servicio: ${formatNumber(selectedProject?.costoServicio)}
          </DialogContentText>
          <DialogContentText>
            Saldo pendiente: $
            {formatNumber(
              selectedProject?.costoServicio - selectedProject?.abono
            )}
          </DialogContentText>
          <DialogContentText>
            Abonado: ${formatNumber(selectedProject?.abono)}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Valor a Abonar"
            type="number"
            fullWidth
            value={abono ?? ""}
            onChange={(e) => setAbono(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAbonar} color="primary">
            Abonar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el proyecto{" "}
            {selectedProject?.nombreProyecto}? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(selectedProject.id)}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

GastosProject.propTypes = {
  listProjects: PropTypes.array.isRequired,
};

export default GastosProject;
