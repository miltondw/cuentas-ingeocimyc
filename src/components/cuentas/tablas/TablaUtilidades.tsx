import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Alert,
  TableSortLabel,
  TableContainer,
  Card,
  CardContent,
  Grid2,
  Button,
} from "@mui/material";
import { projectsService } from "@/api";
import { useNotifications } from "@/api/hooks/useNotifications";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import type { Project } from "@/types/api";
import api from "@/api";

// Tipos para el resumen financiero
interface MonthlyData {
  mes: string;
  GastosEmpresa: number;
  TotalRetencion: number;
  TotalIva: number;
  GastosProyectos: number;
  CostoServicio: number;
  Ingresos: number;
  TotalGastos: number;
  UtilidadNeta: number;
}

interface GastoEmpresa {
  gasto_empresa_id: string;
  mes: string;
  salarios: number;
  luz: number;
  agua: number;
  arriendo: number;
  internet: number;
  salud: number;
  otrosCampos?: { [key: string]: number };
}

interface ProjectGastos {
  camioneta?: number;
  campo?: number;
  obreros?: number;
  comidas?: number;
  otros?: number;
  peajes?: number;
  combustible?: number;
  hospedaje?: number;
  otrosCampos?: { [key: string]: number };
}

interface ProjectWithGastos extends Project {
  valorRetencion?: number; // Campo legacy
  gastos?: ProjectGastos; // Estructura de gastos legacy
}

interface SortConfig {
  key: keyof MonthlyData;
  direction: "asc" | "desc";
}

// Utilidades de formato
const formatNumber = (value: number): string =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(
    value || 0
  );

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const sumOtrosCampos = (otrosCampos?: { [key: string]: number }): number => {
  if (!otrosCampos || typeof otrosCampos !== "object") return 0;
  return Object.values(otrosCampos).reduce((acc, val) => {
    const num = Number(val);
    return !isNaN(num) ? acc + num : acc;
  }, 0);
};

