import { useEffect, useState, useMemo } from "react";
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
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../../api";

// Función para formatear números con el locale español
const formatNumber = (value) => new Intl.NumberFormat("es-ES").format(value);

// Transforma la data recibida en la forma que queremos mostrarla
const transformData = (data) => {
  return data.map((item) => {
    const date = new Date(item.mes);
    // Forzamos el formateo en UTC para evitar la conversión a la zona local
    const formattedMonth = date.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    // Obtenemos los campos de gasto, excluyendo "gasto_empresa_id" y "mes"
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

const TablaGastosEmpresa = () => {
  const [gastos, setGastos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  // Carga los gastos desde la API cada vez que cambia la página
  useEffect(() => {
    const fetchGastos = async () => {
      try {
        const response = await api.get("/gastos-mes/", {
          params: { page: currentPage, limit: rowsPerPage },
        });
        const { gastos, total } = response.data.data;
        setGastos(gastos);
        setTotalPages(Math.ceil(total / rowsPerPage));
      } catch (error) {
        console.error("Error al obtener los gastos:", error);
      }
    };
    fetchGastos();
  }, [currentPage]);

  // Transformamos la data solo cuando "gastos" cambie
  const gastosPorMes = useMemo(() => transformData(gastos), [gastos]);

  // Filtramos por mes seleccionado (si se selecciona alguno)
  const filteredData = useMemo(() => {
    if (!selectedDate) return gastosPorMes;
    const selected = new Date(selectedDate);
    return gastosPorMes.filter(({ originalDate }) => {
      const date = new Date(originalDate);
      return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth()
      );
    });
  }, [selectedDate, gastosPorMes]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: "90vw",
        mx: "auto",
        my: 3,
        p: 2,
      }}
    >
      <Typography variant="h2" gutterBottom>
        Gastos de la Empresa por Mes
      </Typography>
      <TextField
        type="date"
        label="Filtrar por Mes"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setCurrentPage(1);
        }}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        margin="normal"
      />
      {filteredData.map((mesData) => (
        <Box key={mesData.id} sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {mesData.mesDeGasto}{" "}
            <Link to={`/crear-gasto-mes/${mesData.id}`}>Ver Detalles</Link>
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
                <TableCell sx={{ fontWeight: "bold" }}>
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
        </Box>
      ))}
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => setCurrentPage(page)}
        color="primary"
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
    </TableContainer>
  );
};

export default TablaGastosEmpresa;
