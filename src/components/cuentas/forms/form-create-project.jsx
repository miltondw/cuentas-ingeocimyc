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
} from "@mui/material";
import Grid2 from "@mui/material/Grid2"; // Versión estable de Grid2
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api";

// Objeto de gasto por defecto con un array para campos extras.
const defaultGasto = {
  camioneta: "",
  campo: "",
  obreros: "",
  comidas: "",
  otros: "",
  peajes: "",
  combustible: "",
  hospedaje: "",
  extras: [], // Cada extra será un objeto { field: "", value: "" }
};

// Estado por defecto para un proyecto nuevo, con una única fila de gastos.
const defaultProject = {
  fecha: "",
  solicitante: "",
  nombre_proyecto: "",
  costo_servicio: "",
  abono: "",
  factura: "",
  metodo_de_pago: "", // Se reemplazará por un select
  valor_iva: "",
  retencionIva: false,
  gastos: [defaultGasto],
};

const FormCreateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(defaultProject);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

//filds
  const filds1=[
    ["Solicitante","solicitante"],
    ["Nombre del Proyecto","nombre_proyecto"],
    ["Abono","abono"],["Factura","factura"]
  ]
  const fildsGastos=[
    "Camioneta",
    "Campo",
    "Obreros",
    "Comidas",
    "Otros",
    "Peajes",
    "Combustible",
    "Hospedaje"
  ]

  // Función para formatear un número con separadores de miles
  const formatNumber = (value) => {
    return Number(value).toLocaleString("en-US");
  };

  // Función para eliminar los separadores de miles y convertir a número
  const unformatNumber = (value) => {
    return Number(value.replace(/,/g, ""));
  };
  // Cargar el proyecto para actualizarlo, si se recibe un id
  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await api.get(`/projects/${id}`);
          if (response.data.success) {
            const data = response.data.data;
            const formattedFecha = data.fecha
              ? new Date(data.fecha).toISOString().substring(0, 10)
              : "";
            setProject({
              ...data,
              fecha: formattedFecha,
              solicitante: data.solicitante || "",
              nombre_proyecto: data.nombre_proyecto || "",
              costo_servicio: data.costo_servicio || "",
              abono: data.abono || "",
              factura: data.factura || "",
              metodo_de_pago: data.metodo_de_pago || "",
              valor_iva: data.valor_iva || "",
              retencionIva: data.valor_iva ? true : false,
              // Se usa la primera fila de gastos; si no existe, se usa el default.
              gastos:
                data.gastos && data.gastos.length > 0
                  ? data.gastos
                  : [defaultGasto],
            });
          }
        } catch (err) {
          setError("Error al cargar el proyecto", err);
        }
      };
      fetchProject();
    }
  }, [id]);

  // Actualiza los campos principales del proyecto
const handleChange = (e) => {
  const { name, value } = e.target;
  const unformattedValue = unformatNumber(value); // Elimina las comas
  setProject((prev) => ({
    ...prev,
    [name]: unformattedValue, // Guarda el valor sin comas
  }));
};

  // Actualiza los campos fijos del único gasto (índice 0)
