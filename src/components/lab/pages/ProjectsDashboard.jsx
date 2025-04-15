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
    Fab,
    useMediaQuery,
    Stack
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import LandscapeIcon from "@mui/icons-material/Landscape";
import BlurCircularIcon from '@mui/icons-material/BlurCircular';
import api from "../../../api";

// Table column definitions
const tableColumns = [
    { id: "acciones", label: "Acciones", sortable: false, width: 180 },
    { id: "fecha", label: "Fecha", sortable: true, filterType: "date", width: 120 },
    { id: "solicitante", label: "Solicitante", sortable: true, filterType: "text", width: 150 },
    { id: "nombre_proyecto", label: "Proyecto", sortable: true, filterType: "text", width: 200 },
    { id: "perfiles", label: "Perfiles", sortable: true, width: 120 },
    { id: "apiques", label: "Apiques", sortable: true, width: 120 },
];

const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("es", { timeZone: "UTC" }) : "";

const ProjectsDashboard = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [state, setState] = useState({
        projects: [],
        projectCounts: {},
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

        Object.entries(state.filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });

        return params;
    };

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

            fetchProjectCounts(projects);
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: `Error al cargar proyectos: ${error.message}`,
                loading: false,
            }));
        }
    };

    const fetchProjectCounts = async (projects) => {
        const counts = {};

        try {
            await Promise.all(projects.map(async (project) => {
                try {
                    // Obtener conteo de perfiles
                    const profilesResponse = await api.get(`/projects/${project.proyecto_id}/profiles`);
                    const profilesCount = profilesResponse.data.perfiles ? profilesResponse.data.perfiles.length : 0;

                    // Obtener conteo de apiques
                    const apiquesResponse = await api.get(`/projects/${project.proyecto_id}/apiques`);
                    const apiquesCount = apiquesResponse.data.apiques ? apiquesResponse.data.apiques.length : 0;

                    counts[project.proyecto_id] = {
                        profiles: profilesCount,
                        apiques: apiquesCount
                    };
                } catch (error) {
                    console.error(`Error en proyecto ${project.proyecto_id}:`, error);
                    counts[project.proyecto_id] = {
                        profiles: 0,
                        apiques: 0
                    };
                }
            }));

            setState(prev => ({
                ...prev,
                projectCounts: { ...prev.projectCounts, ...counts }
            }));

        } catch (error) {
            console.error("Error general:", error);
        }
    };

    useEffect(() => {
        if (state.currentPage !== 1) {
            setState(prev => ({ ...prev, currentPage: 1 }));
        } else {
            fetchProjects();
        }
    }, [state.filters, state.sortConfig]);

    useEffect(() => {
        fetchProjects();
    }, [state.currentPage]);

    const handleSort = (field) => {
        setState((prev) => ({
            ...prev,
            sortConfig: {
                field,
                direction: prev.sortConfig.field === field && prev.sortConfig.direction === "asc" ? "desc" : "asc",
            }
        }));
    };

    const handleFilterChange = (field, value) => {
        setState((prev) => ({
            ...prev,
            filters: { ...prev.filters, [field]: value }
        }));
    };

    const handleClearFilters = () => {
        setState((prev) => ({
            ...prev,
            filters: { fechaInicio: "", fechaFin: "", solicitante: "", nombre_proyecto: "" }
        }));
    };

    const handlePageChange = (_, page) => {
        setState(prev => ({ ...prev, currentPage: page }));
    };

    const handleNavigate = (projectId, type) => {
        const basePath = `/lab/proyectos/${projectId}`;
        const paths = {
            viewP: `${basePath}/perfiles`,
            viewA: `${basePath}/apiques`,
            newProfile: `${basePath}/perfil/nuevo`,
            newApique: `${basePath}/apique/nuevo`
        };
        navigate(paths[type]);
    };

    const toggleFilters = () => {
        setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
    };

    return (
        <Box sx={{ m: 3, p: 2, maxWidth: "1200px", mx: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
                    Gestión de Proyectos
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FilterListIcon />}
                    onClick={toggleFilters}
                    size={isMobile ? "small" : "medium"}
                >
                    {isMobile ? 'Filtros' : 'Mostrar Filtros'}
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
                                InputLabelProps={{ shrink: true }}
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
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleClearFilters}
                                >
                                    Limpiar Filtros
                                </Button>
                            </Stack>
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
                                No hay proyectos disponibles
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size={isMobile ? "small" : "medium"}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'background.default' }}>
                                        {tableColumns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                sx={{
                                                    fontWeight: "bold",
                                                    whiteSpace: "nowrap",
                                                    width: column.width,
                                                    display: isMobile && column.id === 'solicitante' ? 'none' : 'table-cell'
                                                }}
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
                                                <Stack direction={isMobile ? "column" : "row"} spacing={1}>
                                                    <Tooltip title="Ver perfiles">
                                                        <Typography variant="caption" sx={{
                                                            display: !isMobile && "block",
                                                            textAlign: "center"
                                                        }} gutterBottom>Ver perfiles</Typography>
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => handleNavigate(project.proyecto_id, 'viewP')}
                                                            size="small"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ver apiques">
                                                        <Typography variant="caption" sx={{
                                                            display: !isMobile && "block",
                                                            textAlign: "center"
                                                        }} gutterBottom>Ver apiques</Typography>
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => handleNavigate(project.proyecto_id, 'viewA')}
                                                            size="small"
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Nuevo perfil">
                                                        <Typography variant="caption" sx={{
                                                            display: !isMobile && "block",
                                                            textAlign: "center"
                                                        }} gutterBottom>Nuevo Perfil</Typography>
                                                        <IconButton
                                                            color="success"
                                                            onClick={() => handleNavigate(project.proyecto_id, 'newProfile')}
                                                            size="small"
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Nuevo apique">
                                                        <Typography variant="caption" sx={{
                                                            display: !isMobile && "block",
                                                            textAlign: "center"
                                                        }} gutterBottom>Nuevo Apique</Typography>
                                                        <IconButton
                                                            color="warning"
                                                            onClick={() => handleNavigate(project.proyecto_id, 'newApique')}
                                                            size="small"
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{formatDate(project.fecha)}</TableCell>
                                            <TableCell sx={{ display: isMobile ? 'none' : 'table-cell' }}>
                                                {project.solicitante || "-"}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "medium" }}>
                                                {project.nombre_proyecto}
                                            </TableCell>
                                            <TableCell>
                                                <Chip

                                                    label={state.projectCounts[project.proyecto_id]?.profiles ?? 0}
                                                    color="primary"
                                                    variant="outlined"
                                                    size="small"
                                                    icon={<BlurCircularIcon fontSize="small" />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={state.projectCounts[project.proyecto_id]?.apiques || 0}
                                                    color="secondary"
                                                    variant="outlined"
                                                    size="small"
                                                    icon={<BlurCircularIcon fontSize="small" />}
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
                            size={isMobile ? "small" : "medium"}
                        />
                    </Box>
                </>
            )}

            {/* Mobile Floating Actions */}
            {isMobile && (
                <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
                    <Fab
                        color="primary"
                        aria-label="filtros"
                        onClick={toggleFilters}
                        size="small"
                    >
                        <FilterListIcon />
                    </Fab>
                </Box>
            )}
        </Box>
    );
};

export default ProjectsDashboard;