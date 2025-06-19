import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useMediaQuery,
  InputAdornment,
  Chip,
  LinearProgress,
  Grid2,
  Card,
  CardContent,
  Stack,
  Tooltip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  WaterDrop as WaterDropIcon,
  Layers as LayersIcon,
  Save as SaveIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

import { labService } from "@/services/api/labService";
import { useNotifications } from "@/hooks/useNotifications";

// Constantes para el perfil
const DEPTH_INCREMENT = 0.45;
const DEPTH_LEVELS = 14;

// Interfaces para los datos del formulario
interface BlowData {
  depth: string;
  blows6: string | number;
  blows12: string | number;
  blows18: string | number;
  n: number;
  observation: string;
}

interface ProfileFormData {
  soundingNumber: string;
  waterLevel: number | string;
  profileDate: string;
  samplesNumber: number;
  location: string;
  description: string;
  observations: string;
  blowsData: BlowData[];
}

const PerfilDeSuelos = () => {
  const { projectId, profileId } = useParams<{
    projectId: string;
    profileId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<ProfileFormData>({
    soundingNumber: "",
    waterLevel: "",
    profileDate: new Date().toISOString().split("T")[0],
    samplesNumber: 0,
    location: "",
    description: "",
    observations: "",
    blowsData: Array.from({ length: DEPTH_LEVELS }, (_, i) => ({
      depth: ((i + 1) * DEPTH_INCREMENT).toFixed(2),
      blows6: "",
      blows12: "",
      blows18: "",
      n: 0,
      observation: "",
    })),
  });

  const [expandedDepth, setExpandedDepth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Verificar si estamos editando o creando
  const isEditing = useMemo(
    () => profileId && profileId !== "nuevo",
    [profileId]
  );

  // Cargar datos del perfil si estamos editando
  useEffect(() => {
    if (!isEditing || !projectId) return;

    const fetchProfile = async () => {
      try {
        setInitialLoading(true);
        const profileIdNum = parseInt(profileId || "0");
        if (profileIdNum === 0) {
          showError("ID de perfil inválido");
          navigate(`/lab/proyectos/${projectId}/perfiles`);
          return;
        }

        const profileData = await labService.getProfile(profileIdNum);

        // Mapear los datos de la API al formato del formulario
        setFormData({
          soundingNumber: profileData.soundingNumber || "",
          waterLevel: profileData.waterLevel || "",
          profileDate:
            profileData.profileDate?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          samplesNumber: profileData.samplesNumber || 0,
          location: profileData.location || "",
          description: "",
          observations: "",
          blowsData: Array.from({ length: DEPTH_LEVELS }, (_, i) => {
            const depth = ((i + 1) * DEPTH_INCREMENT).toFixed(2);
            const existingBlow = profileData.blows?.find(
              (blow) => parseFloat(blow.depth) === parseFloat(depth)
            );

            if (existingBlow) {
              return {
                depth,
                blows6: existingBlow.blows6.toString(),
                blows12: existingBlow.blows12.toString(),
                blows18: existingBlow.blows18.toString(),
                n: existingBlow.n,
                observation: existingBlow.observation || "",
              };
            }

            return {
              depth,
              blows6: "",
              blows12: "",
              blows18: "",
              n: 0,
              observation: "",
            };
          }),
        });

        showSuccess("Perfil cargado correctamente");
      } catch (error) {
        console.error("Error fetching profile:", error);
        showError("Error al cargar el perfil");
        navigate(`/lab/proyectos/${projectId}/perfiles`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [isEditing, projectId, profileId, navigate, showSuccess, showError]);
  // Manejar cambios en campos básicos
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? 0 : parseFloat(value) || 0) : value,
    }));
  }, []);

  // Manejar cambios en datos de golpes
  const handleBlowChange = useCallback(
    (index: number, field: string, value: string) => {
      setFormData((prev) => {
        const newBlowsData = [...prev.blowsData];

        if (field === "observation") {
          newBlowsData[index] = {
            ...newBlowsData[index],
            [field]: value,
          };
        } else {
          // Para campos numéricos
          const numValue = value === "" ? "" : parseInt(value) || 0;
          newBlowsData[index] = {
            ...newBlowsData[index],
            [field]: numValue,
          };

          // Calcular N automáticamente (blows12 + blows18)
          if (field === "blows12" || field === "blows18") {
            const blows12 =
              field === "blows12" ? numValue : newBlowsData[index].blows12;
            const blows18 =
              field === "blows18" ? numValue : newBlowsData[index].blows18;

            if (blows12 !== "" && blows18 !== "") {
              newBlowsData[index].n =
                (parseInt(blows12.toString()) || 0) +
                (parseInt(blows18.toString()) || 0);
            }
          }
        }

        return {
          ...prev,
          blowsData: newBlowsData,
        };
      });
    },
    []
  );

  // Manejar expansión de acordeones
  const handleAccordionChange = useCallback(
    (depth: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedDepth(isExpanded ? depth : null);
    },
    []
  );

  // Calcular estadísticas del perfil
  const profileStats = useMemo(() => {
    const completedRows = formData.blowsData.filter((row) => row.n > 0).length;
    const totalRows = formData.blowsData.length;
    const percentComplete = Math.round((completedRows / totalRows) * 100);

    const maxN = Math.max(...formData.blowsData.map((row) => row.n));
    const depthsWithData = formData.blowsData.filter((blow) => blow.n > 0);
    const maxDepth = depthsWithData.length
      ? Math.max(...depthsWithData.map((blow) => parseFloat(blow.depth) || 0))
      : 0;

    return { completedRows, totalRows, percentComplete, maxN, maxDepth };
  }, [formData.blowsData]);

  // Validar formulario
  const validateForm = useCallback((): boolean => {
    if (!formData.soundingNumber.trim()) {
      showError("El número de sondeo es obligatorio");
      return false;
    }

    if (!formData.profileDate) {
      showError("La fecha del perfil es obligatoria");
      return false;
    }

    return true;
  }, [formData, showError]);

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const projectIdNum = parseInt(projectId || "0");
      if (projectIdNum === 0) {
        showError("ID de proyecto inválido");
        return;
      } // Preparar datos para la API
      const payload = {
        projectId: projectIdNum,
        soundingNumber: formData.soundingNumber,
        waterLevel:
          typeof formData.waterLevel === "string"
            ? parseFloat(formData.waterLevel) || 0
            : formData.waterLevel,
        profileDate: formData.profileDate,
        samplesNumber: Number(formData.samplesNumber),
        location: formData.location || null,
        description: formData.description || null,
        observations: formData.observations || null,
        blows: formData.blowsData
          .filter((blow) => blow.n > 0) // Solo enviar golpes con datos
          .map((blow) => ({
            depth: parseFloat(blow.depth),
            blows6: parseInt(blow.blows6.toString()) || 0,
            blows12: parseInt(blow.blows12.toString()) || 0,
            blows18: parseInt(blow.blows18.toString()) || 0,
            n: blow.n,
            observation: blow.observation || null,
          })),
      };

      if (isEditing) {
        const profileIdNum = parseInt(profileId || "0");
        if (profileIdNum === 0) {
          showError("ID de perfil inválido");
          return;
        }
        await labService.updateProfile(profileIdNum, payload);
        showSuccess("Perfil actualizado correctamente");
      } else {
        await labService.createProfile(payload);
        showSuccess("Perfil creado correctamente");
      }

      setTimeout(() => {
        navigate(`/lab/proyectos/${projectId}/perfiles`);
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);
      showError("Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // Función para navegar atrás
  const handleGoBack = useCallback(() => {
    navigate(`/lab/proyectos/${projectId}/perfiles`);
  }, [navigate, projectId]);

  if (initialLoading) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          Cargando datos del perfil...
        </Typography>
      </Box>
    );
  }

  // Vista para móviles
  if (isMobile) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 2, mb: 8 }}>
        <Paper sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Tooltip title="Volver a la lista de perfiles">
              <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h5" component="h1">
              {isEditing ? "Editar" : "Nuevo"} Perfil
            </Typography>
          </Box>

          {/* Información básica */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Básica
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="N° Sondeo"
                  name="soundingNumber"
                  value={formData.soundingNumber}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!formData.soundingNumber.trim()}
                  helperText={
                    !formData.soundingNumber.trim() ? "Campo obligatorio" : ""
                  }
                  placeholder="Ej: S-01, 1, etc."
                />

                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    label="Nivel Freático"
                    name="waterLevel"
                    value={formData.waterLevel}
                    onChange={handleChange}
                    fullWidth
                    type="number"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">m</InputAdornment>
                        ),
                        startAdornment: formData.waterLevel ? (
                          <InputAdornment position="start">
                            <WaterDropIcon color="primary" fontSize="small" />
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                  />
                  <TextField
                    label="Muestras"
                    name="samplesNumber"
                    type="number"
                    value={formData.samplesNumber}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LayersIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <TextField
                  label="Fecha"
                  name="profileDate"
                  type="date"
                  value={formData.profileDate}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Ubicación"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  label="Observaciones"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Observaciones generales del perfil..."
                />
              </Stack>

              {/* Estadísticas */}
              {profileStats.totalRows > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Avance: {profileStats.completedRows}/
                      {profileStats.totalRows} profundidades
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
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
            </CardContent>
          </Card>

          {/* Datos de golpes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Datos de Golpes</Typography>
                <Typography variant="caption" color="text.secondary">
                  Toca para expandir
                </Typography>
              </Box>

              {formData.blowsData.map((row, index) => (
                <Accordion
                  key={index}
                  expanded={expandedDepth === row.depth}
                  onChange={handleAccordionChange(row.depth)}
                  sx={{
                    mb: 1,
                    backgroundColor: row.n > 0 ? "#f5f9ff" : undefined,
                    border: row.n > 0 ? "1px solid #e3f2fd" : undefined,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: "48px",
                      "& .MuiAccordionSummary-content": { margin: "8px 0" },
                    }}
                  >
                    <Typography
                      sx={{ width: "30%", flexShrink: 0, fontSize: "0.9rem" }}
                    >
                      {row.depth} m
                    </Typography>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                    >
                      N: <strong>{row.n}</strong>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          label='6"'
                          type="number"
                          value={row.blows6}
                          onChange={(e) =>
                            handleBlowChange(index, "blows6", e.target.value)
                          }
                          fullWidth
                          size="small"
                          slotProps={{
                            htmlInput: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                          }}
                        />
                        <TextField
                          label='12"'
                          type="number"
                          value={row.blows12}
                          onChange={(e) =>
                            handleBlowChange(index, "blows12", e.target.value)
                          }
                          fullWidth
                          size="small"
                          slotProps={{
                            htmlInput: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                          }}
                        />
                        <TextField
                          label='18"'
                          type="number"
                          value={row.blows18}
                          onChange={(e) =>
                            handleBlowChange(index, "blows18", e.target.value)
                          }
                          fullWidth
                          size="small"
                          slotProps={{
                            htmlInput: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Valor N (12&quot; + 18&quot;):
                        </Typography>
                        <Chip
                          label={row.n}
                          size="small"
                          color={row.n > 0 ? "primary" : "default"}
                        />
                      </Box>
                      <TextField
                        label="Observaciones"
                        value={row.observation}
                        onChange={(e) =>
                          handleBlowChange(index, "observation", e.target.value)
                        }
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Ej: Color, textura, tipo de suelo..."
                      />
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* Botón de guardar fijo */}
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              bgcolor: "background.paper",
              boxShadow: 3,
              zIndex: 5,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              size="large"
              disabled={loading}
              startIcon={loading ? undefined : <SaveIcon />}
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}{" "}
              Perfil
            </Button>
          </Box>

          {/* Loading overlay */}
          {loading && (
            <Box sx={{ width: "100%", mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  // Vista para desktop/tablet
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Tooltip title="Volver a la lista de perfiles">
            <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            {isEditing ? "Editar" : "Crear"} Perfil de Suelo
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
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Número de Sondeo"
                    name="soundingNumber"
                    value={formData.soundingNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!formData.soundingNumber.trim()}
                    helperText={
                      !formData.soundingNumber.trim() ? "Campo obligatorio" : ""
                    }
                    placeholder="Ej: S-01, 1, etc."
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Nivel Freático"
                    name="waterLevel"
                    value={formData.waterLevel}
                    onChange={handleChange}
                    fullWidth
                    type="number"
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">m</InputAdornment>
                        ),
                        startAdornment: formData.waterLevel ? (
                          <InputAdornment position="start">
                            <WaterDropIcon color="primary" fontSize="small" />
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Fecha"
                    name="profileDate"
                    type="date"
                    value={formData.profileDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Número de Muestras"
                    name="samplesNumber"
                    type="number"
                    value={formData.samplesNumber}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LayersIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label="Ubicación"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    label="Observaciones"
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Observaciones generales del perfil..."
                  />
                </Grid2>
              </Grid2>

              {/* Estadísticas */}
              {profileStats.totalRows > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      Avance del perfil: {profileStats.completedRows}/
                      {profileStats.totalRows} profundidades
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
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
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
            </CardContent>
          </Card>

          {/* Datos de golpes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Datos de Golpes
              </Typography>{" "}
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ maxHeight: 500 }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Profundidad (m)</TableCell>
                      <TableCell align="center">6&quot;</TableCell>
                      <TableCell align="center">12&quot;</TableCell>
                      <TableCell align="center">18&quot;</TableCell>
                      <TableCell align="center">N</TableCell>
                      <TableCell>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.blowsData.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: row.n > 0 ? "#f5f9ff" : undefined,
                        }}
                      >
                        <TableCell>{row.depth}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.blows6}
                            onChange={(e) =>
                              handleBlowChange(index, "blows6", e.target.value)
                            }
                            size="small"
                            fullWidth
                            slotProps={{
                              htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.blows12}
                            onChange={(e) =>
                              handleBlowChange(index, "blows12", e.target.value)
                            }
                            size="small"
                            fullWidth
                            slotProps={{
                              htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.blows18}
                            onChange={(e) =>
                              handleBlowChange(index, "blows18", e.target.value)
                            }
                            size="small"
                            fullWidth
                            slotProps={{
                              htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={row.n > 0 ? "primary.main" : "text.primary"}
                          >
                            {row.n}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.observation}
                            onChange={(e) =>
                              handleBlowChange(
                                index,
                                "observation",
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth
                            placeholder="Descripción del suelo"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
                  disabled={loading}
                  sx={{ minWidth: 140 }}
                >
                  {loading
                    ? "Guardando..."
                    : isEditing
                    ? "Actualizar"
                    : "Guardar"}{" "}
                  Perfil
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

export default PerfilDeSuelos;
