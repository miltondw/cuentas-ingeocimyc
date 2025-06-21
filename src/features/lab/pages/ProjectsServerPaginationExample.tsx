import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as ProjectIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  ColumnConfig,
  RowAction,
} from "@/components/common/DataTable";
import {
  SearchAndFilter,
  FilterField,
} from "@/components/common/SearchAndFilter";
import DataTablePagination from "@/components/common/DataTablePagination";
import { useProjectsPaginated } from "@/api/hooks/useProjectsPaginated";
import { formatNumber } from "@/utils/formatNumber";
import type { Project } from "@/types/api";

/**
 * Página de ejemplo que demuestra el uso de paginación de servidor
 * con el formato específico de API: {data, total, page, limit}
 */
const ProjectsServerPaginationExample: React.FC = () => {
  const navigate = useNavigate();

  // Estados para paginación
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Estados para filtros
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    estado: "all",
    minCosto: "",
    maxCosto: "",
  });

  // Hook para obtener proyectos con paginación de servidor
  const { data, isLoading, paginationData, isEmpty, error } =
    useProjectsPaginated({
      page,
      limit,
      filters: {
        // Convertir filtros locales al formato esperado por la API
        search: searchValue || undefined,
        estado: filters.estado !== "all" ? filters.estado : undefined,
        minCosto: filters.minCosto ? Number(filters.minCosto) : undefined,
        maxCosto: filters.maxCosto ? Number(filters.maxCosto) : undefined,
      },
    });

  // Handlers para resetear la página cuando cambien los filtros
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1); // Resetear a la primera página
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Resetear a la primera página
  };

  // Configuración de columnas para DataTable
  const columns: ColumnConfig[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: 80,
    },
    {
      key: "nombreProyecto",
      label: "Proyecto",
      sortable: true,
      render: (value) => (
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{
            maxWidth: 250,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={String(value)}
        >
          {String(value)}
        </Typography>
      ),
    },
    {
      key: "solicitante",
      label: "Solicitante",
      sortable: true,
      render: (value) => (
        <Typography variant="body2">{String(value)}</Typography>
      ),
    },
    {
      key: "costoServicio",
      label: "Costo",
      sortable: true,
      align: "right",
      render: (value) => (
        <Typography variant="body2" fontWeight="medium">
          ${formatNumber(Number(value))}
        </Typography>
      ),
    },
    {
      key: "abono",
      label: "Abono",
      sortable: true,
      align: "right",
      render: (value) => (
        <Typography variant="body2">${formatNumber(Number(value))}</Typography>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <Chip
          label={String(value)}
          size="small"
          color={
            value === "completado"
              ? "success"
              : value === "activo"
              ? "info"
              : "default"
          }
          variant="outlined"
        />
      ),
    },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString("es-ES"),
    },
  ];

  // Configuración de acciones por fila
  const rowActions: RowAction[] = [
    {
      key: "view",
      label: "Ver detalles",
      icon: <ViewIcon />,
      action: (project) => navigate(`/proyectos/${(project as Project).id}`),
    },
    {
      key: "edit",
      label: "Editar",
      icon: <EditIcon />,
      action: (project) =>
        navigate(`/proyectos/${(project as Project).id}/editar`),
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: <DeleteIcon />,
      color: "error",
      action: (project) => {
        // Aquí iría la lógica para eliminar
        console.info("Eliminar proyecto:", project);
      },
    },
  ];

  // Configuración de filtros
  const filterFields: FilterField[] = [
    {
      key: "estado",
      label: "Estado",
      type: "select",
      options: [
        { value: "all", label: "Todos los estados" },
        { value: "activo", label: "Activo" },
        { value: "completado", label: "Completado" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
    {
      key: "minCosto",
      label: "Costo mínimo",
      type: "number",
      placeholder: "Ej: 1000000",
    },
    {
      key: "maxCosto",
      label: "Costo máximo",
      type: "number",
      placeholder: "Ej: 5000000",
    },
  ];

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">
          Error al cargar los proyectos: {error.message}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <ProjectIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Proyectos con Paginación de Servidor
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ejemplo de DataTable con paginación de servidor usando formato:{" "}
          {"{data, total, page, limit}"}
        </Typography>

        {/* Botón para crear nuevo proyecto */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/proyectos/nuevo")}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <SearchAndFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Buscar proyectos por nombre, solicitante..."
          filters={filterFields}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          showFilterCount
          collapsible={true}
        />
      </Box>

      {/* Data Table */}
      <DataTable
        data={data}
        columns={columns}
        keyField="id"
        rowActions={rowActions}
        loading={isLoading}
        title="Lista de Proyectos"
        emptyMessage={
          searchValue || Object.values(filters).some((v) => v && v !== "all")
            ? "No se encontraron proyectos con los filtros aplicados"
            : "No hay proyectos registrados"
        }
        onRowClick={(project) =>
          navigate(`/proyectos/${(project as Project).id}`)
        }
      />

      {/* Paginación */}
      {!isEmpty && (
        <DataTablePagination
          paginationData={paginationData}
          onPageChange={setPage}
          onRowsPerPageChange={setLimit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Proyectos por página:"
          showFirstLastButtons={true}
          showRowsPerPage={true}
        />
      )}

      {/* Estadísticas rápidas */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {paginationData.totalItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de proyectos
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="secondary">
              {paginationData.startItem}-{paginationData.endItem}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mostrando en esta página
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6" color="info.main">
              {paginationData.currentPage} de {paginationData.totalPages}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Página actual
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ProjectsServerPaginationExample;