const handleGastoChange = (e) => {
  const { name, value } = e.target;
  const unformattedValue = unformatNumber(value); // Elimina las comas
  setProject((prev) => {
    const newGasto = { ...prev.gastos[0], [name]: unformattedValue }; // Guarda el valor sin comas
    return { ...prev, gastos: [newGasto] };
  });
};

  // Actualiza un campo extra (del array extras) para la única fila de gasto
  const handleExtraChange = (extraIndex, e) => {
    const { name, value } = e.target; // name será "field" o "value"
    setProject((prev) => {
      const currentExtras = prev.gastos[0].extras || [];
      const newExtras = currentExtras.map((extra, i) =>
        i === extraIndex ? { ...extra, [name]: value } : extra
      );
      const newGasto = { ...prev.gastos[0], extras: newExtras };
      return { ...prev, gastos: [newGasto] };
    });
  };

  // Agrega un nuevo campo extra a la única fila de gasto
  const handleAddExtra = () => {
    setProject((prev) => {
      const currentExtras = prev.gastos[0].extras || [];
      const newExtras = [...currentExtras, { field: "", value: "" }];
      const newGasto = { ...prev.gastos[0], extras: newExtras };
      return { ...prev, gastos: [newGasto] };
    });
  };

  // Elimina un campo extra de la única fila de gasto
  const handleRemoveExtra = (extraIndex) => {
    setProject((prev) => {
      const currentExtras = prev.gastos[0].extras || [];
      const newExtras = currentExtras.filter((_, i) => i !== extraIndex);
      const newGasto = { ...prev.gastos[0], extras: newExtras };
      return { ...prev, gastos: [newGasto] };
    });
  };

  // Maneja el checkbox para retención de IVA
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setProject((prev) => ({
      ...prev,
      retencionIva: checked,
      // Si se desmarca, limpiamos el valor de IVA
      valor_iva: checked ? prev.valor_iva : "",
    }));
  };

  // Al enviar el formulario, se arma el payload. Se fusionan los campos fijos y los extras del único gasto.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const gasto = project.gastos[0];
    const fixed = {
      camioneta: Number(gasto.camioneta),
      campo: Number(gasto.campo),
      obreros: Number(gasto.obreros),
      comidas: Number(gasto.comidas),
      otros: Number(gasto.otros),
      peajes: Number(gasto.peajes),
      combustible: Number(gasto.combustible),
      hospedaje: Number(gasto.hospedaje),
    };
    const extras = (gasto.extras || []).reduce((acc, extra) => {
      if (extra.field.trim() !== "") {
        acc[extra.field.trim()] = Number(extra.value);
      }
      return acc;
    }, {});
    const gastoPayload = { ...fixed, ...extras };

    const payload = {
      ...project,
      costo_servicio: Number(project.costo_servicio),
      abono: Number(project.abono),
      factura: project.factura,
      metodo_de_pago: project.metodo_de_pago,
      valor_iva: project.retencionIva ? Number(project.valor_iva) : 0,
      gastos: [gastoPayload],
    };

    try {
      if (id) {
        await api.put(`/projects/${project.proyecto_id}`, payload);
      } else {
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
          {/* Campos principales */}
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

          {
            filds1.map((fild,i)=>(
                    <Grid2 item xs={12} sm={6}>
                      <TextField
                        label={fild[0]}
                        name={fild[1]}
                        value={project[1]}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid2>
              ))
          }
          <Grid2 item xs={12} sm={6}>
            <TextField
              select
              label="Método de Pago"
              name="metodo_de_pago"
              value={project.metodo_de_pago}
              onChange={handleChange}
              fullWidth
              slotProps={{
                select: { native: true },
                inputLabel: { shrink: true },
              }}
            >
              <option value="">Seleccione</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </TextField>
          </Grid2>
          <Grid2 item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={project.retencionIva}
                  onChange={handleCheckboxChange}
                />
              }
              label="¿Aplica retención de IVA?"
            />
          </Grid2>
          {project.retencionIva && (
            <Grid2 item xs={12} sm={6}>
              <TextField
                label="Valor IVA"
                type="number"
                name="valor_iva"
                value={formatNumber(project.valor_iva)}
                onChange={handleChange}
                fullWidth
              />
            </Grid2>
          )}
        </Grid2>
        <Typography variant="h4" sx={{ mt: 3, mb: 2 }}>
          Gastos
        </Typography>
        <Grid2
          container
          spacing={2}
          sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
        >
          <Typography variant="h6" sx={{ width: "100%" }}>
            Gastos
          </Typography>
          {/* Campos fijos del gasto (se usa el primer objeto del arreglo) */}

          {
            fildsGastos.map((fild,i)=>(
          <Grid2 item xs={12} sm={3}>
            <TextField
              label={fild}
              type="number"
              name={fild.toLowerCase()}
              value={formatNumber(project.gastos[0][fild.toLowerCase()]) || ""}
              onChange={handleGastoChange}
              fullWidth
            />
          </Grid2>
              ))
          }
          {/* Renderizamos los campos extras existentes */}
          {project.gastos[0]?.extras?.map((extra, extraIndex) => (
            <Grid2
              container
              spacing={1}
              key={extraIndex}
              sx={{ mb: 1, pl: 1, borderLeft: "2px solid #ccc" }}
            >
              <Grid2 item xs={5}>
                <TextField
                  label="Nombre del Campo"
                  name="field"
                  value={extra.field}
                  onChange={(e) => handleExtraChange(extraIndex, e)}
                  fullWidth
                />
              </Grid2>
              <Grid2 item xs={5}>
                <TextField
                  label="Valor"
                  type="number"
                  name="value"
                  value={formatNumber(extra.value)}
                  onChange={(e) => handleExtraChange(extraIndex, e)}
                  fullWidth
                />
              </Grid2>
              <Grid2 item xs={2}>
                <IconButton onClick={() => handleRemoveExtra(extraIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Grid2>
            </Grid2>
          ))}
          <Grid2 item xs={12}>
            <Button variant="outlined" onClick={handleAddExtra}>
              Agregar campo extra
            </Button>
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2}>
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
