import { useState, useEffect, useMemo } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    useMediaQuery,
    Divider,
    Snackbar,
    Alert,
    InputAdornment,
    Chip,
    LinearProgress
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LayersIcon from '@mui/icons-material/Layers';
import api from "../../../api";

const DEPTH_INCREMENT = 0.45;
const DEPTH_LEVELS = 14;

const FormCreateProfile = () => {
    const [formData, setFormData] = useState({
        sounding_number: "",
        water_level: "",
        profile_date: new Date().toISOString().split('T')[0],
        samples_number: 0,
        blows_data: Array.from({ length: DEPTH_LEVELS }, (_, i) => ({
            depth: ((i + 1) * DEPTH_INCREMENT).toFixed(2),
            blows6: "",
            blows12: "",
            blows18: "",
            n: 0,
            observation: ""
        }))
    });

    const [expandedDepth, setExpandedDepth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
    const [soundingNumberError, setSoundingNumberError] = useState(false);
    const navigate = useNavigate();
    const { projectId, profileId } = useParams();
    const isMobile = useMediaQuery('(max-width:768px)');

    // Cargar datos si estamos editando
    useEffect(() => {
        if (!profileId || profileId === 'nuevo') return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/projects/${projectId}/profiles/${profileId}`);
                const profile = res.data.perfil;

                setFormData({
                    sounding_number: profile.sounding_number || "",
                    water_level: profile.water_level || "",
                    profile_date: profile.profile_date ? profile.profile_date.split('T')[0] : new Date().toISOString().split('T')[0],
                    samples_number: profile.samples_number || 0,
                    blows_data: profile.blows_data.map(blow => ({
                        ...blow,
                        blows6: blow.blows6 !== null ? blow.blows6.toString() : "",
                        blows12: blow.blows12 !== null ? blow.blows12.toString() : "",
                        blows18: blow.blows18 !== null ? blow.blows18.toString() : "",
                        n: blow.n !== null ? blow.n.toString() : "0",
                        observation: blow.observation || ""
                    }))
                });
                setLoading(false);
                setNotification({
                    open: true,
                    message: 'Perfil cargado correctamente',
                    severity: 'success'
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setLoading(false);
                setNotification({
                    open: true,
                    message: 'Error al cargar el perfil',
                    severity: 'error'
                });
            }
        };

        fetchProfile();
    }, [projectId, profileId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'sounding_number') {
            setSoundingNumberError(!value.trim());
        }

        setFormData(prev => ({
            ...prev,
            [name]: value || ""
        }));
    };

    const handleBlowChange = (index, field, value) => {
        setFormData(prev => {
            const newBlowsData = [...prev.blows_data];

            if (field === 'observation') {
                // Para campos de texto, aseguramos que nunca sea null
                newBlowsData[index] = {
                    ...newBlowsData[index],
                    [field]: value || ""
                };
            } else {
                // Para campos numéricos
                const numValue = value === "" ? "" : parseInt(value) || 0;

                newBlowsData[index] = {
                    ...newBlowsData[index],
                    [field]: numValue
                };

                if (field === 'blows12' || field === 'blows18') {
                    const blows12 = field === 'blows12' ? numValue : newBlowsData[index].blows12;
                    const blows18 = field === 'blows18' ? numValue : newBlowsData[index].blows18;

                    if (blows12 !== "" && blows18 !== "") {
                        newBlowsData[index].n = (parseInt(blows12) || 0) + (parseInt(blows18) || 0);
                    }
                }
            }

            return {
                ...prev,
                blows_data: newBlowsData
            };
        });
    };

    const handleAccordionChange = (depth) => (_, isExpanded) => {
        setExpandedDepth(isExpanded ? depth : null);
    };

    // Calcular estadísticas del perfil para mostrar resumen
    const profileStats = useMemo(() => {
        const completedRows = formData.blows_data.filter(row => row.n > 0).length;
        const totalRows = formData.blows_data.length;
        const percentComplete = Math.round((completedRows / totalRows) * 100);

        const maxN = Math.max(...formData.blows_data.map(row => parseInt(row.n) || 0));
        const depthsWithData = formData.blows_data.filter(blow => blow.n > 0);
        const maxDepth = depthsWithData.length
            ? Math.max(...depthsWithData.map(blow => parseFloat(blow.depth) || 0))
            : 0;

        return { completedRows, totalRows, percentComplete, maxN, maxDepth };
    }, [formData.blows_data]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación para sounding_number
        if (!formData.sounding_number || formData.sounding_number === "") {
            setNotification({
                open: true,
                message: "Debe ingresar un número de sondeo",
                severity: "error"
            });
            setSoundingNumberError(true);
            return;
        }

        try {
            setLoading(true);

            // Preparar los datos para enviar
            const payload = {
                sounding_number: formData.sounding_number,
                water_level: formData.water_level || "",
                profile_date: formData.profile_date,
                samples_number: parseInt(formData.samples_number) || 0,
                blows_data: formData.blows_data.map(blow => ({
                    depth: parseFloat(blow.depth),
                    blows6: parseInt(blow.blows6) || 0,
                    blows12: parseInt(blow.blows12) || 0,
                    blows18: parseInt(blow.blows18) || 0,
                    n: parseInt(blow.n) || 0,
                    observation: blow.observation || ""
                }))
            };

            const endpoint = profileId && profileId !== 'nuevo'
                ? `/projects/${projectId}/profiles/${profileId}`
                : `/projects/${projectId}/profiles`;

            const method = profileId && profileId !== 'nuevo' ? 'put' : 'post';

            const response = await api[method](endpoint, payload);
            console.log(response, payload);
            setLoading(false);
            setNotification({
                open: true,
                message: `Perfil ${method === 'put' ? 'actualizado' : 'creado'} correctamente`,
                severity: 'success'
            });

            // Breve retraso antes de navegar para que el usuario vea la notificación
            setTimeout(() => {
                navigate(`/lab/proyectos/${projectId}/perfiles`);
            }, 1000);
        } catch (error) {
            console.error("Error saving profile:", error);
            setLoading(false);
            setNotification({
                open: true,
                message: error.response?.data?.message || "Error al guardar el perfil",
                severity: 'error'
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // Vista optimizada para dispositivos móviles
    if (isMobile) {
        return (
            <Container sx={{ py: 2, px: 1, mb: 8 }}>
                {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }} />}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(`/lab/proyectos/${projectId}/perfiles`)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {profileId && profileId !== 'nuevo' ? "Editar" : "Nuevo"} Perfil
                    </Typography>
                </Box>

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Información Básica</Typography>

                    <Alert
                        severity={soundingNumberError ? "error" : "info"}
                        sx={{ mb: 2 }}
                    >
                        El número de sondeo es obligatorio y debe tener un valor.
                    </Alert>

                    <TextField
                        label="N° Sondeo"
                        name="sounding_number"
                        value={formData.sounding_number}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                        required
                        error={soundingNumberError}
                        helperText={soundingNumberError ? "Campo obligatorio - Debe ingresar un valor" : ""}
                        placeholder="Ingrese el número de sondeo"
                        slotProps={{
                            inputProps: {
                                sx: {
                                    borderWidth: soundingNumberError ? 2 : 1,
                                    backgroundColor: soundingNumberError ? 'rgba(211, 47, 47, 0.05)' : undefined
                                }
                            }
                        }}
                        onBlur={() => setSoundingNumberError(!formData.sounding_number.trim())}
                    />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            label="Nivel Freático"
                            name="water_level"
                            value={formData.water_level}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            size="small"
                            slotProps={{
                                inputProps: {
                                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                                    startAdornment: formData.water_level && formData.water_level !== "ninguno" ? (
                                        <InputAdornment position="start">
                                            <WaterDropIcon color="primary" fontSize="small" />
                                        </InputAdornment>
                                    ) : null
                                }
                            }
                            }
                        />
                        <TextField
                            label="Muestras"
                            name="samples_number"
                            type="number"
                            value={formData.samples_number}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            size="small"
                            slotProps={{
                                inputProps: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LayersIcon fontSize="small" />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Box>

                    <TextField
                        label="Fecha"
                        name="profile_date"
                        type="date"
                        value={formData.profile_date}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                    />

                    {/* Resumen de avance */}
                    {profileStats.totalRows > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Avance: {profileStats.completedRows}/{profileStats.totalRows} profundidades
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {profileStats.percentComplete}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={profileStats.percentComplete}
                                sx={{ height: 8, borderRadius: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Chip
                                    size="small"
                                    label={`N máx: ${profileStats.maxN}`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    size="small"
                                    label={`Prof. máx: ${profileStats.maxDepth}m`}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    )}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">
                        Datos de Golpes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Toca para expandir
                    </Typography>
                </Box>

                {formData.blows_data.map((row, index) => (
                    <Accordion
                        key={index}
                        expanded={expandedDepth === row.depth}
                        onChange={handleAccordionChange(row.depth)}
                        sx={{
                            mb: 1,
                            backgroundColor: row.n > 0 ? '#f5f9ff' : undefined,
                            border: row.n > 0 ? '1px solid #e3f2fd' : undefined
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { margin: '8px 0' } }}
                        >
                            <Typography sx={{ width: '30%', flexShrink: 0, fontSize: '0.9rem' }}>
                                {row.depth} m
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                N: <strong>{row.n}</strong>
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label='6"'
                                        type="number"
                                        value={row.blows6}
                                        onChange={(e) => handleBlowChange(index, 'blows6', e.target.value)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                                    />
                                    <TextField
                                        label='12"'
                                        type="number"
                                        value={row.blows12}
                                        onChange={(e) => handleBlowChange(index, 'blows12', e.target.value)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                                    />
                                    <TextField
                                        label='18"'
                                        type="number"
                                        value={row.blows18}
                                        onChange={(e) => handleBlowChange(index, 'blows18', e.target.value)}
                                        fullWidth
                                        size="small"
                                        slotProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Valor N (12" + 18"):
                                    </Typography>
                                    <Chip
                                        label={row.n}
                                        size="small"
                                        color={row.n > 0 ? "primary" : "default"}
                                    />
                                </Box>
                                <TextField
                                    label="Observaciones"
                                    value={row.observation || ""}
                                    onChange={(e) => handleBlowChange(index, 'observation', e.target.value)}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    placeholder="Ej: Color, textura, tipo de suelo..."
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}

                <Box sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    zIndex: 5
                }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        size="large"
                        disabled={loading}
                    >
                        {profileId && profileId !== 'nuevo' ? "Actualizar" : "Guardar"} Perfil
                    </Button>
                </Box>

                <Snackbar
                    open={notification.open}
                    autoHideDuration={5000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        );
    }

    // Vista para pantallas más grandes (tablet/desktop)
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {loading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100 }} />}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(`/lab/proyectos/${projectId}/perfiles`)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ ml: 1 }}>
                    {profileId && profileId !== 'nuevo' ? "Editar" : "Crear"} Perfil de Suelo
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Alert
                    severity={soundingNumberError ? "error" : "info"}
                    sx={{ mb: 3 }}
                >
                    El número de sondeo es obligatorio y debe tener un valor.
                </Alert>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    <TextField
                        label="Número de Sondeo"
                        name="sounding_number"
                        value={formData.sounding_number}
                        onChange={handleChange}
                        required
                        size="small"
                        error={soundingNumberError}
                        helperText={soundingNumberError ? "Campo obligatorio - Debe ingresar un valor" : ""}
                        placeholder="Ej: 1, S-01, etc."
                        slotProps={{
                            inputProps: {
                                sx: {
                                    borderWidth: soundingNumberError ? 2 : 1,
                                    backgroundColor: soundingNumberError ? 'rgba(211, 47, 47, 0.05)' : undefined
                                }
                            }
                        }}
                        onBlur={() => setSoundingNumberError(!formData.sounding_number.trim())}
                    />

                    <TextField
                        label="Nivel Freático"
                        name="water_level"
                        value={formData.water_level}
                        onChange={handleChange}
                        size="small"
                        slotProps={{
                            inputProps: {
                                endAdornment: <InputAdornment position="end">m</InputAdornment>,
                                startAdornment: formData.water_level && formData.water_level !== "ninguno" ? (
                                    <InputAdornment position="start">
                                        <WaterDropIcon color="primary" fontSize="small" />
                                    </InputAdornment>
                                ) : null
                            }
                        }}
                    />

                    <TextField
                        label="Fecha"
                        name="profile_date"
                        type="date"
                        value={formData.profile_date}
                        onChange={handleChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        size="small"
                    />

                    <TextField
                        label="Número de Muestras"
                        name="samples_number"
                        type="number"
                        value={formData.samples_number}
                        onChange={handleChange}
                        size="small"
                        slotProps={{
                            inputProps: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LayersIcon fontSize="small" />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Box>

                {/* Resumen de avance */}
                {profileStats.totalRows > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">
                                Avance del perfil: {profileStats.completedRows}/{profileStats.totalRows} profundidades
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {profileStats.percentComplete}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={profileStats.percentComplete}
                            sx={{ height: 10, borderRadius: 2 }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Chip
                                size="small"
                                label={`N máximo: ${profileStats.maxN}`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                size="small"
                                label={`Profundidad máxima: ${profileStats.maxDepth}m`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Datos de Golpes
                </Typography>

                <Box sx={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 1 }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Profundidad (m)</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>6"</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>12"</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>18"</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>N</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.blows_data.map((row, index) => (
                                <tr key={index} style={{
                                    borderBottom: '1px solid #eee',
                                    backgroundColor: row.n > 0 ? '#f5f9ff' : undefined
                                }}>
                                    <td style={{ padding: '8px' }}>{row.depth}</td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            type="number"
                                            value={row.blows6}
                                            onChange={(e) => handleBlowChange(index, 'blows6', e.target.value)}
                                            size="small"
                                            fullWidth
                                            slotProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            type="number"
                                            value={row.blows12}
                                            onChange={(e) => handleBlowChange(index, 'blows12', e.target.value)}
                                            size="small"
                                            fullWidth
                                            slotProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            type="number"
                                            value={row.blows18}
                                            onChange={(e) => handleBlowChange(index, 'blows18', e.target.value)}
                                            size="small"
                                            fullWidth
                                            slotProps={{ inputProps: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                                        />
                                    </td>
                                    <td style={{
                                        padding: '8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        color: row.n > 0 ? '#1976d2' : 'inherit'
                                    }}>
                                        {row.n}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            value={row.observation || ""}
                                            onChange={(e) => handleBlowChange(index, 'observation', e.target.value)}
                                            size="small"
                                            fullWidth
                                            placeholder="Descripción del suelo"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/lab/proyectos/${projectId}/perfiles`)}
                    size="large"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    size="large"
                    disabled={loading}
                >
                    {profileId && profileId !== 'nuevo' ? "Actualizar" : "Guardar"} Perfil
                </Button>
            </Box>

            <Snackbar
                open={notification.open}
                autoHideDuration={5000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default FormCreateProfile;