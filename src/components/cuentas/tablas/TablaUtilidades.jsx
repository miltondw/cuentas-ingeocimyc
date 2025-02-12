import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination,
  Box,
} from "@mui/material";
import api from "../../../api";

// Función para formatear números al estilo español
const formatNumber = (value) => {
  const number = parseFloat(value) || 0;
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
  }).format(number);
};

// Función para formatear la fecha en UTC y mostrar solo mes y año
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const TablaResumen = () => {
  const [resumen, setResumen] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 5; // Según el limit que retorna la API

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const response = await api.get("/resumen", {
          params: { page: currentPage, limit: rowsPerPage },
        });
        const data = response.data.data;
        setResumen(data.resumen || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error al obtener el resumen:", error);
      }
    };

    fetchResumen();
  }, [currentPage]);

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
      <Typography variant="h4" gutterBottom>
        Resumen Mensual
      </Typography>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Mes</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Gastos de Proyectos
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Gastos de la Empresa
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Total Gastos</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Utilidad Neta</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {resumen.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(item.mes)}</TableCell>
              <TableCell>{`$ ${formatNumber(
                item["Gastos de Proyectos"]
              )}`}</TableCell>
              <TableCell>{`$ ${formatNumber(
                item["Gastos de la Empresa"]
              )}`}</TableCell>
              <TableCell>{`$ ${formatNumber(item["Total Gastos"])}`}</TableCell>
              <TableCell>{`$ ${formatNumber(
                item["Utilidad Neta"]
              )}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>
    </TableContainer>
  );
};

export default TablaResumen;
