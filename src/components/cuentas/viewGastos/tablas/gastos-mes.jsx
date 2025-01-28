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
import { useState } from "react";
import { calculateTotalGastos, formatNumber } from "../../utils";
import PropTypes from "prop-types";
import TablaGastosEmpresa from "./gasto-mes";

const gastosEmpresa = [
  { name: "pago-de-salarios", value: 1680000 },
  { name: "pago-de-luz", value: 29000 },
  { name: "pago-de-arriendo", value: 540000 },
  { name: "pago-de-internet", value: 85000 },
  { name: "pago-de-salud", value: 480000 },
];

const calculateGastosEmpresa = () => {
  return gastosEmpresa.reduce(
    (total, gasto) => total + parseFloat(gasto.value),
    0
  );
};

const Tabla2 = ({ listProjects }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const calculateMonthlyTotals = () => {
    const monthlyTotals = {};

    listProjects.forEach((project) => {
      const month = new Date(project.fecha).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!monthlyTotals[month]) {
        monthlyTotals[month] = {
          totalGastosProyectos: 0,
          totalIngresos: 0,
          gastosEmpresa: calculateGastosEmpresa(),
        };
      }

      monthlyTotals[month].totalGastosProyectos +=
        calculateTotalGastos(project);
      monthlyTotals[month].totalIngresos += project.costoServicio || 0;
    });

    return monthlyTotals;
  };

  const calculateGrandTotals = (monthlyTotals) => {
    let totalGastosProyectos = 0;
    let totalIngresos = 0;
    let totalGastosEmpresa = calculateGastosEmpresa();

    Object.values(monthlyTotals).forEach((totals) => {
      totalGastosProyectos += totals.totalGastosProyectos;
      totalIngresos += totals.totalIngresos;
    });

    return {
      totalGastosProyectos,
      totalIngresos,
      totalGastosEmpresa,
    };
  };

  const monthlyTotals = calculateMonthlyTotals();
  const grandTotals = calculateGrandTotals(monthlyTotals);

  const months = Object.entries(monthlyTotals);
  const totalPages = Math.ceil(months.length / rowsPerPage);
  const paginatedMonths = months.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <TableContainer
        style={{
          maxWidth: "90vw",
          position: "relative",
          margin: "3rem auto",
        }}
        component={Paper}
      >
        <Typography variant="h2" gutterBottom color="#000">
          Utilidades por Mes
        </Typography>
        <Table sx={{ minWidth: 650 }} aria-label="monthly totals table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Mes
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Gastos de Proyectos
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Gastos de la Empresa
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Total Gastos
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Utilidad Neta
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMonths.map(([month, totals], index) => {
              const totalGastos =
                totals.totalGastosProyectos + totals.gastosEmpresa;
              const utilidadNeta = totals.totalIngresos - totalGastos;

              return (
                <TableRow key={index}>
                  <TableCell sx={{ minWidth: 100 }}>{month}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    {`$ ${formatNumber(totals.totalGastosProyectos)}`}
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    {`$ ${formatNumber(totals.gastosEmpresa)}`}
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    {`$ ${formatNumber(totalGastos)}`}
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    {`$ ${formatNumber(utilidadNeta)}`}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                Totales
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                {`$ ${formatNumber(grandTotals.totalGastosProyectos)}`}
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                {`$ ${formatNumber(grandTotals.totalGastosEmpresa)}`}
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                {`$ ${formatNumber(
                  grandTotals.totalGastosProyectos +
                    grandTotals.totalGastosEmpresa
                )}`}
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: "bold" }}>
                {`$ ${formatNumber(
                  grandTotals.totalIngresos -
                    (grandTotals.totalGastosProyectos +
                      grandTotals.totalGastosEmpresa)
                )}`}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "1rem 0",
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <TablaGastosEmpresa />
    </>
  );
};

Tabla2.propTypes = {
  listProjects: PropTypes.arrayOf(
    PropTypes.shape({
      fecha: PropTypes.string.isRequired,
      costoServicio: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Tabla2;
