import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Grid2,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Collapse,
  TextField,
  MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { projectsService } from "../services/projectsService";
import { useNotifications } from "@/hooks/useNotifications";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { DataTable, ColumnConfig } from "@/components/common/DataTable";
import { formatNumber } from "@/utils/formatNumber";
import type { Project } from "@/types/typesProject/projectTypes";
import api from "@/api";

// Tipos para el resumen financiero adaptados a la nueva estructura
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

// Estructura actualizada para gastos mensuales
interface GastoMensual {
  id: number;
  mes: string;
  salarios: string;
  luz: string;
  agua: string;
  arriendo: string;
  internet: string;
  salud: string;
  otros_campos?: { [key: string]: number } | null;
}

// Utilidades de formato
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

const sumOtrosCampos = (
  otrosCampos?: { [key: string]: number } | null
): number => {
  if (!otrosCampos || typeof otrosCampos !== "object") return 0;
  return Object.values(otrosCampos).reduce((acc, val) => {
    const num = Number(val);
    return !isNaN(num) ? acc + num : acc;
  }, 0);
};

const TablaUtilidades: React.FC = () => {
  const { showNotification } = useNotifications();
  const [resumen, setResumen] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    minAmount: "",
    maxAmount: "",
  });

  // Procesamiento de datos actualizado con nueva estructura
  const processData = useCallback(
    (gastosMensuales: GastoMensual[], proyectos: Project[]): MonthlyData[] => {
      const monthlyData: { [key: string]: MonthlyData } = {};

      // Procesar gastos mensuales (nueva estructura)
      gastosMensuales.forEach((gasto) => {
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

        // Convertir strings a números para gastos mensuales
        monthlyData[mes].GastosEmpresa +=
          Number(gasto.salarios || 0) +
          Number(gasto.luz || 0) +
          Number(gasto.agua || 0) +
          Number(gasto.arriendo || 0) +
          Number(gasto.internet || 0) +
          Number(gasto.salud || 0) +
          sumOtrosCampos(gasto.otros_campos);
      });

      // Procesar proyectos con nueva estructura
      proyectos.forEach((proyecto) => {
        const mes = formatDate(proyecto.fecha);
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
        const valorRetencion = Number(proyecto.valorRetencion || 0);

        monthlyData[mes].Ingresos += costoServicio;
        monthlyData[mes].CostoServicio += costoServicio;
        monthlyData[mes].TotalRetencion +=
          costoServicio * (valorRetencion / 100);
        monthlyData[mes].TotalIva += costoServicio * 0.19;

        // Procesar gastos del proyecto (nueva estructura)
        if (proyecto.expenses && proyecto.expenses.length > 0) {
          proyecto.expenses.forEach((expense) => {
            const gastoProyecto =
              Number(expense.camioneta || 0) +
              Number(expense.campo || 0) +
              Number(expense.obreros || 0) +
              Number(expense.comidas || 0) +
              Number(expense.otros || 0) +
              Number(expense.peajes || 0) +
              Number(expense.combustible || 0) +
              Number(expense.hospedaje || 0) +
              sumOtrosCampos(expense.otrosCampos);

            monthlyData[mes].GastosProyectos += gastoProyecto;
          });
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
  ); // Fetch data usando servicios actualizados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar servicios actualizados
      const [proyectosResponse, gastosMensualesResponse] = await Promise.all([
        projectsService.getProjects({}),
        api.get("/gastos-mes/expenses"), // Endpoint actualizado
      ]);
      const processedData = processData(
        gastosMensualesResponse.data?.data?.data || [],
        proyectosResponse || []
      );

      console.info("Datos procesados:", {
        gastosMensuales: gastosMensualesResponse.data?.data?.data?.length || 0,
        proyectos: proyectosResponse.length || 0,
        resumenMensual: processedData.length,
      });

      setResumen(processedData);

      if (processedData.length === 0) {
        showNotification({
          severity: "info",
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
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, [processData, showNotification]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Configuración de columnas para DataTable mejorada con responsive
  const columns: ColumnConfig[] = [
    {
      key: "mes",
      label: "📅 Período",
      sortable: true,
      render: (value) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            minWidth: { xs: 80, sm: 100, md: 130 },
            maxWidth: { xs: 90, sm: 120, md: 150 },
            overflow: "hidden",
            pr: { xs: 0.5, sm: 1 },
          }}
        >
          <Box
            sx={{
              width: { xs: 6, sm: 8 },
              height: { xs: 6, sm: 8 },
              borderRadius: "50%",
              background: "linear-gradient(135deg, #34495e 0%, #2c3e50 100%)",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            fontWeight="600"
            sx={{
              color: "#2c3e50",
              textTransform: "capitalize",
              fontSize: { xs: "0.6rem", sm: "0.75rem", md: "0.875rem" },
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {String(value)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "GastosProyectos",
      label: "🏗️ Proyectos",
      sortable: true,
      align: "right",
      render: (value) => (
        <Box
          sx={{
            textAlign: "right",
            minWidth: { xs: 60, sm: 80, md: 100 },
            maxWidth: { xs: 70, sm: 90, md: 120 },
            overflow: "hidden",
            px: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontFamily: "monospace",
              color: "#e67e22",
              fontSize: { xs: "0.55rem", sm: "0.65rem", md: "0.75rem" },
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ${formatNumber(value as number)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "GastosEmpresa",
      label: "🏢 Empresa",
      sortable: true,
      align: "right",
      render: (value) => (
        <Box
          sx={{
            textAlign: "right",
            minWidth: { xs: 60, sm: 80, md: 100 },
            maxWidth: { xs: 70, sm: 90, md: 120 },
            overflow: "hidden",
            px: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontFamily: "monospace",
              color: "#d35400",
              fontSize: { xs: "0.55rem", sm: "0.65rem", md: "0.75rem" },
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ${formatNumber(value as number)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "TotalGastos",
      label: "💸 Total",
      sortable: true,
      align: "right",
      render: (value) => (
        <Box
          sx={{
            textAlign: "right",
            minWidth: { xs: 65, sm: 85, md: 110 },
            maxWidth: { xs: 75, sm: 95, md: 130 },
            overflow: "hidden",
            px: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Typography
            variant="body2"
            fontWeight="700"
            sx={{
              fontFamily: "monospace",
              color: "#c0392b",
              fontSize: { xs: "0.55rem", sm: "0.65rem", md: "0.75rem" },
              background: "rgba(192, 57, 43, 0.1)",
              px: { xs: 0.2, sm: 0.3, md: 0.5 },
              py: { xs: 0.1, sm: 0.2, md: 0.3 },
              borderRadius: 1,
              display: "inline-block",
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            ${formatNumber(value as number)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "TotalRetencion",
      label: "📊 Ret.",
      sortable: true,
      align: "right",
      render: (value) => (
        <Box
          sx={{
            textAlign: "right",
            minWidth: { xs: 50, sm: 70, md: 90 },
            maxWidth: { xs: 60, sm: 80, md: 100 },
            overflow: "hidden",
            px: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontFamily: "monospace",
              color: "#8e44ad",
              fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.7rem" },
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ${formatNumber(value as number)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "TotalIva",
      label: "🧾 IVA",
      sortable: true,
      align: "right",
      render: (value) => (
        <Box
          sx={{
            textAlign: "right",
            minWidth: { xs: 50, sm: 70, md: 80 },
            maxWidth: { xs: 60, sm: 80, md: 90 },
            overflow: "hidden",
            px: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontFamily: "monospace",
              color: "#7f8c8d",
              fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.7rem" },
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ${formatNumber(value as number)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "Ingresos",
      label: "💰 Ingresos",
      sortable: true,
      align: "right",
      render: (value) => (
        <Box
          sx={{
            textAlign: "right",
            minWidth: { xs: 65, sm: 85, md: 110 },
            maxWidth: { xs: 75, sm: 95, md: 130 },
            overflow: "hidden",
            px: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Typography
            variant="body2"
            fontWeight="700"
            sx={{
              fontFamily: "monospace",
              color: "#27ae60",
              fontSize: { xs: "0.55rem", sm: "0.65rem", md: "0.75rem" },
              background: "rgba(39, 174, 96, 0.1)",
              px: { xs: 0.2, sm: 0.3, md: 0.5 },
              py: { xs: 0.1, sm: 0.2, md: 0.3 },
              borderRadius: 1,
              display: "inline-block",
              lineHeight: { xs: 1.0, sm: 1.1 },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            ${formatNumber(value as number)}
          </Typography>
        </Box>
      ),
    },
    {
      key: "UtilidadNeta",
      label: "📈 Utilidad",
      sortable: true,
      align: "right",
      render: (value) => {
        const utilidad = value as number;
        const isPositive = utilidad >= 0;
        return (
          <Box
            sx={{
              textAlign: "right",
              minWidth: { xs: 70, sm: 90, md: 120 },
              maxWidth: { xs: 80, sm: 100, md: 140 },
              overflow: "hidden",
              px: { xs: 0.25, sm: 0.5 },
            }}
          >
            <Chip
              icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`$${formatNumber(utilidad)}`}
              size="small"
              sx={{
                fontWeight: 700,
                fontFamily: "monospace",
                fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.7rem" },
                height: { xs: 18, sm: 20, md: 24 },
                background: isPositive
                  ? "linear-gradient(135deg, #27ae60 0%, #229954 100%)"
                  : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                color: "white",
                border: `1px solid ${isPositive ? "#27ae60" : "#e74c3c"}`,
                maxWidth: "100%",
                "& .MuiChip-icon": {
                  color: "white",
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                },
                "& .MuiChip-label": {
                  px: { xs: 0.2, sm: 0.3, md: 0.5 },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Box>
        );
      },
    },
  ];

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

  // Funciones para manejar filtros
  const handleFilterChange = (
    filterName: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      year: "",
      month: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  // Datos filtrados
  const filteredData = useMemo(() => {
    return resumen.filter((item) => {
      // Filtro por año
      if (filters.year) {
        const itemYear = new Date(item.mes).getFullYear().toString();
        if (!itemYear.includes(filters.year)) return false;
      }

      // Filtro por mes
      if (filters.month) {
        const itemMonth = (new Date(item.mes).getMonth() + 1)
          .toString()
          .padStart(2, "0");
        if (itemMonth !== filters.month) return false;
      }

      // Filtro por monto mínimo
      if (filters.minAmount) {
        const minAmount = parseFloat(filters.minAmount);
        if (item.UtilidadNeta < minAmount) return false;
      }

      // Filtro por monto máximo
      if (filters.maxAmount) {
        const maxAmount = parseFloat(filters.maxAmount);
        if (item.UtilidadNeta > maxAmount) return false;
      }

      return true;
    });
  }, [resumen, filters]);

  if (error) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          minHeight: "100vh",
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: "90vw",
            mx: "auto",
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
            variant="filled"
            action={
              <Tooltip title="Recargar datos financieros" arrow>
                <IconButton
                  onClick={fetchData}
                  color="inherit"
                  size="small"
                  sx={{
                    color: "white",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ Error en el Sistema Financiero
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <LoadingOverlay loading={loading} message="Cargando resumen financiero...">
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          minHeight: "100vh",
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            width: "100%",
            overflow: "hidden",
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Header con diseño profesional */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
              background: "linear-gradient(135deg, #34495e 0%, #2c3e50 100%)",
              color: "white",
              p: 3,
              borderRadius: 2,
              mx: -3,
              mt: -3,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="700"
                sx={{
                  fontSize: { xs: "1.3rem", sm: "1.8rem", md: "2rem" },
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "white",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: "inherit" }} />
                📊 Resumen Financiero
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Mostrar/Ocultar filtros" arrow>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="contained"
                  startIcon={<FilterListIcon />}
                  endIcon={
                    showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  sx={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.25)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Filtros
                </Button>
              </Tooltip>
              <Tooltip title="Actualizar datos financieros" arrow>
                <IconButton
                  onClick={fetchData}
                  sx={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.25)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Sección de Filtros Colapsable */}
          <Collapse in={showFilters}>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, #718096 0%, #4a5568 100%)",
                border: "1px solid #a0aec0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "white",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                🔍 Filtros de Búsqueda
              </Typography>
              <Grid2 container spacing={2}>
                {/* Filtros de fecha */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="🗓️ Año"
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                    placeholder="2025"
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(52, 73, 94, 0.2)",
                        },
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    label="📅 Mes"
                    value={filters.month}
                    onChange={(e) =>
                      handleFilterChange("month", e.target.value)
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(52, 73, 94, 0.2)",
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Todos los meses</MenuItem>
                    <MenuItem value="01">Enero</MenuItem>
                    <MenuItem value="02">Febrero</MenuItem>
                    <MenuItem value="03">Marzo</MenuItem>
                    <MenuItem value="04">Abril</MenuItem>
                    <MenuItem value="05">Mayo</MenuItem>
                    <MenuItem value="06">Junio</MenuItem>
                    <MenuItem value="07">Julio</MenuItem>
                    <MenuItem value="08">Agosto</MenuItem>
                    <MenuItem value="09">Septiembre</MenuItem>
                    <MenuItem value="10">Octubre</MenuItem>
                    <MenuItem value="11">Noviembre</MenuItem>
                    <MenuItem value="12">Diciembre</MenuItem>
                  </TextField>
                </Grid2>
                {/* Filtros de montos */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="💰 Utilidad Mínima"
                    value={filters.minAmount}
                    onChange={(e) =>
                      handleFilterChange("minAmount", e.target.value)
                    }
                    placeholder="100000"
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(52, 73, 94, 0.2)",
                        },
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="💸 Utilidad Máxima"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      handleFilterChange("maxAmount", e.target.value)
                    }
                    placeholder="5000000"
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        background: "rgba(255, 255, 255, 0.9)",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 1)",
                        },
                        "&.Mui-focused": {
                          background: "rgba(255, 255, 255, 1)",
                          boxShadow: "0 0 0 3px rgba(52, 73, 94, 0.2)",
                        },
                      },
                    }}
                  />
                </Grid2>
                {/* Botón para limpiar filtros */}
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    fullWidth
                    sx={{
                      height: 40,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      borderColor: "#e67e22",
                      color: "#e67e22",
                      "&:hover": {
                        borderColor: "#d35400",
                        background: "rgba(230, 126, 34, 0.04)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    🧹 Limpiar Filtros
                  </Button>
                </Grid2>
                {/* Información de resultados */}
                <Grid2 size={{ xs: 12 }}>
                  <Box
                    sx={{
                      background:
                        "linear-gradient(135deg, #34495e 0%, #2c3e50 100%)",
                      color: "white",
                      px: 3,
                      py: 2,
                      borderRadius: 2,
                      mt: 2,
                      textAlign: "center",
                      fontWeight: 500,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    📊 {filteredData.length} resultado
                    {filteredData.length !== 1 ? "s" : ""} encontrado
                    {filteredData.length !== 1 ? "s" : ""}
                  </Box>
                </Grid2>
              </Grid2>
            </Paper>
          </Collapse>

          {/* Tarjetas de resumen financiero mejoradas con mejor responsive */}
          <Grid2 container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                elevation={6}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(52, 152, 219, 0.3)",
                  background:
                    "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(52, 152, 219, 0.3)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      💰 Total Ingresos
                    </Typography>
                    <Chip
                      icon={<TrendingUpIcon />}
                      label="Ingresos"
                      size="small"
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 500,
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      fontSize: { xs: "1.8rem", sm: "2.5rem" },
                    }}
                  >
                    ${formatNumber(summaryTotals.totalIngresos)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      mt: 1,
                      fontSize: "0.85rem",
                    }}
                  >
                    Ingresos totales del período
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                elevation={6}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(230, 126, 34, 0.3)",
                  background:
                    "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(230, 126, 34, 0.3)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      💸 Total Gastos
                    </Typography>
                    <Chip
                      icon={<TrendingDownIcon />}
                      label="Gastos"
                      size="small"
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 500,
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      fontSize: { xs: "1.8rem", sm: "2.5rem" },
                    }}
                  >
                    ${formatNumber(summaryTotals.totalGastos)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      mt: 1,
                      fontSize: "0.85rem",
                    }}
                  >
                    Gastos totales del período
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, lg: 4 }}>
              <Card
                elevation={6}
                sx={{
                  borderRadius: 3,
                  border: `1px solid rgba(${
                    summaryTotals.totalUtilidad >= 0
                      ? "39, 174, 96"
                      : "231, 76, 60"
                  }, 0.3)`,
                  background:
                    summaryTotals.totalUtilidad >= 0
                      ? "linear-gradient(135deg, #27ae60 0%, #229954 100%)"
                      : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 40px rgba(${
                      summaryTotals.totalUtilidad >= 0
                        ? "39, 174, 96"
                        : "231, 76, 60"
                    }, 0.3)`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      {summaryTotals.totalUtilidad >= 0 ? "📈" : "📉"} Utilidad
                      Neta
                    </Typography>
                    <Chip
                      icon={
                        summaryTotals.totalUtilidad >= 0 ? (
                          <TrendingUpIcon />
                        ) : (
                          <TrendingDownIcon />
                        )
                      }
                      label={
                        summaryTotals.totalUtilidad >= 0
                          ? "Ganancia"
                          : "Pérdida"
                      }
                      size="small"
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 500,
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      fontSize: { xs: "1.8rem", sm: "2.5rem" },
                    }}
                  >
                    ${formatNumber(summaryTotals.totalUtilidad)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      mt: 1,
                      fontSize: "0.85rem",
                    }}
                  >
                    Resultado neto del período
                  </Typography>
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
          {/* Tabla de utilidades - DataTable maneja su propio scroll */}
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(52, 73, 94, 0.2)",
            }}
          >
            <DataTable
              data={filteredData}
              columns={columns}
              keyField="mes"
              loading={loading}
              title="📊 Resumen Financiero Mensual Detallado"
              emptyMessage={
                filters.year ||
                filters.month ||
                filters.minAmount ||
                filters.maxAmount
                  ? "📋 No hay datos que coincidan con los filtros aplicados"
                  : "📋 No hay datos financieros disponibles para mostrar"
              }
            />
          </Paper>
        </Paper>
      </Box>
    </LoadingOverlay>
  );
};

export default TablaUtilidades;
