import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Box,
  Paper,
  Tooltip,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Layers as LayersIcon,
} from "@mui/icons-material";

import { labService, type ApiqueLayer } from "@/services/api/labService";
import { useNotifications } from "@/hooks/useNotifications";

// Interfaces para el formulario
interface LayerFormData {
  layer_number: number;
  thickness: number | string;
  sample_id: string;
  observation: string;
}

interface ApiqueFormData {
  sampleNumber: string;
  location: string;
  depth: number | string;
  collectionDate: string;
  cbrUnaltered: boolean;
  depthTomo: string;
  molde: string;
  layers: LayerFormData[];
}

const ApiquesDeSuelos = () => {
  const { projectId, apiqueId } = useParams<{
    projectId: string;
    apiqueId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<ApiqueFormData>({
    sampleNumber: "",
    location: "",
    depth: 0,
    collectionDate: new Date().toISOString().split("T")[0],
    cbrUnaltered: false,
    depthTomo: "",
    molde: "",
    layers: [],
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Verificar si estamos editando o creando
  const isEditing = useMemo(() => apiqueId && apiqueId !== "nuevo", [apiqueId]);

  // Cargar datos desde la API si estamos editando
  useEffect(() => {
    if (!isEditing || !projectId) return;

    const fetchApique = async () => {
      try {
        setInitialLoading(true);
        const apiqueIdNum = parseInt(apiqueId || "0");
        if (apiqueIdNum === 0) {
          showError("ID de apique inválido");
          navigate(`/lab/proyectos/${projectId}/apiques`);
          return;
        }
        const apiqueData = await labService.getApique(
          apiqueIdNum,
          Number(projectId)
        );
        setFormData({
          sampleNumber: apiqueData.apique?.toString() || "",
          location: apiqueData.location || "",
          depth: apiqueData.depth || 0,
          collectionDate:
            apiqueData.date?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          cbrUnaltered: apiqueData.cbr_unaltered === 1,
          depthTomo: apiqueData.depth_tomo || "",
          molde: apiqueData.molde?.toString() || "",
          layers:
            apiqueData.layers?.map((layer: ApiqueLayer) => ({
              layer_number: layer.layerNumber || 1,
              thickness: parseFloat(layer.thickness) || 0,
              sample_id: layer.sampleId || "",
              observation: layer.observation || "",
            })) || [],
        });

        showSuccess("Apique cargado correctamente");
      } catch (error) {
        console.error("Error cargando apique:", error);
        showError("Error al cargar el apique");
        navigate(`/lab/proyectos/${projectId}/apiques`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchApique();
  }, [isEditing, projectId, apiqueId, navigate, showSuccess, showError]);

  // Manejar cambios en campos básicos
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Agregar una nueva capa
  const addLayer = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      layers: [
        ...prev.layers,
        {
          layer_number: prev.layers.length + 1,
          thickness: 0,
          sample_id: "",
          observation: "",
        },
      ],
    }));
  }, []);

  // Eliminar una capa
  const removeLayer = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      layers: prev.layers
        .filter((_, i) => i !== index)
        .map((layer, i) => ({ ...layer, layer_number: i + 1 })),
    }));
  }, []);

  // Manejar cambios en datos de capa
  const handleLayerChange = useCallback(
    (index: number, field: string, value: string) => {
      setFormData((prev) => {
        const newLayers = [...prev.layers];
        newLayers[index] = {
          ...newLayers[index],
          [field]: field === "thickness" ? parseFloat(value) || 0 : value,
        };
        return { ...prev, layers: newLayers };
      });
    },
    []
  );

  // Calcular profundidad total
  const totalDepth = useMemo(() => {
    return formData.layers
      .reduce((sum, layer) => sum + Number(layer.thickness || 0), 0)
      .toFixed(2);
  }, [formData.layers]);

  // Actualizar profundidad en formData cuando cambian las capas
  useEffect(() => {
    setFormData((prev) => ({ ...prev, depth: totalDepth }));
  }, [totalDepth]);

  // Validar formulario
  const validateForm = useCallback((): boolean => {
    if (!formData.sampleNumber.trim()) {
      showError("El número de apique es requerido");
      return false;
    }

    if (!formData.location.trim()) {
      showError("La ubicación es requerida");
      return false;
    }

    if (
      formData.depthTomo &&
      (isNaN(Number(formData.depthTomo)) || Number(formData.depthTomo) < 0)
    ) {
      showError("Profundidad de toma debe ser un número positivo");
      return false;
    }

    if (formData.cbrUnaltered && !formData.molde.trim()) {
      showError("El molde es requerido cuando CBR Inalterado está marcado");
      return false;
    }

    if (formData.layers.length === 0) {
      showError("Debe agregar al menos una capa");
      return false;
    }

    // Validar capas
    for (let i = 0; i < formData.layers.length; i++) {
      const layer = formData.layers[i];
      if (!layer.thickness || Number(layer.thickness) <= 0) {
        showError(`El espesor de la capa ${i + 1} debe ser mayor a 0`);
        return false;
      }
    }

    return true;
  }, [formData, showError]);

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const projectIdNum = parseInt(projectId || "0");
      if (projectIdNum === 0) {
        showError("ID de proyecto inválido");
        return;
      }
      const payload = {
        proyecto_id: projectIdNum,
        apique: parseInt(formData.sampleNumber),
        location: formData.location,
        depth: Number(formData.depth),
        date: formData.collectionDate,
        cbr_unaltered: formData.cbrUnaltered,
        depth_tomo: formData.depthTomo ? Number(formData.depthTomo) : null,
        molde: formData.molde ? parseInt(formData.molde) : null,
        layers: formData.layers.map((layer) => ({
          layer_number: layer.layer_number,
          thickness: Number(layer.thickness),
          sample_id: layer.sample_id || null,
          observation: layer.observation || null,
        })),
      };
      if (isEditing) {
        const apiqueIdNum = parseInt(apiqueId || "0");
        if (apiqueIdNum === 0) {
          showError("ID de apique inválido");
          return;
        }
        await labService.updateApique(apiqueIdNum, projectIdNum, payload);
        showSuccess("Apique actualizado correctamente");
      } else {
        await labService.createApique(payload);
        showSuccess("Apique creado correctamente");
      }

      setTimeout(() => {
        navigate(`/lab/proyectos/${projectId}/apiques`);
      }, 1500);
    } catch (error) {
      console.error("Error guardando apique:", error);
      showError("Error al guardar el apique");
    } finally {
      setLoading(false);
    }
  };

  // Función para navegar atrás
  const handleGoBack = useCallback(() => {
    navigate(`/lab/proyectos/${projectId}/apiques`);
  }, [navigate, projectId]);

  if (initialLoading) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          Cargando datos del apique...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Tooltip title="Volver a la lista de apiques">
            <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            {isEditing ? "Editar Apique" : "Crear Nuevo Apique"}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Número de Apique"
                    name="sampleNumber"
                    value={formData.sampleNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!formData.sampleNumber.trim()}
                    helperText={
                      !formData.sampleNumber.trim() ? "Campo requerido" : ""
                    }
                    aria-label="Número de apique (requerido)"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Ubicación"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!formData.location.trim()}
                    helperText={
                      !formData.location.trim() ? "Campo requerido" : ""
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Fecha de Recolección"
                    name="collectionDate"
                    type="date"
                    value={formData.collectionDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Profundidad Total (m)"
                    name="depth"
                    value={formData.depth}
                    disabled
                    fullWidth
                    helperText="Calculado automáticamente desde las capas"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Profundidad a la que se tomó (m)"
                    name="depthTomo"
                    type="number"
                    value={formData.depthTomo}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        step: "0.01",
                        min: 0,
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.cbrUnaltered}
                        onChange={handleChange}
                        name="cbrUnaltered"
                      />
                    }
                    label="CBR Inalterado"
                  />
                  {formData.cbrUnaltered && (
                    <TextField
                      label="Molde"
                      type="number"
                      name="molde"
                      value={formData.molde}
                      onChange={handleChange}
                      fullWidth
                      required={formData.cbrUnaltered}
                      sx={{ mt: 1 }}
                      slotProps={{
                        htmlInput: {
                          min: 1,
                        },
                      }}
                    />
                  )}
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>

          {/* Capas */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LayersIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Capas ({formData.layers.length})
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addLayer}
                  size="small"
                >
                  Agregar Capa
                </Button>
              </Box>

              {formData.layers.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No hay capas definidas. Haga clic en &quot;Agregar
                    Capa&quot; para comenzar.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Vista escritorio: Tabla */}
                  {!isMobile && (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Número de Capa</TableCell>
                            <TableCell>Espesor (m)</TableCell>
                            <TableCell>Identificación de Muestra</TableCell>
                            <TableCell>Observación</TableCell>
                            <TableCell align="center">Acción</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.layers.map((layer, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  Capa {layer.layer_number}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  value={layer.thickness}
                                  onChange={(e) =>
                                    handleLayerChange(
                                      index,
                                      "thickness",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                  fullWidth
                                  required
                                  slotProps={{
                                    htmlInput: {
                                      step: "0.01",
                                      min: 0.01,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  value={layer.sample_id}
                                  onChange={(e) =>
                                    handleLayerChange(
                                      index,
                                      "sample_id",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                  fullWidth
                                  placeholder="Opcional"
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  value={layer.observation}
                                  onChange={(e) =>
                                    handleLayerChange(
                                      index,
                                      "observation",
                                      e.target.value
                                    )
                                  }
                                  size="small"
                                  fullWidth
                                  placeholder="Opcional"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip
                                  title={`Eliminar capa ${layer.layer_number}`}
                                >
                                  <IconButton
                                    onClick={() => removeLayer(index)}
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Vista móvil: Acordeones */}
                  {isMobile && (
                    <Box>
                      {formData.layers.map((layer, index) => (
                        <Accordion key={index} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              Capa {layer.layer_number} - {layer.thickness}m
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Stack spacing={2}>
                              <TextField
                                label="Espesor (m)"
                                type="number"
                                value={layer.thickness}
                                onChange={(e) =>
                                  handleLayerChange(
                                    index,
                                    "thickness",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                required
                                slotProps={{
                                  htmlInput: {
                                    step: "0.01",
                                    min: 0.01,
                                  },
                                }}
                              />
                              <TextField
                                label="Identificación de Muestra"
                                value={layer.sample_id}
                                onChange={(e) =>
                                  handleLayerChange(
                                    index,
                                    "sample_id",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                placeholder="Opcional"
                              />
                              <TextField
                                label="Observación"
                                value={layer.observation}
                                onChange={(e) =>
                                  handleLayerChange(
                                    index,
                                    "observation",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Opcional"
                              />
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => removeLayer(index)}
                                startIcon={<DeleteIcon />}
                                size="small"
                              >
                                Eliminar Capa
                              </Button>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? undefined : <SaveIcon />}
                  disabled={loading || formData.layers.length === 0}
                  sx={{ minWidth: 140 }}
                >
                  {loading
                    ? "Guardando..."
                    : isEditing
                    ? "Actualizar"
                    : "Crear"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </form>

        {/* Loading overlay */}
        {loading && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ApiquesDeSuelos;
