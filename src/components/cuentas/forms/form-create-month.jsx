import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const fieldsDefault = [
  { name: "MES DE GASTOS", value: "" },
  { name: "PAGO DE SALARIOS", value: "1680000" },
  { name: "PAGO DE LUZ", value: "29000" },
  { name: "PAGO DE ARRIENDO", value: "540000" },
  { name: "PAGO DE INTERNET", value: "85000" },
  { name: "PAGO DE SALUD", value: "480000" },
];

const FormCreateMonth = ({ id }) => {
  const [fields, setFields] = useState(fieldsDefault);
  const navigate = useNavigate();
  useEffect(() => {
    if (id) {
      const data = JSON.parse(localStorage.getItem("data-months")) || [];
      const projectMonths = data.find((item) => item.id === id);
      if (projectMonths) {
        setFields(projectMonths.fields);
      }
    }
  }, [id]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newFields = [...fields];
    newFields[index][name] = value;
    setFields(newFields);
  };

  const handleAddField = () => {
    setFields([...fields, { name: "", value: "" }]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = JSON.parse(localStorage.getItem("data-months")) || [];
    const newFields = fields.map((field) => ({
      name: field.name.toLowerCase().split(" ").join("-"),
      value: field.value,
    }));

    if (id) {
      const updatedData = data.map((item) =>
        item.id === id ? { ...item, fields: newFields } : item
      );
      localStorage.setItem("data-months", JSON.stringify(updatedData));
    } else {
      const newData = { id: uuidv4(), fields: newFields };
      data.push(newData);
      localStorage.setItem("data-months", JSON.stringify(data));
    }
    navigate("/view");
  };

  return (
    <Container
      style={{
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        borderRadius: "10px",
        margin: "20px auto",
      }}
    >
      <Typography variant="h3" gutterBottom color="#000">
        {id ? "Actualizar" : "Crear "} Gastos de costos fijos Mensuales
      </Typography>
      <form
        style={{
          width: "80%",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          margin: "1rem auto",
        }}
        onSubmit={handleSubmit}
      >
        {fields.map((field, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            {index < fieldsDefault.length ? (
              <>
                <TextField
                  label={field.name.toUpperCase().split("-").join(" ")}
                  name="value"
                  value={field.value ?? ""}
                  onChange={(event) => handleChange(index, event)}
                  margin="normal"
                  variant="outlined"
                  type={index === 0 ? "date" : "number"}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </>
            ) : (
              <>
                <TextField
                  label="Nombre"
                  name="name"
                  value={field.name ?? ""}
                  onChange={(event) => handleChange(index, event)}
                  margin="normal"
                  variant="outlined"
                  style={{ marginRight: "1rem" }}
                />
                <TextField
                  label="Valor"
                  name="value"
                  value={field.value ?? ""}
                  onChange={(event) => handleChange(index, event)}
                  margin="normal"
                  variant="outlined"
                  type="number"
                />
                <IconButton onClick={() => handleRemoveField(index)}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        ))}
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            type="button"
            onClick={handleAddField}
            variant="contained"
            color="primary"
          >
            Añadir Campo
          </Button>
          <Button type="submit" variant="contained" color="secondary">
            {id ? "Actualizar" : "Crear"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

FormCreateMonth.propTypes = {
  id: PropTypes.string,
};

export default FormCreateMonth;
