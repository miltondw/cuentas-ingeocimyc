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

const TablaUtilidades = () => {
  const [costosFijos, setCostosFijos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10; // Ajusta esto según la paginación de tu API

  useEffect(() => {
    const fetchCostosFijos = async () => {
      try {
        const response = await api.get("/gastos-mes", {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
        });
        setCostosFijos(response.data.data);
        setTotalPages(response.data.total);
      } catch (err) {
        console.error("Error al obtener los costos fijos:", err);
      }
    };

    const fetchProyectos = async () => {
      try {
        const response = await api.get("/projects?", {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
        });
        setProyectos(response.data.data);
      } catch (err) {
        console.error("Error al obtener los proyectos:", err);
      }
    };

    fetchCostosFijos();
    fetchProyectos();
  }, [currentPage, rowsPerPage]);

  const transformData = (data) => {
    return data.map((item) => {
      const date = new Date(item.mes_de_gastos);
      const formattedMonth = date.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });
      const gastos = Object.keys(item)
        .filter((key) => key !== "id" && key !== "mes_de_gastos")
        .map((key) => ({
          name: key.replace(/_/g, " ").toUpperCase(),
          value: parseFloat(item[key]),
        }));

      return {
        id: item.id,
        mesDeGasto: `Gasto de ${formattedMonth}`,
        gastos,
        originalDate: item.mes_de_gastos, // Guardamos la fecha original para el filtrado
      };
    });
  };

  const gastosPorMes = transformData(costosFijos);

  const calcularGastosProyectos = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const gastosProyectos = proyectos
      .filter((proyecto) => {
        const proyectoDate = new Date(proyecto.fecha);
        return (
          proyectoDate.getFullYear() === year &&
          proyectoDate.getMonth() === month
        );
      })
      .reduce((total, proyecto) => {
        const gastos = [
          parseFloat(proyecto.gastoCamioneta),
          parseFloat(proyecto.gastosCampo),
          parseFloat(proyecto.pagoObreros),
          parseFloat(proyecto.comidas),
          parseFloat(proyecto.transporte),
          parseFloat(proyecto.gastosVarios),
          parseFloat(proyecto.peajes),
          parseFloat(proyecto.combustible),
          parseFloat(proyecto.hospedaje),
        ];
        console.log(total, gastos);
        return total + gastos.reduce((sum, gasto) => sum + gasto, 0);
      }, 0);

    return gastosProyectos;
  };

  const calcularUtilidadNeta = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const ingresos = proyectos
      .filter((proyecto) => {
        const proyectoDate = new Date(proyecto.fecha);
        return (
          proyectoDate.getFullYear() === year &&
          proyectoDate.getMonth() === month
        );
      })
      .reduce(
        (total, proyecto) => total + parseFloat(proyecto.costoServicio),
        0
      );

    const gastosProyectos = calcularGastosProyectos(date);
    const gastosEmpresa =
      gastosPorMes
        .find((mesData) => {
          const mesDate = new Date(mesData.originalDate);
          return mesDate.getFullYear() === year && mesDate.getMonth() === month;
        })
        ?.gastos.reduce((total, gasto) => total + gasto.value, 0) || 0;

    return ingresos - (gastosProyectos + gastosEmpresa);
  };

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

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <TableContainer
      component={Paper}
      style={{
        padding: "1rem",
        display: "grid",
        placeItems: "center",
        boxShadow: " 8px -3px 1px 3px #ccc",
      }}
    >
      <Typography variant="h2" gutterBottom>
        Utilidades por Mes
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
      {paginatedData.map((mesData) => {
        const date = new Date(mesData.originalDate);
        const gastosProyectos = calcularGastosProyectos(date);
        const gastosEmpresa = mesData.gastos.reduce(
          (total, gasto) => total + gasto.value,
          0
        );
        const totalGastos = gastosProyectos + gastosEmpresa;
        const utilidadNeta = calcularUtilidadNeta(date);

        return (
          <div key={mesData.id} style={{ marginBottom: "2rem" }}>
            <Typography variant="h4" gutterBottom>
              {mesData.mesDeGasto}{" "}
              <Link to={`/${mesData.id}`}>Ver Detalles</Link>
            </Typography>
            <Table sx={{ maxWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Mes</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Gastos de Proyectos
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Gastos de la Empresa
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Total Gastos
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Utilidad Neta
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{mesData.mesDeGasto}</TableCell>
                  <TableCell>{`$ ${formatNumber(gastosProyectos)}`}</TableCell>
                  <TableCell>{`$ ${formatNumber(gastosEmpresa)}`}</TableCell>
                  <TableCell>{`$ ${formatNumber(totalGastos)}`}</TableCell>
                  <TableCell>{`$ ${formatNumber(utilidadNeta)}`}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );
      })}
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

export default TablaUtilidades;
