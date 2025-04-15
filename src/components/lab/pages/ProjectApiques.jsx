import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    Divider,
    Fab,
    Grid2,
    Paper,
    Chip,
    useMediaQuery,
    Skeleton,

} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TerrainIcon from '@mui/icons-material/Terrain';
import LayersIcon from '@mui/icons-material/Layers';
import ScienceIcon from '@mui/icons-material/Science';
import api from '../../../api';

const ProjectApiques = () => {
    const [apiques, setApiques] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { projectId } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:768px)');

    useEffect(() => {
        const fetchProjectAndApiques = async () => {
            try {
                setLoading(true);
                // Obtener información del proyecto
                const projectResponse = await api.get(`/projects/${projectId}`);
                setProject(projectResponse.data.project);

                // Obtener apiques del proyecto
                const apiquesResponse = await api.get(`/projects/${projectId}/apiques`);
                setApiques(apiquesResponse.data.apiques || []);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los apiques. Por favor, intenta de nuevo.');
                setLoading(false);
            }
        };

        fetchProjectAndApiques();
    }, [projectId]);

    const handleCreateApique = () => {
        navigate(`/lab/proyectos/${projectId}/apique/nuevo`);
    };

    const handleEditApique = (apiqueId) => {
        navigate(`/lab/proyectos/${projectId}/apique/${apiqueId}`);
    };

    const handleDeleteApique = async (apiqueId) => {
        if (!confirm('¿Estás seguro de eliminar este apique?')) return;

        try {
            await api.delete(`/projects/${projectId}/apiques/${apiqueId}`);
            // Actualizar la lista después de eliminar
            setApiques(apiques.filter(apique => apique.apique_id !== apiqueId));
        } catch (err) {
            console.error('Error al eliminar apique:', err);
            alert('No se pudo eliminar el apique. Intenta de nuevo.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getLayersCount = (layers) => {
        return layers?.length || 0;
    };

    const getSamplesCount = (layers) => {
        if (!layers) return 0;
        return layers.filter(layer => layer.sample_id).length;
    };

    const getMaxDepth = (layers) => {
        if (!layers || !layers.length) return 0;
        return layers.reduce((sum, layer) => sum + parseFloat(layer.thickness || 0), 0).toFixed(2);
    };

    // Vista de carga
    if (loading) {
        return (
            <Container sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Skeleton variant="text" width={200} height={30} />
                </Box>
                <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
                {[1, 2, 3].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={100} sx={{ mb: 1 }} />
                ))}
            </Container>
        );
    }

    // Vista de error
    if (error) {
        return (
            <Container sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">Error</Typography>
                </Box>
                <Paper sx={{ p: 3, backgroundColor: '#fff4f4' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            </Container>
        );
    }

    // Vista móvil
    if (isMobile) {
        return (
            <Container sx={{ py: 2, px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        Apiques de Suelo
                    </Typography>
                </Box>

                {project && (
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f9ff' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Proyecto: {project.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {project.ubicacion || 'Sin ubicación'}
                        </Typography>
                    </Paper>
                )}

                {apiques.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
                        <TerrainIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography>
                            No hay apiques registrados para este proyecto.
                        </Typography>
                    </Paper>
                ) : (
                    apiques.map((apique) => (
                        <Card key={apique.apique_id} sx={{ mb: 2 }}>
                            <CardContent sx={{ pb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h6" component="div">
                                            Apique #{apique.apique}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Fecha: {formatDate(apique.date)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ubicación: {apique.location || 'No especificada'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip
                                                size="small"
                                                icon={<LayersIcon fontSize="small" />}
                                                label={`${getLayersCount(apique.layers)} capas`}
                                            />
                                            <Chip
                                                size="small"
                                                icon={<ScienceIcon fontSize="small" />}
                                                label={`${getSamplesCount(apique.layers)} muestras`}
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditApique(apique.apique_id)}
                                            color="primary"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteApique(apique.apique_id)}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                        Profundidad total: {getMaxDepth(apique.layers)} m
                                    </Typography>
                                    {apique.cbr_unaltered && (
                                        <Chip
                                            size="small"
                                            label="CBR Inalterado"
                                            color="secondary"
                                        />
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}

                <Fab
                    color="primary"
                    aria-label="añadir"
                    onClick={handleCreateApique}
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                >
                    <AddIcon />
                </Fab>
            </Container>
        );
    }

    // Vista para pantallas más grandes
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">
                    Apiques de Suelo
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                    color="primary"
                    onClick={handleCreateApique}
                    sx={{
                        backgroundColor: (theme) => theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.primary.dark
                        }
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Box>

            {project && (
                <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f5f9ff' }}>
                    <Typography variant="h5" gutterBottom>
                        {project.nombre}
                    </Typography>
                    <Typography variant="body1">
                        Ubicación: {project.ubicacion || 'No especificada'}
                    </Typography>
                    {project.descripcion && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {project.descripcion}
                        </Typography>
                    )}
                </Paper>
            )}

            {apiques.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <TerrainIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">
                        No hay apiques registrados para este proyecto.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Haz clic en el botón + para crear un nuevo apique.
                    </Typography>
                </Paper>
            ) : (
                <Grid2 container spacing={3}>
                    {apiques.map((apique) => (
                        <Grid2 item xs={12} sm={6} key={apique.apique_id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" component="div">
                                            Apique #{apique.apique}
                                        </Typography>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditApique(apique.apique_id)}
                                                color="primary"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteApique(apique.apique_id)}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2">
                                            <strong>Fecha:</strong> {formatDate(apique.date)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Ubicación:</strong> {apique.location || 'No especificada'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Profundidad total:</strong> {getMaxDepth(apique.layers)} m
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip
                                                icon={<LayersIcon fontSize="small" />}
                                                label={`${getLayersCount(apique.layers)} capas`}
                                                size="small"
                                            />

                                            {apique.cbr_unaltered && (
                                                <Chip
                                                    label="CBR Inalterado"
                                                    color="secondary"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            )}
        </Container>
    );
};

export default ProjectApiques;