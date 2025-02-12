import { useEffect, useState } from "react";
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
import api from "../../../../api";

const TablaGastosEmpresa = () => {
  const [gastos, setGastos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const response = await api.get("/gastos-mes/", {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
        });
        setGastos(response.data.data.gastos);
        setTotalPages(Math.ceil(response.data.data.total / rowsPerPage));
      } catch (err) {
        console.error("Error al obtener los gastos:", err);
      }
    };
    fetchGastos();
  }, [currentPage]);

  const transformData = (data) => {
    return data.map((item) => {
      const date = new Date(item.mes);
      const formattedMonth = date.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });

      const gastos = Object.keys(item)
        .filter((key) => key !== "gasto_empresa_id" && key !== "mes")
        .map((key) => ({
          name: key.replace(/_/g, " ").toUpperCase(),
          value: parseFloat(item[key]),
        }));

      return {
        id: item.gasto_empresa_id,
        mesDeGasto: `Gasto de ${formattedMonth}`,
        gastos,
        originalDate: item.mes,
      };
    });
  };

  const gastosPorMes = transformData(gastos);
  const filteredData = selectedDate
    ? gastosPorMes.filter((mesData) => {
        const date = new Date(mesData.originalDate);
        const selected = new Date(selectedDate);
        return (
          date.getFullYear() === selected.getFullYear() &&
          date.getMonth() === selected.getMonth()
        );
      })
    : gastosPorMes;

  return (
    <TableContainer
      component={Paper}
      style={{ maxWidth: "90vw", margin: "3rem auto", padding: "20px" }}
    >
      <Typography variant="h2" gutterBottom>
        Gastos de la Empresa por Mes
      </Typography>
      <TextField
        type="month"
        label="Filtrar por Mes"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setCurrentPage(1);
        }}
        InputLabelProps={{ shrink: true }}
        margin="normal"
      />
      {filteredData.map((mesData) => (
        <div key={mesData.id} style={{ marginBottom: "2rem" }}>
          <Typography variant="h4" gutterBottom>
            {mesData.mesDeGasto} <Link to={`/${mesData.id}`}>Ver Detalles</Link>
          </Typography>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Concepto</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Valor Mensual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mesData.gastos.map((gasto, idx) => (
                <TableRow key={idx}>
                  <TableCell>{gasto.name}</TableCell>
                  <TableCell>{`$ ${formatNumber(gasto.value)}`}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Total Gastos</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{`$ ${formatNumber(
                  mesData.gastos.reduce(
                    (total, gasto) => total + gasto.value,
                    0
                  )
                )}`}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
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

const formatNumber = (value) => {
  return new Intl.NumberFormat("es-ES").format(value);
};

export default TablaGastosEmpresa;
