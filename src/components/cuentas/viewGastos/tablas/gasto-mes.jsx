import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";

// Función para obtener los datos de localStorage
const getGastosEmpresaFromLocalStorage = () => {
  const data = JSON.parse(localStorage.getItem("data-months")) || [];
  return data.map((monthData) => {
    const mes =
      monthData.fields.find((field) => field.name === "mes-de-gastos")?.value ||
      "Mes Desconocido";
    const gastos = monthData.fields
      .filter((field) => field.name !== "mes-de-gastos")
      .map((field) => ({
        name: field.name.replace(/-/g, " ").toUpperCase(),
        value: parseFloat(field.value) || 0,
      }));
    const mesDeGastos = (mes) => {
      const nameMonths = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return `Gasto de ${nameMonths[Number(mes.split("-")[1]) - 1]} ${
        mes.split("-")[0]
      }`;
    };
    const mesDeGasto = mesDeGastos(mes);
    return { mesDeGasto, gastos, id: monthData.id, mesOriginal: mes };
  });
};

const TablaGastosEmpresa = () => {
  const gastosPorMes = getGastosEmpresaFromLocalStorage();
  const [currentPage, setCurrentPage] = useState(1); // Estado para la paginación
  const [selectedDate, setSelectedDate] = useState(""); // Estado para el filtro por fecha

  const rowsPerPage = 2; // Cantidad de filas por página

  // Filtrar los datos por mes y año de la fecha seleccionada
  const filteredData = selectedDate
    ? gastosPorMes.filter((mesData) => {
        const [selectedYear, selectedMonth] = selectedDate.split("-");
        const [dataYear, dataMonth] = mesData.mesOriginal.split("-");
        return (
          selectedYear === dataYear &&
          Number(selectedMonth) === Number(dataMonth)
        );
      })
    : gastosPorMes;

  // Pagination: calcular los datos visibles
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <TableContainer
      component={Paper}
      style={{
        maxWidth: "90vw",
        margin: "3rem auto",
        padding: "20px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h2" gutterBottom color="#000">
        Gastos de la Empresa por Mes
      </Typography>

      {/* Filtro por fecha */}
      <TextField
        type="date"
        label="Filtrar por Mes"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setCurrentPage(1); // Reiniciar a la primera página al filtrar
        }}
        margin="normal"
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />

      {/* Tabla con datos paginados */}
      {paginatedData.map((mesData, index) => (
        <div key={index} style={{ marginBottom: "2rem" }}>
          <Typography variant="h4" gutterBottom>
            {mesData.mesDeGasto}{" "}
            <Link to={`/${mesData.id}`} style={{ color: "blue" }}>
              Ver Detalles
            </Link>
          </Typography>
          <Table sx={{ minWidth: 650 }} aria-label="gastos empresa table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                  Concepto
                </TableCell>
                <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                  Valor Mensual
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mesData.gastos.map((gasto, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ minWidth: 100 }}>{gasto.name}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    {`$ ${formatNumber(gasto.value)}`}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                  Total Gastos
                </TableCell>
                <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                  {`$ ${formatNumber(
                    mesData.gastos.reduce(
                      (total, gasto) => total + gasto.value,
                      0
                    )
                  )}`}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}

      {/* Paginación */}
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => setCurrentPage(page)}
        color="primary"
        style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}
      />
    </TableContainer>
  );
};

// Función para formatear números
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

export default TablaGastosEmpresa;
