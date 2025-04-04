import { useState, useEffect } from 'react';
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
    Divider
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from "../../../api";

const DEPTH_INCREMENT = 0.45;
const DEPTH_LEVELS = 14;

const FormCreateProfile = () => {
    const [formData, setFormData] = useState({
        sounding_number: "1",
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
    const navigate = useNavigate();
    const { projectId, profileId } = useParams(); // Asegúrate que estos nombres coincidan con tus rutas
    const isMobile = useMediaQuery('(max-width:768px)');

    // Cargar datos si estamos editando
    useEffect(() => {
        if (!profileId) return;

        const fetchProfile = async () => {
            try {
                const res = await api.get(`/projects/${projectId}/profiles/${profileId}`);
                const profile = res.data.perfil;

                setFormData({
                    sounding_number: profile.sounding_number,
                    water_level: profile.water_level,
                    profile_date: profile.profile_date.split('T')[0],
                    samples_number: profile.samples_number,
                    blows_data: profile.blows_data.map(blow => ({
                        ...blow,
                        blows6: blow.blows6.toString(),
                        blows12: blow.blows12.toString(),
                        blows18: blow.blows18.toString(),
                        n: blow.n.toString()
                    }))
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [projectId, profileId]);

    // Resto del código sigue igual...
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBlowChange = (index, field, value) => {
        setFormData(prev => {
            const newBlowsData = [...prev.blows_data];
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

            return {
                ...prev,
                blows_data: newBlowsData
            };
        });
    };

    const handleAccordionChange = (depth) => (_, isExpanded) => {
        setExpandedDepth(isExpanded ? depth : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                blows_data: formData.blows_data.map(blow => ({
                    depth: parseFloat(blow.depth),
                    blows6: parseInt(blow.blows6) || 0,
                    blows12: parseInt(blow.blows12) || 0,
                    blows18: parseInt(blow.blows18) || 0,
                    n: parseInt(blow.n) || 0,
                    observation: blow.observation
                }))
            };

            const endpoint = profileId
                ? `/projects/${projectId}/profiles/${profileId}`
                : `/projects/${projectId}/profiles`;

            const method = profileId ? 'put' : 'post';

            await api[method](endpoint, payload);
            navigate(`/projects/${projectId}/profiles`);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert(error.response?.data?.message || "Error al guardar el perfil");
        }
    };

    // Vista móvil optimizada para campo
    if (isMobile) {
        return (
            <Container sx={{ py: 2, px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(`/projects/${projectId}/profiles`)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {profileId ? "Editar" : "Nuevo"} Perfil
                    </Typography>
                </Box>

                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Información Básica</Typography>

                    <TextField
                        label="N° Sondeo"
                        name="sounding_number"
                        value={formData.sounding_number}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        size="small"
                        required
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
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                </Paper>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Datos de Golpes por Profundidad
                </Typography>

                {formData.blows_data.map((row, index) => (
                    <Accordion
                        key={index}
                        expanded={expandedDepth === row.depth}
                        onChange={handleAccordionChange(row.depth)}
                        sx={{ mb: 1 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ width: '33%', flexShrink: 0 }}>
                                {row.depth} m
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                N: {row.n} | 6": {row.blows6} | 12": {row.blows12} | 18": {row.blows18}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        label='Golpes 6"'
                                        type="number"
                                        value={row.blows6}
                                        onChange={(e) => handleBlowChange(index, 'blows6', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label='Golpes 12"'
                                        type="number"
                                        value={row.blows12}
                                        onChange={(e) => handleBlowChange(index, 'blows12', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                    <TextField
                                        label='Golpes 18"'
                                        type="number"
                                        value={row.blows18}
                                        onChange={(e) => handleBlowChange(index, 'blows18', e.target.value)}
                                        fullWidth
                                        size="small"
                                    />
                                </Box>
                                <TextField
                                    label="N (automático)"
                                    type="number"
                                    value={row.n}
                                    disabled
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Observaciones"
                                    value={row.observation}
                                    onChange={(e) => handleBlowChange(index, 'observation', e.target.value)}
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))}

                <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: 'background.paper', boxShadow: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        size="large"
                    >
                        {profileId ? "Actualizar" : "Guardar"} Perfil
                    </Button>
                </Box>
            </Container>
        );
    }

    // Vista para pantallas más grandes (tablet/desktop)
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate(`/projects/${projectId}/profiles`)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ ml: 1 }}>
                    {profileId ? "Editar" : "Crear"} Perfil de Suelo
                </Typography>
            </Box>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    <TextField
                        label="Número de Sondeo"
                        name="sounding_number"
                        value={formData.sounding_number}
                        onChange={handleChange}
                        required
                        size="small"
                    />

                    <TextField
                        label="Nivel Freático"
                        name="water_level"
                        value={formData.water_level}
                        onChange={handleChange}
                        size="small"
                    />

                    <TextField
                        label="Fecha"
                        name="profile_date"
                        type="date"
                        value={formData.profile_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
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
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Datos de Golpes
                </Typography>

                <Box sx={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
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
                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>{row.depth}</td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            type="number"
                                            value={row.blows6}
                                            onChange={(e) => handleBlowChange(index, 'blows6', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            type="number"
                                            value={row.blows12}
                                            onChange={(e) => handleBlowChange(index, 'blows12', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            type="number"
                                            value={row.blows18}
                                            onChange={(e) => handleBlowChange(index, 'blows18', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{row.n}</td>
                                    <td style={{ padding: '8px' }}>
                                        <TextField
                                            value={row.observation}
                                            onChange={(e) => handleBlowChange(index, 'observation', e.target.value)}
                                            size="small"
                                            fullWidth
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
                    onClick={() => navigate(`/projects/${projectId}/profiles`)}
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
                >
                    {profileId ? "Actualizar" : "Guardar"} Perfil
                </Button>
            </Box>
        </Container>
    );
};

export default FormCreateProfile;