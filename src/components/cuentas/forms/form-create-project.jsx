import { useState, useEffect } from "react";
import {
  TextField, Button, Typography, Paper, Alert, Checkbox,
  FormControlLabel, IconButton,
  MenuItem
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api";

const defaultGasto = {
  camioneta: "",
  campo: "",
  obreros: "",
  comidas: "",
  otros: "",
  peajes: "",
  combustible: "",
  hospedaje: "",
  extras: [],
};

const defaultProject = {
  fecha: "",
  solicitante: "",
  nombre_proyecto: "",
  obrero: "",
  costo_servicio: "",
  abono: "",
  factura: "",
  metodo_de_pago: "",
  valor_iva: "",
  retencionIva: false,
  gastos: [defaultGasto],
};

const formatNumber = (value) => {
  if (value === "" || isNaN(value)) return "";
  return Number(value).toLocaleString("en-US");
};

const unformatNumber = (value) => {
  return value.replace(/,/g, "");
};

const FormCreateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(defaultProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await api.get(`/projects/${id}`);
          if (response.data.success) {
            const data = response.data.data;
            setProject({
              ...data,
              fecha: data.fecha ? new Date(data.fecha).toISOString().substring(0, 10) : "",
              retencionIva: Boolean(data.valor_iva),
              gastos: data.gastos?.length ? data.gastos[0] : [defaultGasto],
            });
          }
        } catch (err) {
          setError("Error al cargar el proyecto", err);
        }
      };
      fetchProject();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const unformattedValue = name === "valor_iva" || name === "abono" || name === "costo_servicio"
      ? unformatNumber(value)
      : value;
    setProject((prev) => ({ ...prev, [name]: unformattedValue }));
  };

  const handleGastoChange = (e) => {
    const { name, value } = e.target;
    const unformattedValue = unformatNumber(value);
    setProject((prev) => {
      const updatedGastos = [...prev.gastos];
      updatedGastos[0] = { ...updatedGastos[0], [name]: unformattedValue };
      return { ...prev, gastos: updatedGastos };
    });
  };

  const handleExtraChange = (index, e) => {
    const { name, value } = e.target;
    setProject((prev) => {
      const updatedExtras = [...prev.gastos[0].extras];
      updatedExtras[index] = { ...updatedExtras[index], [name]: name === "value" ? unformatNumber(value) : value };
      return { ...prev, gastos: [{ ...prev.gastos[0], extras: updatedExtras }] };
    });
  };

  const handleAddExtra = () => {
    setProject((prev) => {
      const updatedExtras = [...prev.gastos[0].extras, { field: "", value: "" }];
      return { ...prev, gastos: [{ ...prev.gastos[0], extras: updatedExtras }] };
    });
  };

  const handleRemoveExtra = (index) => {
    setProject((prev) => {
      const updatedExtras = prev.gastos[0].extras.filter((_, i) => i !== index);
      return { ...prev, gastos: [{ ...prev.gastos[0], extras: updatedExtras }] };
    });
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setProject((prev) => ({
      ...prev,
      retencionIva: checked,
      valor_iva: checked ? prev.valor_iva : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Transformamos el array de extras a un objeto { key: value }
    const otrosCampos = project.gastos[0].extras.reduce((acc, item) => {
      if (item.field && item.value) acc[item.field] = Number(item.value);
      return acc;
    }, {});

    const payload = {
      ...project,
      costo_servicio: Number(project.costo_servicio),
      abono: Number(project.abono),
      valor_iva: project.retencionIva ? Number(project.valor_iva) : 0,
      gastos: [
        {
          ...project.gastos[0],
          otros_campos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
          // Solo envía si hay datos
        },
      ],
    };

    try {
      delete payload.extras
      id ? await api.put(`/projects/${id}`, payload) : await api.post("/projects", payload);
      navigate(-1);
    } catch (err) {
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
          {["solicitante", "nombre_proyecto", "factura", "obrero"].map((field, index) => (
            <Grid2 item xs={12} sm={6} key={index}>
              <TextField
                label={field.replace(/_/g, " ").toUpperCase()}
                name={field}
                value={project[field]}
                onChange={handleChange}
                fullWidth
              />
            </Grid2>
          ))}
          <Grid2 item xs={12} sm={6}>
            <TextField
              select
              label="Método de Pago"
              name="metodo_de_pago"
              value={project.metodo_de_pago}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">otro</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
            </TextField>
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <TextField
              label="COSTO DEL SERVICIO"
              name="costo_servicio"
              value={formatNumber(project.costo_servicio)}
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          <Grid2 item xs={12} sm={6}>
            <TextField
              label="ABONO"
              name="abono"
              value={formatNumber(project.abono)}
              onChange={handleChange}
              fullWidth
            />
          </Grid2>
          <Grid2 item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={project.retencionIva} onChange={handleCheckboxChange} />}
              label="¿Aplica retención de IVA?"
            />
          </Grid2>
          {project.retencionIva && (
            <Grid2 item xs={12} sm={6}>
              <TextField
                label="Valor IVA"
                name="valor_iva"
                value={formatNumber(project.valor_iva)}
                onChange={handleChange}
                fullWidth
              />
            </Grid2>
          )}
        </Grid2>

        <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>Gastos</Typography>
        <Grid2 container spacing={2} sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 1 }}>
          {["camioneta", "campo", "obreros", "comidas", "otros", "peajes", "combustible", "hospedaje"].map((field, index) => (
            <Grid2 item xs={12} sm={3} key={index}>
              <TextField
                label={field.toUpperCase()}
                name={field}
                value={formatNumber(project.gastos[0][field])}
                onChange={handleGastoChange}
                fullWidth
              />
            </Grid2>
          ))}

          {project.gastos[0].extras.map((extra, index) => (
            <Grid2 container spacing={1} key={index} sx={{ mb: 1 }}>
              <Grid2 item xs={5}>
                <TextField
                  label="Nombre del Campo"
                  name="field"
                  value={extra.field}
                  onChange={(e) => handleExtraChange(index, e)}
                  fullWidth
                />
              </Grid2>
              <Grid2 item xs={5}>
                <TextField
                  label="Valor"
                  name="value"
                  value={formatNumber(extra.value)}
                  onChange={(e) => handleExtraChange(index, e)}
                  fullWidth
                />
              </Grid2>
              <Grid2 item xs={2}>
                <IconButton onClick={() => handleRemoveExtra(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid2>
            </Grid2>
          ))}

          <Grid2 item xs={12}>
            <Button variant="outlined" onClick={handleAddExtra}>Agregar campo extra</Button>
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