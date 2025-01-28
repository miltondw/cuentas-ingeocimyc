import {
  Button,
  Container,
  Grid2,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import PropTypes from "prop-types";

const FormCreate = ({ id }) => {
  const navigate = useNavigate();
  const fields = [
    { label: "Solicitante", name: "solicitante" },
    { label: "Nombre Del Proyecto", name: "nombreProyecto" },
    { label: "Obrero En Campo", name: "obrero" },
    { label: "Costo Del Proyecto", name: "costoServicio" },
    { label: "Abono", name: "abono" },
    { label: "Gasto De Camioneta", name: "gastoCamioneta" },
    { label: "Gastos De Campo", name: "gastosCampo" },
    { label: "Pago De Obreros", name: "pagoObreros" },
    { label: "Pago De Comidas", name: "comidas" },
    { label: "Pago de Transporte", name: "transporte" },
    { label: "Gastos Varios", name: "gastosVarios" },
    { label: "Pago De Peajes", name: "peajes" },
    { label: "Pago De Combustible", name: "combustible" },
    { label: "Pago De Hospedaje", name: "hospedaje" },
  ];
  const [formData, setFormData] = useState({
    fecha: "",
    solicitante: "",
    nombreProyecto: "",
    obrero: "",
    costoServicio: null,
    abono: null,
    gastoCamioneta: null,
    gastosCampo: null,
    pagoObreros: null,
    comidas: null,
    transporte: null,
    gastosVarios: null,
    peajes: null,
    combustible: null,
    hospedaje: null,
  });

  useEffect(() => {
    if (id) {
      const data = JSON.parse(localStorage.getItem("formData"));
      const project = data.find((item) => item.id === id);
      if (project) {
        setFormData(project);
      }
    }
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    const unformattedValue = value.replace(/\./g, "");
    const isNumeric = (value) => {
      return !isNaN(parseFloat(value)) && isFinite(value);
    };

    setFormData({
      ...formData,
      [name]: !isNumeric(unformattedValue)
        ? unformattedValue
        : Number(unformattedValue),
    });
  };
  const formatNumber = (value) => {
    if (!value) return "";
    const stringValue = value.toString();
    const reversedString = stringValue.split("").reverse().join("");
    const formattedReversed = reversedString.replace(
      /\d{3}(?=\d)/g,
      (match) => match + "."
    );
    const formattedString = formattedReversed.split("").reverse().join("");
    return formattedString;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = JSON.parse(localStorage.getItem("formData")) || [];
    if (id) {
      const updatedData = data.map((item) =>
        item.id === id ? formData : item
      );
      localStorage.setItem("formData", JSON.stringify(updatedData));
    } else {
      formData.id = uuidv4();
      data.push(formData);
      localStorage.setItem("formData", JSON.stringify(data));
    }
    navigate("/view");
  };

  const calculateTotalGastos = () => {
    const {
      gastoCamioneta,
      gastosCampo,
      pagoObreros,
      comidas,
      transporte,
      gastosVarios,
      peajes,
      combustible,
      hospedaje,
    } = formData;
    return (
      gastoCamioneta +
      gastosCampo +
      pagoObreros +
      comidas +
      transporte +
      gastosVarios +
      peajes +
      combustible +
      hospedaje
    );
  };

  const calculateUtilidad = () => {
    return formData.costoServicio - calculateTotalGastos();
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
      <form onSubmit={handleSubmit}>
        <Typography variant="h2" gutterBottom color="#000">
          {id ? "Actualizar Cuenta de Proyecto" : "Crear Cuenta de Proyecto"}
        </Typography>
        <Grid2
          container
          spacing={2}
          justifyContent={"center"}
          style={{
            width: "80%",
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            placeItems: "center",
            margin: "0 auto",
          }}
        >
          <Grid2 item xs={6} sm={3}>
            <TextField
              type="date"
              name="fecha"
              value={formData.fecha ?? ""}
              onChange={handleChange}
              slotProps={{
                shrink: true,
              }}
            />
          </Grid2>
          {fields.map((field) => (
            <Grid2 item xs={6} sm={3} key={field.name}>
              <TextField
                label={field.label}
                type={field.type}
                name={field.name}
                value={formatNumber(formData[field.name]) ?? ""}
                onChange={handleChange}
                slotProps={{
                  startAdornment: field.type === "text" && (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid2>
          ))}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ gridArea: " 6 / 2" }}
          >
            {id ? "Actualizar" : "Agregar"}
          </Button>
        </Grid2>
      </form>
      {id && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h5" gutterBottom color="#000">
            Total de Gastos: ${formatNumber(calculateTotalGastos())}
          </Typography>
          <Typography variant="h5" gutterBottom color="#000">
            Utilidad: ${formatNumber(calculateUtilidad())}
          </Typography>
        </div>
      )}
    </Container>
  );
};
FormCreate.propTypes = {
  id: PropTypes.string,
};

export default FormCreate;
