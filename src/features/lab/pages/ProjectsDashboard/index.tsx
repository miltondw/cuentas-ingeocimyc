// Entry point para ProjectsDashboard modularizado
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Paper, Box, Typography, Chip, Alert } from "@mui/material";

import { useQuery } from "@tanstack/react-query";
import { useServerPagination } from "@/hooks/useServerPagination";
import { labService } from "@/services/api/labService";
import DataTablePagination from "@/components/common/DataTablePagination";
import { ProjectsDashboardTable } from "./components/ProjectsDashboardTable";
import { ProjectsDashboardFilters } from "./components/ProjectsDashboardFilters";
import { ProjectActionsCell } from "./components/ProjectActionsCell";

import { Terrain as TerrainIcon } from "@mui/icons-material";
import {
  useProjectNavigation,
  useFilterGetters,
  useHasActiveFilters,
} from "./hooks/ProjectsDashboard.hooks";
import type {
  LabProject,
  LabProjectFilters,
  LocalSearchInputs,
} from "./types/ProjectsDashboard.types";

const ProjectsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localSearchInputs, setLocalSearchInputs] = useState<LocalSearchInputs>(
    {
      search: "",
      nombreProyecto: "",
      solicitante: "",
    }
  );
  // Navigation handlers
  const {
    handleCreateApique,
    handleViewApiques,
    handleCreateProfile,
    handleViewProfiles,
  } = useProjectNavigation();

  // Filtros desde URL
  const { getFilter, getBooleanFilter, getNumberFilter } =
    useFilterGetters(searchParams);
  const filters: LabProjectFilters = useMemo(() => {
    const assignedAssayStatus = getFilter("assignedAssayStatus", "todos");
    const baseFilters = {
      page: getNumberFilter("page") || 1,
      limit: getNumberFilter("limit") || 10,
      sortBy: getFilter("sortBy", "fecha") as LabProjectFilters["sortBy"],
      sortOrder: getFilter(
        "sortOrder",
        "DESC"
      ) as LabProjectFilters["sortOrder"],
      search: getFilter("search"),
      nombreProyecto: getFilter("nombreProyecto"),
      solicitante: getFilter("solicitante"),
      hasApiques: getBooleanFilter("hasApiques"),
      hasProfiles: getBooleanFilter("hasProfiles"),
      startDate: getFilter("startDate"),
      endDate: getFilter("endDate"),
      minApiques: getNumberFilter("minApiques"),
      maxApiques: getNumberFilter("maxApiques"),
      minProfiles: getNumberFilter("minProfiles"),
      maxProfiles: getNumberFilter("maxProfiles"),
    };
    return assignedAssayStatus && assignedAssayStatus !== "todos"
      ? {
          ...baseFilters,
          assignedAssayStatus:
            assignedAssayStatus as LabProjectFilters["assignedAssayStatus"],
        }
      : baseFilters;
  }, [getFilter, getBooleanFilter, getNumberFilter]);

  // Actualizar filtros en la URL
  const updateUrlFilters = useCallback(
    (newFilters: Partial<LabProjectFilters>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "assignedAssayStatus" && value === "todos") {
            newParams.delete(key);
          } else {
            newParams.set(key, String(value));
          }
        } else {
          newParams.delete(key);
        }
      });
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Filtros activos
  const hasActiveFilters = useHasActiveFilters(searchParams);

  // Funciones para manejar filtros
  const updateFilters = updateUrlFilters;
  const updateFilter = useCallback(
    (
      key: keyof LabProjectFilters,
      value: string | number | boolean | undefined
    ) => {
      updateUrlFilters({ [key]: value });
    },
    [updateUrlFilters]
  );
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setLocalSearchInputs({
      search: "",
      nombreProyecto: "",
      solicitante: "",
    });
    setShowAdvancedFilters(false);
  }, [setSearchParams]);

  // Sincronizar estados locales con filtros al cargar
  useEffect(() => {
    setLocalSearchInputs({
      search: filters.search || "",
      nombreProyecto: filters.nombreProyecto || "",
      solicitante: filters.solicitante || "",
    });
  }, [filters.search, filters.nombreProyecto, filters.solicitante]);

  // Búsqueda y debounce
  const applySearchFilters = useCallback(() => {
    updateFilters({
      search: localSearchInputs.search || undefined,
      nombreProyecto: localSearchInputs.nombreProyecto || undefined,
      solicitante: localSearchInputs.solicitante || undefined,
      page: 1,
    });
  }, [localSearchInputs, updateFilters]);
  useEffect(() => {
    const searchFiltersChanged =
      localSearchInputs.search !== (filters.search || "") ||
      localSearchInputs.nombreProyecto !== (filters.nombreProyecto || "") ||
      localSearchInputs.solicitante !== (filters.solicitante || "");
    if (searchFiltersChanged) {
      const debounceTimer = setTimeout(() => {
        applySearchFilters();
      }, 2000);
      return () => clearTimeout(debounceTimer);
    }
  }, [localSearchInputs, filters, applySearchFilters]);

  // Handlers para inputs
  const handleSearchInputChange = useCallback(
    (field: keyof LocalSearchInputs, value: string) => {
      setLocalSearchInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );
  const handleSearchKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        applySearchFilters();
      }
    },
    [applySearchFilters]
  );

  // Fetch de proyectos y paginación
  const fetchLabProjects = async (filters: LabProjectFilters) => {
    const result = await labService.getProjects(filters);
    return {
      data: result.data || [],
      total: result.total || 0,
      page: Number(result.page || filters.page || 1),
      limit: Number(result.limit || filters.limit || 10),
    };
  };
  const {
    data: projects,
    isLoading: dataLoading,
    paginationData,
    error: dataError,
  } = useServerPagination({
    apiResponse: useQuery({
      queryKey: ["lab-projects", filters],
      queryFn: () => fetchLabProjects(filters),
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }).data,
    isLoading: useQuery({
      queryKey: ["lab-projects", filters],
      queryFn: () => fetchLabProjects(filters),
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }).isLoading,
    error: useQuery({
      queryKey: ["lab-projects", filters],
      queryFn: () => fetchLabProjects(filters),
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }).error,
  });

  // Resumen total para estadísticas
  const { data: summaryData } = useQuery({
    queryKey: ["lab-projects-summary"],
    queryFn: () => labService.getProjects({ page: 1, limit: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  // Renderizado de acciones en la tabla (modularizado)
  // Refetch de proyectos tras cambio de estado
  const { refetch: refetchProjects } = useQuery({
    queryKey: ["lab-projects", filters],
    queryFn: () => fetchLabProjects(filters),
    enabled: false, // solo manual
  });

  const renderActionCell = useCallback(
    (proyecto: LabProject) => (
      <ProjectActionsCell
        proyecto={proyecto}
        onCreateApique={handleCreateApique}
        onViewApiques={handleViewApiques}
        onCreateProfile={handleCreateProfile}
        onViewProfiles={handleViewProfiles}
        onStatusChanged={() => refetchProjects()}
      />
    ),
    [
      handleCreateApique,
      handleViewApiques,
      handleCreateProfile,
      handleViewProfiles,
      refetchProjects,
    ]
  );

  // Loading y error
  const loading = dataLoading;
  const error = dataError?.message || null;

  // Handlers de paginación
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilter("page", page);
    },
    [updateFilter]
  );
  const handleRowsPerPageChange = useCallback(
    (newLimit: number) => {
      updateFilters({ limit: newLimit, page: 1 });
    },
    [updateFilters]
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Proyectos de Laboratorio
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {/* Estadísticas rápidas */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            icon={<TerrainIcon />}
            label={`${summaryData?.total || 0} Proyectos`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${paginationData?.totalItems || 0} Filtrados`}
            color={hasActiveFilters ? "success" : "default"}
            variant={hasActiveFilters ? "filled" : "outlined"}
          />
        </Box>
        {/* Filtros */}
        <ProjectsDashboardFilters
          localSearchInputs={localSearchInputs}
          filters={filters}
          filtersLoading={loading}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          handleSearchInputChange={handleSearchInputChange}
          handleSearchKeyPress={handleSearchKeyPress}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          applySearchFilters={applySearchFilters}
          hasActiveFilters={hasActiveFilters}
          paginationData={paginationData}
        />
        {/* Tabla de proyectos */}
        <ProjectsDashboardTable
          data={projects || []}
          loading={loading}
          renderActionCell={renderActionCell}
        />
        {/* Paginación */}
        {paginationData && paginationData.totalItems > 0 && (
          <DataTablePagination
            paginationData={paginationData}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Proyectos por página:"
            showFirstLastButtons
            showRowsPerPage
          />
        )}
      </Paper>
    </Box>
  );
};

export default ProjectsDashboard;