const TablaUtilidades: React.FC = () => {
  const { showNotification, showError } = useNotifications();
  const [resumen, setResumen] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "mes",
    direction: "asc",
  });

  const rowsPerPage = 5;
  // Procesamiento de datos mejorado con tipos
  const processData = useCallback(
    (
      gastosEmpresa: GastoEmpresa[],
      proyectos: ProjectWithGastos[]
    ): MonthlyData[] => {
      const monthlyData: { [key: string]: MonthlyData } = {};

      // Procesar gastos de empresa
      gastosEmpresa.forEach((gasto) => {
        const mes = formatDate(gasto.mes);
        if (!monthlyData[mes]) {
          monthlyData[mes] = {
            mes,
            GastosEmpresa: 0,
            TotalRetencion: 0,
            TotalIva: 0,
            GastosProyectos: 0,
            CostoServicio: 0,
            Ingresos: 0,
            TotalGastos: 0,
            UtilidadNeta: 0,
          };
        }

        monthlyData[mes].GastosEmpresa +=
          Number(gasto.salarios || 0) +
          Number(gasto.luz || 0) +
          Number(gasto.agua || 0) +
          Number(gasto.arriendo || 0) +
          Number(gasto.internet || 0) +
          Number(gasto.salud || 0) +
          sumOtrosCampos(gasto.otrosCampos);
      }); // Procesar proyectos y sus gastos
      proyectos.forEach((proyecto) => {
        const mes = formatDate(proyecto.fechaInicio || proyecto.created_at);
        if (!monthlyData[mes]) {
          monthlyData[mes] = {
            mes,
            GastosEmpresa: 0,
            TotalRetencion: 0,
            TotalIva: 0,
            GastosProyectos: 0,
            CostoServicio: 0,
            Ingresos: 0,
            TotalGastos: 0,
            UtilidadNeta: 0,
          };
        }
        const costoServicio = Number(proyecto.costoServicio || 0);
        // Casting para compatibilidad con datos legacy
        const projectoWithGastos = proyecto as ProjectWithGastos;
        const valorRetencion = Number(projectoWithGastos.valorRetencion || 0);

        monthlyData[mes].Ingresos += costoServicio;
        monthlyData[mes].CostoServicio += costoServicio;
        monthlyData[mes].TotalRetencion +=
          costoServicio * (valorRetencion / 100);
        monthlyData[mes].TotalIva += costoServicio * 0.19;

        // Procesar gastos del proyecto (estructura legacy compatibility)
        const gastos = projectoWithGastos.gastos;
        if (gastos) {
          const gastoProyecto = [
            "camioneta",
            "campo",
            "obreros",
            "comidas",
            "otros",
            "peajes",
            "combustible",
            "hospedaje",
          ].reduce((acc, key) => {
            const value = gastos[key as keyof ProjectGastos];
            return acc + (Number(value) || 0);
          }, 0);

          monthlyData[mes].GastosProyectos +=
            gastoProyecto + sumOtrosCampos(gastos.otrosCampos);
        }
      });

      // Calcular totales y utilidad neta
      return Object.values(monthlyData).map((item) => ({
        ...item,
        TotalGastos: item.GastosProyectos + item.GastosEmpresa,
        UtilidadNeta:
          item.Ingresos -
          item.GastosProyectos -
          item.GastosEmpresa -
          item.TotalRetencion,
      }));
    },
    []
  );
  // Fetch data usando servicios modernos
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar servicios tipados en lugar de API directa
      const [proyectos, gastosEmpresaResponse] = await Promise.all([
        projectsService.getProjects({}),
        // Usar API client configurado en lugar de fetch directo
        api.get("/gastos-mes"),
      ]);

      const processedData = processData(
        gastosEmpresaResponse.data?.data?.gastos || [],
        proyectos.data || []
      );

      setResumen(processedData);

      if (processedData.length === 0) {
        showNotification({
          type: "info",
          title: "Sin datos",
          message: "No se encontraron datos financieros para mostrar",
          duration: 3000,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? `Error al cargar datos financieros: ${err.message}`
          : "Error al cargar datos financieros";

      setError(errorMessage);
      showError(errorMessage);
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, [processData, showNotification, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejo de ordenamiento mejorado
  const handleSort = useCallback((key: keyof MonthlyData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Datos ordenados y paginados con useMemo para performance
  const sortedData = useMemo(() => {
    return [...resumen].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [resumen, sortConfig]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [sortedData, currentPage, rowsPerPage]);

  // Cálculos de resumen con useMemo
  const summaryTotals = useMemo(() => {
    return resumen.reduce(
      (totals, item) => ({
        totalIngresos: totals.totalIngresos + item.Ingresos,
        totalGastos: totals.totalGastos + item.TotalGastos,
        totalUtilidad: totals.totalUtilidad + item.UtilidadNeta,
      }),
      { totalIngresos: 0, totalGastos: 0, totalUtilidad: 0 }
    );
  }, [resumen]);

  // Configuración de columnas
  const columns = useMemo(
    () => [
      { key: "mes" as const, label: "Mes" },
      { key: "GastosProyectos" as const, label: "Gastos Proyectos" },
      { key: "GastosEmpresa" as const, label: "Gastos Empresa" },
      { key: "TotalGastos" as const, label: "Total Gastos" },
      { key: "TotalRetencion" as const, label: "Total Retención" },
      { key: "TotalIva" as const, label: "Total IVA" },
      { key: "Ingresos" as const, label: "Total Ingresos" },
      { key: "UtilidadNeta" as const, label: "Utilidad Neta" },
    ],
    []
  );

  if (error) {
    return (
      <Box sx={{ maxWidth: "90vw", mx: "auto", my: 3 }}>
        {" "}
        <Alert
          severity="error"
          action={
            <Button
              onClick={fetchData}
              variant="text"
              color="inherit"
              size="small"
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LoadingOverlay loading={loading} message="Cargando resumen financiero...">
      <Box sx={{ maxWidth: "95vw", mx: "auto", my: 3 }}>
        {/* Header con resumen ejecutivo */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600, color: "primary.main", mb: 3 }}
          >
            Resumen Financiero Mensual
          </Typography>

          <Grid2 container spacing={2} sx={{ mb: 3 }}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Ingresos
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ${formatNumber(summaryTotals.totalIngresos)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Gastos
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    ${formatNumber(summaryTotals.totalGastos)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Utilidad Neta
                  </Typography>
                  <Typography
                    variant="h4"
                    color={
                      summaryTotals.totalUtilidad >= 0
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    ${formatNumber(summaryTotals.totalUtilidad)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        </Box>

        {/* Tabla principal */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 2 }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "grey.50",
                      borderBottom: 2,
                      borderColor: "primary.light",
                    }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === column.key}
                      direction={
                        sortConfig.key === column.key
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow key={`${item.mes}-${index}`} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{item.mes}</TableCell>
                  <TableCell>${formatNumber(item.GastosProyectos)}</TableCell>
                  <TableCell>${formatNumber(item.GastosEmpresa)}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    ${formatNumber(item.TotalGastos)}
                  </TableCell>
                  <TableCell>${formatNumber(item.TotalRetencion)}</TableCell>
                  <TableCell>${formatNumber(item.TotalIva)}</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                    ${formatNumber(item.Ingresos)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color:
                        item.UtilidadNeta >= 0 ? "success.main" : "error.main",
                      fontWeight: 600,
                    }}
                  >
                    ${formatNumber(item.UtilidadNeta)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer con paginación */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            px: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Mostrando {paginatedData.length} de {resumen.length} registros
          </Typography>
          <Pagination
            count={Math.ceil(resumen.length / rowsPerPage)}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>
    </LoadingOverlay>
  );
};

export default TablaUtilidades;
