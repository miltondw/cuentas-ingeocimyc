// components/PerfilDeSuelos/MobileProfileView.tsx
import {
  Container,
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Alert,
  Chip,
  LinearProgress,
  InputAdornment,
  Snackbar,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LayersIcon from "@mui/icons-material/Layers";
import {
  ProfileFormData,
  ProfileStats,
  Notification,
  BlowData,
} from "./profileTypes";

interface MobileProfileViewProps {
  formData: ProfileFormData;
  profileId: string | undefined;
  projectId: string | undefined;
  profileStats: ProfileStats;
  soundingNumberError: boolean;
  expandedDepth: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlowChange: (
    index: number,
    field: keyof BlowData,
    value: string | number
  ) => void;
  handleAccordionChange: (
    depth: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseNotification: () => void;
  notification: Notification;
  navigate: (path: string) => void;
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MobileProfileView = ({
  formData,
  profileId,
  projectId,
  profileStats,
  soundingNumberError,
  expandedDepth,
  handleChange,
  handleBlowChange,
  handleAccordionChange,
  handleSubmit,
  handleCloseNotification,
  notification,
}: MobileProfileViewProps) => {
  const setSoundingNumberError = useState(soundingNumberError)[1];
  const navigate = useNavigate();
  return (
    <Container sx={{ py: 2, px: 1, mb: 8 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/lab/proyectos/${projectId}/perfiles`)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          {profileId && profileId !== "nuevo" ? "Editar" : "Nuevo"} Perfil
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Información Básica
        </Typography>

        <Alert severity={soundingNumberError ? "error" : "info"} sx={{ mb: 2 }}>
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
          helperText={
            soundingNumberError
              ? "Campo obligatorio - Debe ingresar un valor"
              : ""
          }
          placeholder="Ingrese el número de sondeo"
          inputProps={{
            sx: {
              borderWidth: soundingNumberError ? 2 : 1,
              backgroundColor: soundingNumberError
                ? "rgba(211, 47, 47, 0.05)"
                : undefined,
            },
          }}
          onBlur={() =>
            setSoundingNumberError(!formData.sounding_number.trim())
          }
        />

        <TextField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          placeholder="Ingrese la ubicación del sondeo"
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Nivel Freático"
            name="water_level"
            value={formData.water_level}
            onChange={handleChange}
            fullWidth
            margin="normal"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
              startAdornment:
                formData.water_level && formData.water_level !== "ninguno" ? (
                  <InputAdornment position="start">
                    <WaterDropIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ) : null,
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LayersIcon fontSize="small" />
                </InputAdornment>
              ),
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

        {profileStats.totalRows > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Avance: {profileStats.completedRows}/{profileStats.totalRows}{" "}
                profundidades
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
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
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
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1">Datos de Golpes</Typography>
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
            backgroundColor: Number(row.n) > 0 ? "#f5f9ff" : undefined,
            border: Number(row.n) > 0 ? "1px solid #e3f2fd" : undefined,
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
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              N: <strong>{row.n}</strong>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
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
                  Valor N (12" + 18"):
                </Typography>
                <Chip
                  label={row.n}
                  size="small"
                  color={Number(row.n) > 0 ? "primary" : "default"}
                />
              </Box>
              <TextField
                label="Observaciones"
                value={row.observation || ""}
                onChange={(e) =>
                  handleBlowChange(index, "observation", e.target.value)
                }
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
        >
          {profileId && profileId !== "nuevo" ? "Actualizar" : "Guardar"} Perfil
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={1000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MobileProfileView;
