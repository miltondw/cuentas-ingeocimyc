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

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res= await api.get(`/gastos-mes/${id}`);
        const data=res.data.data
        
        const formattedData = {
          ...data,
          mes: data.mes ? new Date(data.mes).toISOString().split("T")[0] : "",
          otros_campos: data.otros_campos || []
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExtraField = (index, field, value) => {
    const nuevosCampos = formData.otros_campos.map((campo, i) => 
      i === index ? { ...campo, [field]: value } : campo
    );
    setFormData(prev => ({ ...prev, otros_campos: nuevosCampos }));
  };

  const addExtraField = () => {
    setFormData(prev => ({
      ...prev,
      otros_campos: [...prev.otros_campos, { nombre: "", monto: "" }]
    }));
  };

  const removeExtraField = (index) => {
    const nuevosCampos = formData.otros_campos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, otros_campos: nuevosCampos }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Transformar los extras correctamente
    const otrosCampos = formData.otros_campos
      .filter(item => item.nombre && item.monto)
      .map(item => ({ [item.nombre]: Number(item.monto) }));

    const payload = {
      ...formData,
      mes: `${formData.mes}-01`, // Forzar formato YYYY-MM-DD
      otros_campos: otrosCampos.length > 0 ? otrosCampos : null
    };

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
          mx: "auto"
        }}
      >
        {Object.keys(defaultData)
          .filter(key => key !== "otros_campos")
          .map((key) => (
            <TextField
              key={key}
              label={key.replace(/_/g, " ").toUpperCase()}
              name={key}
              type={key === "mes" ? "date" : "number"}
              value={formData[key]}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          ))}

        {formData.otros_campos.map((campo, index) => (
          <Box
            key={index}
            sx={{
              gridColumn: "span 3",
              display: "flex",
              gap: 2,
              alignItems: "center"
            }}
          >
            <TextField
              label="Nombre del gasto"
              value={campo.nombre}
              onChange={(e) => handleExtraField(index, "nombre", e.target.value)}
              fullWidth
            />
            <TextField
              label="Monto"
              type="number"
              value={campo.monto}
              onChange={(e) => handleExtraField(index, "monto", e.target.value)}
              fullWidth
            />
            <IconButton
              onClick={() => removeExtraField(index)}
              color="error"
              sx={{ height: "fit-content" }}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ gridColumn: "span 3", display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addExtraField}
          >
            Agregar gasto
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ ml: "auto" }}
          >
            {id ? "Actualizar" : "Guardar"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormCreateMonth;