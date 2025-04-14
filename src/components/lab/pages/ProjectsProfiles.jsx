import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Typography,
    IconButton,
    Pagination,
    CircularProgress,
    Alert,
    TableSortLabel,
    Tooltip,
    Grid2,
    Box,
    Chip,
    Fab
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import LandscapeIcon from "@mui/icons-material/Landscape";
import api from "../../../api";

// Table column definitions
const tableColumns = [
    { id: "acciones", label: "Acciones", sortable: false, width: 150 },
    { id: "fecha", label: "Fecha", sortable: true, filterType: "date", width: 120 },
    { id: "solicitante", label: "Solicitante", sortable: true, filterType: "text", width: 150 },
    { id: "nombre_proyecto", label: "Proyecto", sortable: true, filterType: "text", width: 200 },
    { id: "perfiles", label: "Perfiles", sortable: true, width: 100 },
];

// Format date function
const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" }) : "";

const ProjectsProfiles = () => {

    const [state, setState] = useState({
        projects: [],
        projectProfiles: {},
        filters: {
            fechaInicio: "",
            fechaFin: "",
            solicitante: "",
            nombre_proyecto: "",
        },
        sortConfig: { field: "fecha", direction: "desc" },
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        showFilters: false,
        totalItems: 0
    });

    const navigate = useNavigate();
    const rowsPerPage = 10;
    const buildQueryParams = () => {
        const params = {
            page: state.currentPage,
            limit: rowsPerPage,
            sort: state.sortConfig.field,
            order: state.sortConfig.direction
        };

        // Añadir filtros solo si tienen valor
        if (state.filters.fechaInicio) {
            params.fechaInicio = state.filters.fechaInicio;
        }
        if (state.filters.fechaFin) {
            params.fechaFin = state.filters.fechaFin;
        }
        if (state.filters.solicitante) {
            params.solicitante = state.filters.solicitante;
        }
        if (state.filters.nombre_proyecto) {
            params.nombre_proyecto = state.filters.nombre_proyecto;
        }

        return params;
    };

    // Fetch projects con paginación y filtros
    const fetchProjects = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const params = buildQueryParams();
            const response = await api.get("/projects", { params });

            const { proyectos: projects = [], totalPages, total } = response.data;

            setState(prev => ({
                ...prev,
                projects,
                totalPages,
                totalItems: total,
                loading: false
            }));

            // Fetch profile counts solo para los proyectos de la página actual
            fetchProfileCounts(projects);
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: `Error al cargar proyectos: ${error.message}`,
                loading: false,
            }));
        }
    };

    // Get profile counts for each project
    const fetchProfileCounts = async (projects) => {
        const profileCounts = {};

        try {
            await Promise.all(projects.map(async (project) => {
                try {
                    const response = await api.get(`/projects/${project.proyecto_id}/profiles`);
                    profileCounts[project.proyecto_id] = (response.data.perfiles || []).length;
                } catch {
                    profileCounts[project.proyecto_id] = 0;
                }
            }));

            setState((prev) => ({
                ...prev,
                projectProfiles: { ...prev.projectProfiles, ...profileCounts }
            }));
        } catch (error) {
            console.error("Error fetching profile counts:", error);
        }
    };
    // Efecto para cargar proyectos cuando cambian filtros, orden o página
    useEffect(() => {
        // Resetear a página 1 cuando cambian filtros u ordenamiento
        if (state.currentPage !== 1) {
            setState(prev => ({ ...prev, currentPage: 1 }));
        } else {
            fetchProjects();
        }
    }, [state.filters, state.sortConfig]);

    // Efecto para cargar proyectos cuando cambia la página
    useEffect(() => {
        fetchProjects();
    }, [state.currentPage]);
    // Initial fetch and when filters/sorting change


    // Handle sorting
    const handleSort = (field) => {
        setState((prev) => ({
            ...prev,
            sortConfig: {
                field,
                direction: prev.sortConfig.field === field && prev.sortConfig.direction === "asc" ? "desc" : "asc",
            }
        }));
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setState((prev) => ({
            ...prev,
            filters: { ...prev.filters, [field]: value }
        }));
    };

    // Clear all filters
    const handleClearFilters = () => {
        setState((prev) => ({
            ...prev,
            filters: {
                fechaInicio: "",
                fechaFin: "",
                solicitante: "",
                nombre_proyecto: "",
            }
        }));
    };


    const handlePageChange = (_, page) => {
        setState(prev => ({ ...prev, currentPage: page }));
    };
    // View project profiles
    const handleViewProfiles = (projectId) => {
        navigate(`/proyectos/${projectId}/perfiles`);
    };

    // Create new profile for project
    const handleCreateProfile = (projectId) => {
        navigate(`/proyectos/${projectId}/perfil/nuevo`);
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setState(prev => ({
            ...prev,
            showFilters: !prev.showFilters
        }));
    };

    return (
        <Box sx={{ m: 3, p: 2, maxWidth: "1200px", mx: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">Perfiles de Suelo por Proyecto</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilters}
                >
                    Filtros
                </Button>
            </Box>

            {state.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {state.error}
                </Alert>
            )}

            {state.showFilters && (
                <Paper sx={{ mb: 3, p: 2 }}>
                    <Grid2 container spacing={2}>
                        <Grid2 item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Fecha inicio"
                                type="date"
                                value={state.filters.fechaInicio}
                                onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                                variant="outlined"
                                size="small"
                                slotProps={{ inputLabel: { shrink: true } }}
                                InputProps={{
                                    inputProps: {
                                        max: state.filters.fechaFin || new Date().toISOString().split('T')[0]
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Fecha fin"
                                type="date"
                                value={state.filters.fechaFin}
                                onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                                variant="outlined"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    inputProps: {
                                        min: state.filters.fechaInicio,
                                        max: new Date().toISOString().split('T')[0]
                                    }
                                }}
                            />
                        </Grid2>
                        <Grid2 item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Solicitante"
                                value={state.filters.solicitante}
                                onChange={(e) => handleFilterChange("solicitante", e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </Grid2>
                        <Grid2 item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Nombre del proyecto"
                                value={state.filters.nombre_proyecto}
                                onChange={(e) => handleFilterChange("nombre_proyecto", e.target.value)}
                                variant="outlined"
                                size="small"
                            />
                        </Grid2>
                        <Grid2 item xs={12}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClearFilters}
                                fullWidth
                            >
                                Limpiar Filtros
                            </Button>
                        </Grid2>
                    </Grid2>
                </Paper>
            )}

            {state.loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {state.projects.length === 0 ? (
                        <Paper sx={{ p: 5, textAlign: "center" }}>
                            <LandscapeIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                            <Typography variant="h6">
                                No hay proyectos disponibles.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Cree un nuevo proyecto o ajuste los filtros de búsqueda.
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                                        {tableColumns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                sx={{ fontWeight: "bold", whiteSpace: "nowrap", width: column.width }}
                                            >
                                                {column.sortable ? (
                                                    <TableSortLabel
                                                        active={state.sortConfig.field === column.id}
                                                        direction={state.sortConfig.direction}
                                                        onClick={() => handleSort(column.id)}
                                                    >
                                                        {column.label}
                                                    </TableSortLabel>
                                                ) : (
                                                    column.label
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {state.projects.map((project) => (
                                        <TableRow key={project.proyecto_id} hover>
                                            <TableCell>
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <Tooltip title="Ver perfiles de suelo">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleViewProfiles(project.proyecto_id)}
                                                            size="small"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Crear nuevo perfil">
                                                        <IconButton
                                                            color="secondary"
                                                            onClick={() => handleCreateProfile(project.proyecto_id)}
                                                            size="small"
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{formatDate(project.fecha)}</TableCell>
                                            <TableCell>{project.solicitante || "-"}</TableCell>
                                            <TableCell sx={{ fontWeight: "medium" }}>{project.nombre_proyecto}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={state.projectProfiles[project.proyecto_id] || 0}
                                                    color={state.projectProfiles[project.proyecto_id] > 0 ? "primary" : "default"}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                        <Pagination
                            count={state.totalPages}
                            page={state.currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </>
            )}

            {/* Mobile FAB for better mobile UX */}
            <Box sx={{ display: { xs: "block", md: "none" } }}>
                <Fab
                    color="primary"
                    aria-label="filtros"
                    onClick={toggleFilters}
                    sx={{ position: "fixed", bottom: 16, right: 16 }}
                >
                    <FilterListIcon />
                </Fab>
            </Box>
        </Box>
    );
};

export default ProjectsProfiles;