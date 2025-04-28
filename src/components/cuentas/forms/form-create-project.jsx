import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import api from "@api";

// Datos iniciales
const defaultGasto = {
  camioneta: 0,
  campo: 0,
  obreros: 0,
  comidas: 0,
  otros: 0,
  peajes: 0,
  combustible: 0,
  hospedaje: 0,
  extras: [],
};

const defaultProject = {
  fecha: "",
  solicitante: "",
  nombre_proyecto: "",
  obrero: "",
  costo_servicio: 0,
  abono: 0,
  factura: "",
  metodo_de_pago: "",
  valor_retencion: 0,
  retencionIva: false,
  gastos: defaultGasto,
};

// Formatear y desformatear números
const formatNumber = (value) => (value === "" || isNaN(value) ? "" : Number(value).toLocaleString("en-US"));
const unformatNumber = (value) => value.replace(/,/g, "");

const FormCreateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(defaultProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar proyecto si existe
  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await api.get(`/projects/${id}`);
          if (response.data.success) {
            const data = response.data.proyecto; // Ajusta según la estructura de tu API
            const gastoFromApi = data.gastos || defaultGasto; // Asegúrate de que gastos no sea undefined
            const extras = gastoFromApi.otros_campos
              ? Object.entries(gastoFromApi.otros_campos).map(([key, value]) => ({
                field: key,
                value: value.toString(),
              }))
              : [];

            setProject({
              ...data,
              fecha: data.fecha ? new Date(data.fecha).toISOString().substring(0, 10) : "",
              retencionIva: Boolean(data.valor_retencion),
              gastos: { ...gastoFromApi, extras }, // Ahora es un objeto
            });
          }
        } catch (err) {
          console.error(err);
          setError("Error al cargar el proyecto");
        }
      };
      fetchProject();
    }
  }, [id]);

  // Manejar cambios en los campos del proyecto
  const handleChange = (e) => {
    const { name, value } = e.target;
    const unformattedValue = ["valor_retencion", "abono", "costo_servicio"].includes(name)
      ? unformatNumber(value)
      : value;
    setProject((prev) => ({ ...prev, [name]: unformattedValue }));
  };

  // Manejar cambios en los gastos
  const handleGastoChange = (e) => {
    const { name, value } = e.target;
    const unformattedValue = unformatNumber(value);
    setProject((prev) => ({
      ...prev,
      gastos: { ...prev.gastos, [name]: Number(unformattedValue) }, // Ahora es un objeto
    }));
  };

  // Manejar cambios en los campos extras
  const handleExtraChange = (i, e) => {
    const { name, value } = e.target;
    setProject((prev) => {
      const updatedExtras = [...prev.gastos.extras];
      updatedExtras[i] = {
        ...updatedExtras[i],
        [name]: name === "value" ? unformatNumber(value) : value,
      };
      return { ...prev, gastos: { ...prev.gastos, extras: updatedExtras } };
    });
  };

  // Agregar un campo extra
  const handleAddExtra = () => {
    setProject((prev) => ({
      ...prev,
      gastos: { ...prev.gastos, extras: [...prev.gastos.extras, { field: "", value: "" }] },
    }));
  };

  // Eliminar un campo extra
  const handleRemoveExtra = (index) => {
    setProject((prev) => ({
      ...prev,
      gastos: { ...prev.gastos, extras: prev.gastos.extras.filter((_, i) => i !== index) },
    }));
  };

  // Manejar cambios en el checkbox de retención de IVA
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setProject((prev) => ({
      ...prev,
      retencionIva: checked,
      valor_retencion: checked ? prev.valor_retencion : 0,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Convertir extras a un objeto { key: value }
      const otrosCampos = project.gastos.extras.reduce((acc, item) => {
        if (item.field && item.value) acc[item.field.split(" ").join("_")] = Number(item.value);
        return acc;
      }, {});

      // Construir el payload
      const payload = {
        ...project,
        costo_servicio: Number(project.costo_servicio),
        abono: Number(project.abono),
        valor_retencion: project.retencionIva ? Number(project.valor_retencion) : 0,
        gastos: {
          ...project.gastos,
          otros_campos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
        },
      };

      // Eliminar campos innecesarios
      delete payload.retencionIva;
      delete payload.gastos.extras;

      // Enviar la solicitud
      if (id) {
        await api.put(`/projects/${id}`, payload);
      } else {
        await api.post("/projects", payload);
      }

      navigate(-1); // Regresar a la página anterior
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error al enviar el formulario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: "2rem auto" }}>
      <Typography variant="h4" gutterBottom>
        {id ? "Actualizar Proyecto" : "Crear Proyecto"}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          {/* Campos del proyecto */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha"
              type="date"
              name="fecha"
              value={project.fecha || ""} // Asegúrate de que no sea null
              onChange={handleChange}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid2>
          {["solicitante", "nombre_proyecto", "obrero"].map((field) => (
            <Grid2 size={{ xs: 12, sm: 6 }} key={field}>
              <TextField
                label={field.replace(/_/g, " ").toUpperCase()}
                name={field}
                value={project[field] || ""} // Asegúrate de que no sea null
                onChange={handleChange}
                fullWidth
              />
            </Grid2>
          ))}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Método de Pago"
              name="metodo_de_pago"
              value={project.metodo_de_pago || ""} // Asegúrate de que no sea null
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">otro</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="COSTO DEL SERVICIO"
              name="costo_servicio"
              value={formatNumber(project.costo_servicio) || ""} // Asegúrate de que no sea null
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="ABONO"
              name="abono"
              value={formatNumber(project.abono) || ""} // Asegúrate de que no sea null
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <FormControlLabel
              control={<Checkbox checked={project.retencionIva} onChange={handleCheckboxChange} />}
              label="¿Aplica Facturacion?"
            />
          </Grid2>
          {project.retencionIva && (
            ["factura", "valor_retencion"].map((field) => (
              <Grid2 size={{ xs: 12, sm: 6 }} key={field}>
                <TextField
                  label={field.replace(/_/g, " ").toUpperCase()}
                  name={field}
                  value={project[field] || ""}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid2>
            ))

          )}
        </Grid2>

        {/* Campos de gastos */}
        <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>Gastos</Typography>
        <Grid2 container spacing={2} sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 1 }}>
          {["camioneta", "campo", "obreros", "comidas", "otros", "peajes", "combustible", "hospedaje"].map((field) => (
            <Grid2 size={{ xs: 12, sm: 3 }} key={field}>
              <TextField
                label={field.toUpperCase()}
                name={field}
                value={formatNumber(project.gastos[field]) || ""} // Asegúrate de que no sea null
                onChange={handleGastoChange}
                fullWidth
              />
            </Grid2>
          ))}

          {project.gastos.extras.map((extra, index) => (
            <Grid2 container spacing={1} key={index} sx={{ mb: 1 }}>
              <Grid2 size={{ xs: 5 }}>
                <TextField
                  label="Nombre del Campo"
                  name="field"
                  value={extra.field || ""} // Asegúrate de que no sea null
                  onChange={(e) => handleExtraChange(index, e)}
                  fullWidth
                />
              </Grid2>
              <Grid2 size={{ xs: 5 }}>
                <TextField
                  label="Valor"
                  name="value"
                  value={formatNumber(extra.value) || ""} // Asegúrate de que no sea null
                  onChange={(e) => handleExtraChange(index, e)}
                  fullWidth
                />
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <IconButton onClick={() => handleRemoveExtra(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid2>
            </Grid2>
          ))}

          <Grid2 size={{ xs: 12 }}>
            <Button variant="outlined" onClick={handleAddExtra}>
              Agregar campo extra
            </Button>
          </Grid2>
        </Grid2>

        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {id ? "Actualizar Proyecto" : "Crear Proyecto"}
        </Button>
      </form>
    </Paper>
  );
};

export default FormCreateProject;