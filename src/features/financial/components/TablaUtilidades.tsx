import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Grid2,
  Button,
} from "@mui/material";
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
  const [error, setError] = useState<string | null>(null); // Procesamiento de datos actualizado con nueva estructura
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
        gastosMensualesResponse.data?.data || [],
        proyectosResponse.data || []
      );

      console.info("Datos procesados:", {
        gastosMensuales: gastosMensualesResponse.data?.data?.length || 0,
        proyectos: proyectosResponse.data?.length || 0,
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

  // Configuración de columnas para DataTable
  const columns: ColumnConfig[] = [
    {
      key: "mes",
      label: "Mes",
      sortable: true,
      render: (value) => (
        <Typography variant="body2" fontWeight="medium">
          {String(value)}
        </Typography>
      ),
    },
    {
      key: "GastosProyectos",
      label: "Gastos Proyectos",
      sortable: true,
      align: "right",
      render: (value) => `$${formatNumber(value as number)}`,
    },
    {
      key: "GastosEmpresa",
      label: "Gastos Empresa",
      sortable: true,
      align: "right",
      render: (value) => `$${formatNumber(value as number)}`,
    },
    {
      key: "TotalGastos",
      label: "Total Gastos",
      sortable: true,
      align: "right",
      render: (value) => (
        <Typography variant="body2" fontWeight="medium">
          ${formatNumber(value as number)}
        </Typography>
      ),
    },
    {
      key: "TotalRetencion",
      label: "Total Retención",
      sortable: true,
      align: "right",
      render: (value) => `$${formatNumber(value as number)}`,
    },
    {
      key: "TotalIva",
      label: "Total IVA",
      sortable: true,
      align: "right",
      render: (value) => `$${formatNumber(value as number)}`,
    },
    {
      key: "Ingresos",
      label: "Total Ingresos",
      sortable: true,
      align: "right",
      render: (value) => (
        <Typography variant="body2" color="success.main" fontWeight="medium">
          ${formatNumber(value as number)}
        </Typography>
      ),
    },
    {
      key: "UtilidadNeta",
      label: "Utilidad Neta",
      sortable: true,
      align: "right",
      render: (value) => {
        const utilidad = value as number;
        return (
          <Typography
            variant="body2"
            color={utilidad >= 0 ? "success.main" : "error.main"}
            fontWeight="bold"
          >
            ${formatNumber(utilidad)}
          </Typography>
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

  if (error) {
    return (
      <Box sx={{ maxWidth: "90vw", mx: "auto", my: 3 }}>
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
            Resumen Financiero
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
        {/* Tabla de utilidades */}{" "}
        <DataTable
          data={resumen}
          columns={columns}
          keyField="mes"
          loading={loading}
          title="Resumen Financiero Mensual"
          emptyMessage="No hay datos financieros disponibles"
        />
      </Box>
    </LoadingOverlay>
  );
};

export default TablaUtilidades;
