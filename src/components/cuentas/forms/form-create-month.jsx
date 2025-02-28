import { useEffect, useState } from "react";
import { TextField, Button, Container, Typography, Box, IconButton } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import api from "../../../api";

const defaultData = {
  mes: "",
  salarios: 1680000,
  luz: 29000,
  agua: 29000,
  arriendo: 540000,
  internet: 85000,
  salud: 480000,
  extras: [], // Array para renderización en el formulario
};

const formatNumber = (value) => (value !== "" ? Number(value).toLocaleString() : "");
const parseNumber = (value) => value.replace(/,/g, "");

const FormCreateMonth = () => {
  const [formData, setFormData] = useState(defaultData);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/gastos-mes/${id}`);
        console.log(res.data.data)
        const data = res.data.data; // La respuesta ya no está envuelta en "data"

        // Convertir "otros_campos" (objeto) a "extras" (array para renderización)
        const extras = data.otros_campos
          ? Object.entries(data.otros_campos).map(([field, value]) => ({
            field,
            value: value.toString(),
          }))
          : [];

        const formattedData = {
          ...data,
          mes: data.mes ? new Date(data.mes).toISOString().split("T")[0] : "",
          extras, // Usamos "extras" para renderización
        };
        setFormData(formattedData);
      } catch (error) {
        console.error("Error fetching month data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name !== "mes" ? parseNumber(value) : value,
    }));
  };

  const handleExtraChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedExtras = [...prev.extras];
      updatedExtras[index] = {
        ...updatedExtras[index],
        [name]: name === "value" ? parseNumber(value) : value,
      };
      return { ...prev, extras: updatedExtras };
    });
  };

  const addExtraField = () => {
    setFormData((prev) => ({
      ...prev,
      extras: [...prev.extras, { field: "", value: "" }],
    }));
  };

  const removeExtraField = (index) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir el arreglo de extras a un objeto { key: value }
      const otrosCampos = formData.extras.reduce((acc, item) => {
        if (item.field && item.value) acc[item.field.split(" ").join("_")] = Number(item.value);
        return acc;
      }, {});

      const payload = {
        ...formData,
        mes: formData.mes,
        otros_campos: Object.keys(otrosCampos).length > 0 ? otrosCampos : null,
      };
      delete payload.extras; // Eliminar el campo "extras" antes de enviar

      const endpoint = id ? `/gastos-mes/${id}` : "/gastos-mes";
      await api[id ? "put" : "post"](endpoint, payload);

      navigate("/gastos");
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  return (
    <Container sx={{ boxShadow: 3, p: 3, borderRadius: 2, my: 3 }}>
      <Typography variant="h3" gutterBottom color="primary">
        {id ? "Actualizar" : "Crear"} Gastos Mensuales
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        {Object.keys(defaultData)
          .filter((key) => key !== "extras")
          .map((key) => (
            <TextField
              key={key}
              label={key.replace(/_/g, " ").toUpperCase()}
              name={key}
              type={key === "mes" ? "date" : "text"}
              value={key !== "mes" ? formatNumber(formData[key]) : formData[key]}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          ))}

        {formData.extras.map((extra, index) => (
          <Box
            key={index}
            sx={{ gridColumn: "span 3", display: "flex", gap: 2, alignItems: "center" }}
          >
            <TextField
              label="Nombre del gasto"
              name="field"
              value={extra.field}
              onChange={(e) => handleExtraChange(index, e)}
              fullWidth
            />
            <TextField
              label="Monto"
              name="value"
              value={formatNumber(extra.value)}
              onChange={(e) => handleExtraChange(index, e)}
              fullWidth
            />
            <IconButton onClick={() => removeExtraField(index)} color="error" sx={{ height: "fit-content" }}>
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ gridColumn: "span 3", display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={addExtraField}>
            Agregar gasto
          </Button>

          <Button type="submit" variant="contained" color="primary" sx={{ ml: "auto" }}>
            {id ? "Actualizar" : "Guardar"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormCreateMonth;