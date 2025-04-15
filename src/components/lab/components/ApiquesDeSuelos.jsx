import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Snackbar,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Grid2,
    FormControlLabel,
    Checkbox,
    IconButton,
    useMediaQuery,
    useTheme,
    LinearProgress,
    Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../../api';

const ApiquesDeSuelos = () => {
    const { projectId, apiqueId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [formData, setFormData] = useState({
        apique: null,
        location: '',
        depth: null,
        date: new Date().toISOString().split('T')[0],
        cbr_unaltered: false,
        depth_tomo: '',
        molde: '',
        layers: [],
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Cargar datos desde la API
    useEffect(() => {
        if (!apiqueId || apiqueId === 'nuevo') return;

        const fetchApique = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/projects/${projectId}/apiques/${apiqueId}`);
                const apiqueData = res.data.apique;

                setFormData({
                    apique: apiqueData.apique,
                    location: apiqueData.location,
                    depth: apiqueData.depth,
                    date: apiqueData.date.split('T')[0],
                    cbr_unaltered: apiqueData.cbr_unaltered,
                    depth_tomo: apiqueData.depth_tomo,
                    molde: apiqueData.molde,
                    layers: apiqueData.layers.map(layer => ({
                        layer_number: layer.layer_number,
                        thickness: layer.thickness,
                        sample_id: layer.sample_id,
                        observation: layer.observation
                    }))
                });

                setNotification({
                    open: true,
                    message: 'Apique cargado correctamente',
                    severity: 'success'
                });
            } catch (error) {
                console.error('Error cargando apique:', error);
                setNotification({
                    open: true,
                    message: error.response?.data?.message || 'Error al cargar el apique',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchApique();
    }, [projectId, apiqueId]);

    // Manejar cambios en campos básicos
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Agregar una nueva capa
    const addLayer = () => {
        setFormData((prev) => ({
            ...prev,
            layers: [
                ...prev.layers,
                {
                    layer_number: prev.layers.length + 1,
                    thickness: 0,
                    sample_id: '',
                    observation: '',
                },
            ],
        }));
    };

    // Eliminar una capa
    const removeLayer = (index) => {
        setFormData((prev) => ({
            ...prev,
            layers: prev.layers
                .filter((_, i) => i !== index)
                .map((layer, i) => ({ ...layer, layer_number: i + 1 })),
        }));
    };

    // Manejar cambios en datos de capa
    const handleLayerChange = (index, field, value) => {
        setFormData((prev) => {
            const newLayers = [...prev.layers];
            newLayers[index] = { ...newLayers[index], [field]: value };
            return { ...prev, layers: newLayers };
        });
    };

    // Calcular profundidad total
    const totalDepth = useMemo(() => {
        return formData.layers.reduce((sum, layer) => sum + Number(layer.thickness || 0), 0).toFixed(2);
    }, [formData.layers]);

    // Actualizar profundidad en formData
    useEffect(() => {
        setFormData((prev) => ({ ...prev, depth: totalDepth }));
    }, [totalDepth]);

    // Validar formulario
    const validateForm = () => {

        if (formData.depth_tomo && (isNaN(formData.depth_tomo) || Number(formData.depth_tomo) < 0)) {
            setNotification({ open: true, message: 'Profundidad de toma debe ser un número positivo', severity: 'error' });
            return false;
        }
        return true;
    };

    // Enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            const payload = {
                ...formData,
                layers: formData.layers.map(layer => ({
                    ...layer,
                    thickness: parseFloat(layer.thickness),
                }))
            };

            const endpoint = apiqueId && apiqueId !== 'nuevo'
                ? `/projects/${projectId}/apiques/${apiqueId}`
                : `/projects/${projectId}/apiques`;
            const method = apiqueId && apiqueId !== 'nuevo' ? 'put' : 'post';

            const response = await api[method](endpoint, payload);
            console.log(response)
            setNotification({
                open: true,
                message: `Apique ${method === 'put' ? 'actualizado' : 'creado'} correctamente`,
                severity: 'success'
            });

            setTimeout(() => {
                navigate(`/lab/proyectos/${projectId}/apiques`);
            }, 1500);

        } catch (error) {
            console.error('Error guardando apique:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error al guardar el apique',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    if (loading) {
        return <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} />;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(`/lab/proyectos/${projectId}/apiques`)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" gutterBottom>
                    {apiqueId && apiqueId !== 'nuevo' ? 'Editar Apique' : 'Crear Apique'}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 item xs={12} sm={6}>
                        <TextField
                            label="Número de Apique"
                            name="apique"
                            value={formData.apique}
                            onChange={handleChange}
                            fullWidth
                            required
                            aria-label="Número de apique (requerido)"
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <TextField
                            label="Ubicación"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <TextField
                            label="Fecha"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <TextField
                            label="Profundidad (m)"
                            name="depth"
                            value={formData.depth}
                            disabled
                            fullWidth
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <TextField
                            label="Profundidad a la que se tomó (m)"
                            name="depth_tomo"
                            type="number"
                            value={formData.depth_tomo}
                            onChange={handleChange}
                            fullWidth
                            slotProps={{ inputProps: { step: '0.01', min: 0 } }}
                        />
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Checkbox checked={formData.cbr_unaltered} onChange={handleChange} name="cbr_unaltered" />}
                            label="CBR Inalterado"
                            color='secondary'
                        />
                    </Grid2>
                    {formData.cbr_unaltered && (
                        <Grid2 item xs={12} sm={6}>
                            <TextField
                                label="Molde"
                                type="number"
                                name="molde"
                                value={formData.molde || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid2>
                    )}
                </Grid2>



                {formData.layers.length > 0 && (
                    <>
                        {/* Vista escritorio: Tabla */}
                        {!isMobile && (
                            <TableContainer sx={{ mt: 3 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Número de Capa</TableCell>
                                            <TableCell>Espesor (m)</TableCell>
                                            <TableCell>Identificación de Muestra</TableCell>
                                            <TableCell>Observación</TableCell>
                                            <TableCell>Acción</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.layers.map((layer, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{layer.layer_number}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={layer.thickness}
                                                        onChange={(e) =>
                                                            handleLayerChange(index, 'thickness', e.target.value)
                                                        }
                                                        size="small"
                                                        fullWidth
                                                        slotProps={{ inputProps: { step: '0.01', min: 0 } }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={layer.sample_id}
                                                        onChange={(e) =>
                                                            handleLayerChange(index, 'sample_id', e.target.value)
                                                        }
                                                        size="small"
                                                        fullWidth
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        value={layer.observation}
                                                        onChange={(e) =>
                                                            handleLayerChange(index, 'observation', e.target.value)
                                                        }
                                                        size="small"
                                                        fullWidth
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        aria-label={`Eliminar capa ${layer.layer_number}`}
                                                        onClick={() => removeLayer(index)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Vista móvil: Acordeones */}
                        {isMobile && (
                            <div style={{ marginTop: '20px' }}>
                                {formData.layers.map((layer, index) => (
                                    <Accordion key={index} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography>Capa {layer.layer_number}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <TextField
                                                label="Espesor (m)"
                                                type="number"
                                                value={layer.thickness}
                                                onChange={(e) =>
                                                    handleLayerChange(index, 'thickness', e.target.value)
                                                }
                                                fullWidth
                                                margin="normal"
                                                slotProps={{ inputProps: { step: '0.01', min: 0 } }}
                                            />
                                            <TextField
                                                label="Identificación de Muestra"
                                                value={layer.sample_id}
                                                onChange={(e) =>
                                                    handleLayerChange(index, 'sample_id', e.target.value)
                                                }
                                                fullWidth
                                                margin="normal"
                                            />
                                            <TextField
                                                label="Observación"
                                                value={layer.observation}
                                                onChange={(e) =>
                                                    handleLayerChange(index, 'observation', e.target.value)
                                                }
                                                fullWidth
                                                margin="normal"
                                            />
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => removeLayer(index)}
                                                sx={{ mt: 2 }}
                                                startIcon={<DeleteIcon />}
                                            >
                                                Eliminar Capa
                                            </Button>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </div>
                        )}
                    </>
                )}
                <Grid2 container spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
                    <Button variant="contained" color="primary" onClick={addLayer} sx={{ mt: 3 }}>
                        Agregar Capa
                    </Button>

                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </Grid2>

            </form>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ApiquesDeSuelos;