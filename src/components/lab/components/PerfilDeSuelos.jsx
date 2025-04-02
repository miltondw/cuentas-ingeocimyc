import { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    Button,
    useMediaQuery,
} from '@mui/material';
import PropTypes from 'prop-types';

// Datos de ejemplo (puedes pasarlos como props)
const profileData = {
    project: "CONSTRUCCIÓN DE EDIFICACIÓN DE 5 NIVELES EN EL SECTOR DEL BARRIO LA TORCOROMA, OCAÑA NORTE DE SANTANDER",
    location: "BARRIO LA TORCOROMA, OCAÑA, NORTE DE SANTANDER",
    date: "MARZO DE 2022",
    waterLevel: "NO SE ENCONTRÓ",
    samples: 2,
};

// Generar profundidades de 0.45 a 6.30 con incrementos de 0.45
const depths = Array.from({ length: 14 }, (_, i) => (i + 1) * 0.45);

const PerfilesDeSuelo = ({ data = profileData }) => {
    const isMobile = useMediaQuery('(max-width:600px)'); // Detectar si es pantalla móvil

    // Estados
    const [waterLevel, setWaterLevel] = useState(data.waterLevel);
    const [date, setDate] = useState(data.date);
    const [soundingNumber, setSoundingNumber] = useState("1");
    const [muestrasNumber, setMuestrasNumber] = useState(data.samples);
    const [blowsData, setBlowsData] = useState(
        depths.map((depth) => ({
            depth,
            blows6: null,
            blows12: null,
            blows18: null,
            n: null,
            observation: "",
        }))
    );

    // Manejar cambios en los golpes
    const handleBlowsChange = (index, field, value) => {
        const newBlowsData = [...blowsData];
        newBlowsData[index][field] = parseInt(value) || 0;
        newBlowsData[index].n = newBlowsData[index].blows12 + newBlowsData[index].blows18;
        setBlowsData(newBlowsData);
    };

    // Manejar cambios en las observaciones
    const handleTextChange = (index, field, value) => {
        const newBlowsData = [...blowsData];
        newBlowsData[index][field] = value;
        setBlowsData(newBlowsData);
    };

    // Guardar los datos
    const handleSave = () => {
        const savedData = {
            soundingNumber,
            waterLevel,
            date,
            samples: muestrasNumber,
            blowsData,
        };
        console.log("Datos guardados:", savedData);
        alert("Datos guardados. Revisa la consola para ver los datos.");
    };

    return (
        <Box sx={{ padding: 2, maxWidth: 900, margin: 'auto' }}>
            {/* Título */}
            <Typography variant={isMobile ? "h4" : "h2"} align="center" gutterBottom>
                PERFIL DE SUELOS
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                    SONDEO N°
                </Typography>
                <TextField
                    type="number"
                    value={soundingNumber}
                    onChange={(e) => setSoundingNumber(e.target.value)}
                    size="small"
                    sx={{ width: 60 }}
                />
            </Box>

            {/* Información superior */}
            <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>PROYECTO</TableCell>
                            <TableCell>{data.project}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>UBICACIÓN</TableCell>
                            <TableCell>{data.location}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>FECHA</TableCell>
                            <TableCell>
                                <TextField
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>NIVEL FREÁTICO</TableCell>
                            <TableCell>
                                <TextField
                                    value={waterLevel}
                                    onChange={(e) => setWaterLevel(e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>NÚMERO DE MUESTRAS</TableCell>
                            <TableCell>
                                <TextField
                                    type="number"
                                    value={muestrasNumber}
                                    onChange={(e) => setMuestrasNumber(e.target.value)}
                                    size="small"
                                    sx={{ width: 60 }}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Tabla de perfil de suelos */}
            {isMobile ? (
                // Vista móvil: bloques verticales
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {blowsData.map((row, index) => (
                        <Paper key={index} sx={{ padding: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Profundidad: {row.depth.toFixed(2)} m
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <TextField
                                    label="Golpes 6\"
                                    type="number"
                                    value={row.blows6}
                                    onChange={(e) => handleBlowsChange(index, 'blows6', e.target.value)}
                                    size="small"
                                />
                                <TextField
                                    label="Golpes 12\"
                                    type="number"
                                    value={row.blows12}
                                    onChange={(e) => handleBlowsChange(index, 'blows12', e.target.value)}
                                    size="small"
                                />
                                <TextField
                                    label="Golpes 18\"
                                    type="number"
                                    value={row.blows18}
                                    onChange={(e) => handleBlowsChange(index, 'blows18', e.target.value)}
                                    size="small"
                                />
                                <Typography variant="body1">N: {row.n || 0}</Typography>
                                <TextField
                                    label="Descripción y Observaciones"
                                    value={row.observation}
                                    onChange={(e) => handleTextChange(index, 'observation', e.target.value)}
                                    size="small"
                                    multiline
                                    rows={2}
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            ) : (
                // Vista de escritorio: tabla horizontal
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Escala Pulg (m)</TableCell>
                                <TableCell align="center" colSpan={3}>NÚMERO DE GOLPES</TableCell>
                                <TableCell align="center">N</TableCell>
                                <TableCell align="center">DESCRIPCIÓN Y OBSERVACIONES</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell align="center">6"</TableCell>
                                <TableCell align="center">12"</TableCell>
                                <TableCell align="center">18"</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {blowsData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">{row.depth.toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            value={row.blows6}
                                            onChange={(e) => handleBlowsChange(index, 'blows6', e.target.value)}
                                            size="small"
                                            sx={{ width: 60 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            value={row.blows12}
                                            onChange={(e) => handleBlowsChange(index, 'blows12', e.target.value)}
                                            size="small"
                                            sx={{ width: 60 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            value={row.blows18}
                                            onChange={(e) => handleBlowsChange(index, 'blows18', e.target.value)}
                                            size="small"
                                            sx={{ width: 60 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">{row.n || 0}</TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            value={row.observation}
                                            onChange={(e) => handleTextChange(index, 'observation', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Botón para guardar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" onClick={handleSave}>
                    Guardar
                </Button>
            </Box>

            {/* Número de página */}
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Página 1
            </Typography>
        </Box>
    );
};

PerfilesDeSuelo.propTypes = {
    data: PropTypes.shape({
        project: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        waterLevel: PropTypes.string.isRequired,
        samples: PropTypes.number.isRequired,
    }).isRequired,
};

export default PerfilesDeSuelo;