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
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LandscapeIcon from '@mui/icons-material/Landscape';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HardnessIcon from '@mui/icons-material/Terrain';
import api from '../../../api';

const ProjectProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { projectId } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:768px)');

    useEffect(() => {
        const fetchProjectAndProfiles = async () => {
            try {
                setLoading(true);
                // Obtener información del proyecto
                const projectResponse = await api.get(`/projects/${projectId}`);
                setProject(projectResponse.data.project);

                // Obtener perfiles de suelo del proyecto
                const profilesResponse = await api.get(`/projects/${projectId}/profiles`);
                setProfiles(profilesResponse.data.perfiles || []);

                setLoading(false);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los perfiles. Por favor, intenta de nuevo.');
                setLoading(false);
            }
        };

        fetchProjectAndProfiles();
    }, [projectId]);

    const handleCreateProfile = () => {
        navigate(`/lab/proyectos/${projectId}/perfil/nuevo`);
    };

    const handleEditProfile = (profileId) => {
        navigate(`/lab/proyectos/${projectId}/perfil/${profileId}`);
    };

    const handleDeleteProfile = async (profileId) => {
        if (!confirm('¿Estás seguro de eliminar este perfil?')) return;

        try {
            await api.delete(`/projects/${projectId}/profiles/${profileId}`);
            // Actualizar la lista después de eliminar
            setProfiles(profiles.filter(profile => profile.profile_id !== profileId));
        } catch (err) {
            console.error('Error al eliminar perfil:', err);
            alert('No se pudo eliminar el perfil. Intenta de nuevo.');
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



    const getCompletedDepthsCount = (blowsData) => {
        if (!blowsData || !blowsData.length) return 0;
        return blowsData.filter(blow => blow.n > 0).length;
    };

    const getMaxN = (blowsData) => {
        if (!blowsData || !blowsData.length) return 0;
        return Math.max(...blowsData.map(blow => blow.n || 0));
    };

    const getMaxDepth = (blowsData) => {
        if (!blowsData || !blowsData.length) return 0;

        // Filtramos solo profundidades con datos reales (N > 0)
        const depthsWithData = blowsData.filter(blow => blow.n > 0);

        if (depthsWithData.length === 0) return 0;

        // Encontramos la máxima profundidad con datos
        return Math.max(...depthsWithData.map(blow => parseFloat(blow.depth) || 0));
    };

    const getSoilHardnessColor = (maxN) => {
        if (maxN >= 50) return '#e53935'; // Duro - rojo
        if (maxN >= 30) return '#fb8c00'; // Medio - naranja
        if (maxN >= 10) return '#fdd835'; // Blando a medio - amarillo
        return '#8bc34a'; // Muy blando - verde
    };

    const getSoilHardnessText = (maxN) => {
        if (maxN >= 50) return 'Suelo muy duro';
        if (maxN >= 30) return 'Suelo duro';
        if (maxN >= 10) return 'Suelo medio';
        return 'Suelo blando';
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
                        Perfiles de Suelo
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

                {profiles.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', mb: 2 }}>
                        <LandscapeIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography>
                            No hay perfiles de suelo registrados para este proyecto.
                        </Typography>
                    </Paper>
                ) : (
                    profiles.map((profile) => (
                        <Card key={profile.profile_id} sx={{ mb: 2 }}>
                            <CardContent sx={{ pb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h6" component="div">
                                            Sondeo #{profile.sounding_number}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Fecha: {formatDate(profile.profile_date)}
                                        </Typography>

                                        {profile.water_level && profile.water_level !== "ninguno" && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <WaterDropIcon color="primary" fontSize="small" />
                                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                                    Nivel freático: {profile.water_level} m
                                                </Typography>
                                            </Box>
                                        )}

                                        <Chip
                                            size="small"
                                            label={`${profile.samples_number || 0} muestras`}
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>

                                    <Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditProfile(profile.profile_id)}
                                            color="primary"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteProfile(profile.profile_id)}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">
                                        {getCompletedDepthsCount(profile.blows_data)} / {profile.blows_data?.length || 0} profundidades con datos
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditProfile(profile.profile_id)}
                                        aria-label="ver detalles"
                                    >
                                        <ExpandMoreIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Tooltip title={getSoilHardnessText(getMaxN(profile.blows_data))}>
                                        <HardnessIcon
                                            sx={{
                                                color: getSoilHardnessColor(getMaxN(profile.blows_data)),
                                                fontSize: 'small',
                                                mr: 0.5
                                            }}
                                        />
                                    </Tooltip>

                                    <Typography variant="body2">
                                        Prof. máx: {getMaxDepth(profile.blows_data)} m
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}

                <Fab
                    color="primary"
                    aria-label="añadir"
                    onClick={handleCreateProfile}
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
                    Perfiles de Suelo
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                    color="primary"
                    onClick={handleCreateProfile}
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

            {profiles.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <LandscapeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6">
                        No hay perfiles de suelo registrados para este proyecto.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Haz clic en el botón + para crear un nuevo perfil.
                    </Typography>
                </Paper>
            ) : (
                <Grid2 container spacing={3}>
                    {profiles.map((profile) => (
                        <Grid2 size={{ xs: 12, sm: 6 }} key={profile.profile_id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" component="div">
                                            Sondeo #{profile.sounding_number}
                                        </Typography>
                                        <Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditProfile(profile.profile_id)}
                                                color="primary"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteProfile(profile.profile_id)}
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2">
                                            <strong>Fecha:</strong> {formatDate(profile.profile_date)}
                                        </Typography>

                                        {profile.water_level && profile.water_level !== "ninguno" && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <WaterDropIcon color="primary" fontSize="small" />
                                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                                    Nivel freático: {profile.water_level} m
                                                </Typography>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Tooltip title={getSoilHardnessText(getMaxN(profile.blows_data))}>
                                                <HardnessIcon
                                                    sx={{
                                                        color: getSoilHardnessColor(getMaxN(profile.blows_data)),
                                                        fontSize: 'small',
                                                        mr: 0.5
                                                    }}
                                                />
                                            </Tooltip>
                                            <Typography variant="body2" sx={{ mr: 2 }}>
                                                N máx: {getMaxN(profile.blows_data)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Profundidad máxima: {getMaxDepth(profile.blows_data)} m
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Chip
                                                size="small"
                                                label={`${profile.samples_number || 0} muestras`}
                                            />
                                            <Chip
                                                size="small"
                                                label={`${getCompletedDepthsCount(profile.blows_data)} / ${profile.blows_data?.length || 0} profundidades`}
                                                color="primary"
                                                variant="outlined"
                                            />
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

export default ProjectProfiles; 