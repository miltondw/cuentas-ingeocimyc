import { useState, useEffect } from "react";
import {
  Grid2,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api";

// Estado por defecto para un proyecto nuevo
const defaultProject = {
  fecha: "",
  solicitante: "",
  nombre_proyecto: "",
  costo_servicio: "",
  abono: "",
  // Para este formulario se maneja un único objeto de gastos
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

const FormCreateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(defaultProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si se recibe un id, se carga el proyecto para actualizarlo
  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await api.get(`/projects/${id}`);
          if (response.data.success) {
            const data = response.data.data;
            // Formatear la fecha para el input (YYYY-MM-DD)
            const formattedFecha = data.fecha
              ? new Date(data.fecha).toISOString().substring(0, 10)
              : "";
            // Usamos el primer objeto de gastos, si existe; de lo contrario, mantenemos el default
            const gastosData =
              data.gastos && data.gastos.length > 0
                ? data.gastos[0]
                : defaultProject.gastos;
            setProject({
              ...data,
              fecha: formattedFecha,
              solicitante: data.solicitante || "",
              nombre_proyecto: data.nombre_proyecto || "",
              costo_servicio: data.costo_servicio || "",
              abono: data.abono || "",
              gastos: {
                camioneta: gastosData.camioneta || "",
                campo: gastosData.campo || "",
                obreros: gastosData.obreros || "",
                comidas: gastosData.comidas || "",
                transporte: gastosData.transporte || "",
                otros: gastosData.otros || "",
                peajes: gastosData.peajes || "",
                combustible: gastosData.combustible || "",
                hospedaje: gastosData.hospedaje || "",
              },
            });
          }
        } catch (err) {
          setError("Error al cargar el proyecto", err);
        }
      };
      fetchProject();
    }
  }, [id]);

  // Maneja el cambio de los campos de nivel superior
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Maneja el cambio de los campos de "gastos"
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

    // Armamos el payload; convertimos a Number los campos numéricos
    const payload = {
      ...project,
      costo_servicio: Number(project.costo_servicio),
      abono: Number(project.abono),
      // Encapsulamos los gastos en un array
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
      if (id) {
        // Actualización: se utiliza el proyecto_id devuelto en el GET
        await api.put(`/projects/${project.proyecto_id}`, payload);
      } else {
        // Creación
        await api.post("/projects", payload);
      }
      navigate(-1);
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
        {id ? "Actualizar Proyecto" : "Crear Proyecto"}
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
              slotProps={{ inputLabel: { shrink: true } }}
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
        <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
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
              {id ? "Actualizar Proyecto" : "Crear Proyecto"}
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </Paper>
  );
};

export default FormCreateProject;
