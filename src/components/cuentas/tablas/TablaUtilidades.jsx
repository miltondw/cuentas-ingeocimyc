import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination,
  Box,
  CircularProgress,
  Alert,
  TableSortLabel,
  TableContainer,
} from "@mui/material";
import api from "../../../api";

const formatNumber = (value) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(
    parseFloat(value) || 0
  );

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "Fecha inválida"; // Manejar fechas inválidas
  return date.toLocaleDateString("es-ES", { 
    month: "long", 
    year: "numeric", 
    timeZone: "UTC" 
  });
};

const sumOtrosCampos = (otrosCampos) => {
  if (!otrosCampos || typeof otrosCampos !== 'object') return 0;
  return Object.values(otrosCampos).reduce((acc, val) => {
    const num = Number(val);
    return !isNaN(num) ? acc + num : acc;
  }, 0);
};

const TablaResumen = () => {
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "mes",
    direction: "asc",
  });
  const rowsPerPage = 5;

const processData = (gastosEmpresa, proyectos) => {
  const monthlyData = {};

  // Procesar gastos de empresa
  gastosEmpresa.forEach((gasto) => {
    const mes = formatDate(gasto.mes);
    monthlyData[mes] = monthlyData[mes] || {
      mes,
      GastosEmpresa: 0,
      TotalRetencion:0,
      TotalIva:0,
      GastosProyectos: 0,
      CostoServicio: 0,
      Ingresos: 0,
    };
    monthlyData[mes].GastosEmpresa += 
      Number(gasto.salarios) +
      Number(gasto.luz) +
      Number(gasto.agua) +
      Number(gasto.arriendo) +
      Number(gasto.internet) +
      Number(gasto.salud) +
      sumOtrosCampos(gasto.otros_campos);
  });

  // Procesar proyectos y sus gastos (corregido)
  proyectos.forEach((proyecto) => {
    const mes = formatDate(proyecto.fecha);
    monthlyData[mes] = monthlyData[mes] || {
      mes,
      GastosEmpresa: 0,
      TotalRetencion:0,
      TotalIva:0,
      GastosProyectos: 0,
      CostoServicio: 0,
      Ingresos: 0,
    };

    monthlyData[mes].Ingresos += Number(proyecto.costo_servicio);
    monthlyData[mes].CostoServicio += Number(proyecto.costo_servicio);
    monthlyData[mes].TotalRetencion += Number(proyecto.costo_servicio) *( Number(proyecto.valor_retencion)/100 );
    monthlyData[mes].TotalIva += Number(proyecto.costo_servicio) *0.19;

    // Procesar el objeto "gastos" directamente
    const gasto = proyecto.gastos;
    const gastoProyecto = [
      'camioneta', 'campo', 'obreros', 'comidas', 
      'otros', 'peajes', 'combustible', 'hospedaje'
    ].reduce((acc, key) => acc + (Number(gasto[key]) || 0), 0);
    
    monthlyData[mes].GastosProyectos += gastoProyecto + sumOtrosCampos(gasto.otros_campos);
  });

  //console.log(proyectos)
  return Object.values(monthlyData).map((item) => ({
    ...item,
    TotalGastos: item.GastosProyectos + item.GastosEmpresa,
    
  }));
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empresaRes, proyectosRes] = await Promise.all([
          api.get("/gastos-mes"),
          api.get("/projects"),
        ]);
        //console.log(empresaRes.data.data.gastos, proyectosRes.data.proyectos)

        const processedData = processData(
          empresaRes.data.data.gastos,
          proyectosRes.data.proyectos
        );

        setResumen(processedData);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const sortedData = [...resumen].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });
  

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) return <CircularProgress sx={{ display: "block", margin: "2rem auto" }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: "90vw", mx: "auto", my: 3, p: 2 }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 600, color: "primary.main" }}
      >
        Resumen Financiero Mensual
      </Typography>

      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {[
              { key: "mes", label: "Mes" },
              { key: "GastosProyectos", label: "Gastos Proyectos" },
              { key: "GastosEmpresa", label: "Gastos Empresa" },
              { key: "TotalGastos", label: "Total Gastos" },
              { key: "TotalRetencion", label: "Total De Retención" },
              { key: "TotalIva", label: "Total De Iva" },
              { key: "Ingresos", label: "Total De Ingresos" },
              { key: "UtilidadNeta", label: "Utilidad Neta" },
            ].map((header) => (
              <TableCell key={header.key} sx={{ fontWeight: "bold" }}>
                <TableSortLabel
                  active={sortConfig.key === header.key}
                  direction={sortConfig.direction}
                  onClick={() => handleSort(header.key)}
                >
                  {header.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow key={index} hover>
              <TableCell sx={{ fontWeight: 500 }}>{item.mes}</TableCell>
              <TableCell>{`$ ${formatNumber(item.GastosProyectos)}`}</TableCell>
              <TableCell>{`$ ${formatNumber(item.GastosEmpresa)}`}</TableCell>
              <TableCell>{`$ ${formatNumber(item.TotalGastos)}`}</TableCell>
               <TableCell>{`$ ${formatNumber(item.TotalRetencion)}`}</TableCell>
               <TableCell>{`$ ${formatNumber(item.TotalIva)}`}</TableCell>
              <TableCell>{`$ ${formatNumber(item.Ingresos)}`}</TableCell>
              <TableCell
                sx={{
                  color: item.Ingresos-item.TotalGastos < 0 ? "error.main" : "success.main",
                  fontWeight: 600,
                }}
              >
                {`$ ${formatNumber(item.Ingresos-item.TotalGastos)}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="body2">
          Mostrando {paginatedData.length} de {resumen.length} registros
        </Typography>
        <Pagination
          count={Math.ceil(resumen.length / rowsPerPage)}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
        />
      </Box>
    </TableContainer>
  );
};

export default TablaResumen;