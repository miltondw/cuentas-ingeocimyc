import { useEffect, useState } from "react";
import { TextField, Button, Container, Typography, Box, IconButton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import api from "../../../api";

const defaultData = {
  mes: "",
  salarios: "1680000",
  luz: "29000",
  agua: "29000",
  arriendo: "540000",
  internet: "85000",
  salud: "480000",
  otros_campos: [],
};

const FormCreateMonth = () => {
  const [formData, setFormData] = useState(defaultData);
  const navigate = useNavigate();
  const { id } = useParams();

  // Si se pasa un id, se asume que se está actualizando un registro existente,
  // por lo que se hace la consulta a la API para obtener los datos.
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const response = await api.get(`/gastos-mes/${id}`);
          if (response.data) {
            const { mes, salarios, luz, agua, arriendo, internet, salud, otros_campos } =
              response.data;

            // Convertir el valor de "mes" a formato YYYY-MM-DD para el input tipo date
            const formattedMes = mes
              ? new Date(mes).toISOString().split("T")[0] // Formato YYYY-MM-DD
              : "";
console.log(mes,formattedMes)
            setFormData({
              mes: formattedMes,
              salarios: salarios?.toString() || "",
              luz: luz?.toString() || "",
              agua: agua?.toString() || "",
              arriendo: arriendo?.toString() || "",
              internet: internet?.toString() || "",
              salud: salud?.toString() || "",
              otros_campos: otros_campos || [],
            });
          }
        } catch (error) {
          console.error("Error fetching month data:", error);
        }
      };
      fetchData();
    }
  }, [id]);

  // Maneja el cambio de cualquier campo del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja el cambio de los campos extras
  const handleExtraFieldChange = (index, field, value) => {
    const updatedExtras = [...formData.otros_campos];
    updatedExtras[index][field] = value;
    setFormData((prev) => ({ ...prev, otros_campos: updatedExtras }));
  };

  // Agrega un nuevo campo extra
  const addExtraField = () => {
    setFormData((prev) => ({
      ...prev,
      otros_campos: [...prev.otros_campos, { nombre: "", monto: "" }],
    }));
  };

  // Elimina un campo extra
  const removeExtraField = (index) => {
    const updatedExtras = formData.otros_campos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, otros_campos: updatedExtras }));
  };

  // Al enviar el formulario, se decide si se crea o actualiza según la presencia de id.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        otros_campos: formData.otros_campos.filter(
          (campo) => campo.nombre && campo.monto
        ),
      };
      if (id) {
        // Actualiza el registro
        await api.put(`/gastos-mes/${id}`, payload);
      } else {
        // Crea un nuevo registro
        await api.post("/gastos-mes", payload);
      }
      navigate("/gastos");
    } catch (error) {
      console.error("Error submitting month data:", error);
    }
  };

  return (
    <Container
      sx={{
        boxShadow: 3,
        p: 3,
        borderRadius: 2,
        my: 3,
      }}
    >
      <Typography variant="h3" gutterBottom color="primary">
        {id ? "Actualizar" : "Crear"} Gastos de Costos Fijos Mensuales
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
          width: "80%",
          mx: "auto",
        }}
      >
        <TextField
          label="Mes de Gastos"
          name="mes"
          type="date"
          value={formData.mes}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Pago de Salarios"
          name="salarios"
          type="number"
          value={formData.salarios}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Pago de Luz"
          name="luz"
          type="number"
          value={formData.luz}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Pago de Agua"
          name="agua"
          type="number"
          value={formData.agua}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Pago de Arriendo"
          name="arriendo"
          type="number"
          value={formData.arriendo}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Pago de Internet"
          name="internet"
          type="number"
          value={formData.internet}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Pago de Salud"
          name="salud"
          type="number"
          value={formData.salud}
          onChange={handleChange}
          fullWidth
        />

        {/* Campos extras dinámicos */}
        {formData.otros_campos.map((campo, index) => (
          <Box
            key={index}
            sx={{
              gridColumn: "span 3",
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Nombre del Gasto Extra"
              value={campo.nombre}
              onChange={(e) =>
                handleExtraFieldChange(index, "nombre", e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Monto del Gasto Extra"
              type="number"
              value={campo.monto}
              onChange={(e) =>
                handleExtraFieldChange(index, "monto", e.target.value)
              }
              fullWidth
            />
            <IconButton
              onClick={() => removeExtraField(index)}
              color="error"
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
        ))}

        {/* Botón para agregar campos extras */}
        <Box
          sx={{
            gridColumn: "span 3",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addExtraField}
          >
            Agregar Gasto Extra
          </Button>
        </Box>

        {/* Botón de envío */}
        <Box
          sx={{
            gridColumn: "span 3",
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button type="submit" variant="contained" color="secondary">
            {id ? "Actualizar" : "Crear"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormCreateMonth;