import { useState } from "react";
import PropTypes from "prop-types";
import {
  Grid2,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../../api"; // Ajusta la ruta según tu proyecto

// Estado por defecto para un proyecto nuevo
const defaultProject = {
  fecha: "",
  solicitante: "",
  nombre_proyecto: "",
  costo_servicio: "",
  abono: "",
  // Se usará un objeto para el formulario; al enviar se encapsula en un array.
  gastos: {
    camioneta: "",
    campo: "",
    obreros: "",
    comidas: "",
    transporte: "",
    otros: "",
    peajes: "",
    combustible: "",
    hospedaje: "",
  },
};

const ProjectForm = ({ initialData, onSuccess }) => {
  const navigate = useNavigate();

  // Si se recibe initialData, pre-cargamos el formulario
  const [project, setProject] = useState(
    initialData
      ? {
          fecha: initialData.fecha || "",
          solicitante: initialData.solicitante || "",
          nombre_proyecto: initialData.nombre_proyecto || "",
          costo_servicio: initialData.costo_servicio || "",
          abono: initialData.abono || "",
          // Suponemos que initialData.gastos es un array y usamos el primero.
          gastos:
            initialData.gastos && initialData.gastos.length > 0
              ? initialData.gastos[0]
              : { ...defaultProject.gastos },
        }
      : defaultProject
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Maneja los cambios de los campos de nivel superior
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Maneja los cambios de los campos de "gastos"
  const handleGastosChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      gastos: {
        ...prev.gastos,
        [name]: value,
      },
    }));
  };

  // Al enviar el formulario se arma el payload y se llama al endpoint correspondiente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Armamos el payload; convertimos los campos numéricos a Number y encapsulamos "gastos" en un array
    const payload = {
      ...project,
      costo_servicio: Number(project.costo_servicio),
      abono: Number(project.abono),
      gastos: [
        {
          camioneta: Number(project.gastos.camioneta),
          campo: Number(project.gastos.campo),
          obreros: Number(project.gastos.obreros),
          comidas: Number(project.gastos.comidas),
          transporte: Number(project.gastos.transporte),
          otros: Number(project.gastos.otros),
          peajes: Number(project.gastos.peajes),
          combustible: Number(project.gastos.combustible),
          hospedaje: Number(project.gastos.hospedaje),
        },
      ],
    };

    try {
      if (initialData) {
        // Actualización: se espera que initialData tenga la propiedad "proyecto_id"
        const response = await api.put(
          `/projects/${initialData.proyecto_id}`,
          payload
        );
        if (onSuccess) onSuccess(response.data);
        else navigate(-1); // Vuelve a la página anterior
      } else {
        // Creación
        const response = await api.post("/projects", payload);
        if (onSuccess) onSuccess(response.data);
        else navigate(-1);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al enviar el formulario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: "800px", margin: "2rem auto" }}>
      <Typography variant="h4" gutterBottom>
        {initialData ? "Actualizar Proyecto" : "Crear Proyecto"}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          {/* Fecha */}
          <Grid2 item xs={12} sm={6}>
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              value={project.fecha}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid2>
          {/* Solicitante */}
          <Grid2 item xs={12} sm={6}>
            <TextField
              label="Solicitante"
              name="solicitante"
              value={project.solicitante}
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          {/* Nombre del Proyecto */}
          <Grid2 item xs={12}>
            <TextField
              label="Nombre del Proyecto"
              name="nombre_proyecto"
              value={project.nombre_proyecto}
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          {/* Costo del Servicio */}
          <Grid2 item xs={12} sm={6}>
            <TextField
              label="Costo del Servicio"
              type="number"
              name="costo_servicio"
              value={project.costo_servicio}
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          {/* Abono */}
          <Grid2 item xs={12} sm={6}>
            <TextField
              label="Abono"
              type="number"
              name="abono"
              value={project.abono}
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
        </Grid2>
        <Typography variant="h4" style={{}}>
          Gastos
        </Typography>

        <Grid2 container spacing={2}>
          {/* Camioneta */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Camioneta"
              type="number"
              name="camioneta"
              value={project.gastos.camioneta}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Campo */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Campo"
              type="number"
              name="campo"
              value={project.gastos.campo}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Obreros */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Obreros"
              type="number"
              name="obreros"
              value={project.gastos.obreros}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Comidas */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Comidas"
              type="number"
              name="comidas"
              value={project.gastos.comidas}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Transporte */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Transporte"
              type="number"
              name="transporte"
              value={project.gastos.transporte}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Otros */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Otros"
              type="number"
              name="otros"
              value={project.gastos.otros}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Peajes */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Peajes"
              type="number"
              name="peajes"
              value={project.gastos.peajes}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Combustible */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Combustible"
              type="number"
              name="combustible"
              value={project.gastos.combustible}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          {/* Hospedaje */}
          <Grid2 item xs={12} sm={4}>
            <TextField
              label="Hospedaje"
              type="number"
              name="hospedaje"
              value={project.gastos.hospedaje}
              onChange={handleGastosChange}
              fullWidth
            />
          </Grid2>
          <Grid2 item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {initialData ? "Actualizar Proyecto" : "Crear Proyecto"}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Paper>
  );
};
ProjectForm.propTypes = {
  initialData: PropTypes.shape({
    fecha: PropTypes.string,
    proyecto_id: PropTypes.string,
    solicitante: PropTypes.string,
    nombre_proyecto: PropTypes.string,
    costo_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    abono: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gastos: PropTypes.arrayOf(
      PropTypes.shape({
        camioneta: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        campo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        obreros: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        comidas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        transporte: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        otros: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        peajes: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        combustible: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        hospedaje: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
  }),
  onSuccess: PropTypes.func,
};

export default ProjectForm;
