// components/PerfilDeSuelos/DesktopProfileView.tsx
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Chip,
  LinearProgress,
  InputAdornment,
  Divider,
  IconButton,
  Snackbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LayersIcon from "@mui/icons-material/Layers";
import {
  ProfileFormData,
  ProfileStats,
  Notification,
  BlowData,
} from "./profileTypes";
import React, { useState } from "react";

interface DesktopProfileViewProps {
  formData: ProfileFormData;
  profileId: string | undefined;
  projectId: string | undefined;
  profileStats: ProfileStats;
  soundingNumberError: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlowChange: (
    index: number,
    field: keyof BlowData,
    value: string | number
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseNotification: () => void;
  notification: Notification;
  navigate: (path: string) => void;
}

const DesktopProfileView = ({
  formData,
  profileId,
  projectId,
  profileStats,
  handleChange,
  handleBlowChange,
  handleSubmit,
  handleCloseNotification,
  notification,
  navigate,
}: DesktopProfileViewProps) => {
  const [soundingNumberError, setSoundingNumberError] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate(`/lab/proyectos/${projectId}/perfiles`)}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 1 }}>
          {profileId && profileId !== "nuevo" ? "Editar" : "Crear"} Perfil de
          Suelo
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity={soundingNumberError ? "error" : "info"} sx={{ mb: 3 }}>
          El número de sondeo es obligatorio y debe tener un valor.
        </Alert>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            label="Número de Sondeo"
            name="sounding_number"
            value={formData.sounding_number}
            onChange={handleChange}
            required
            size="small"
            error={soundingNumberError}
            helperText={
              soundingNumberError
                ? "Campo obligatorio - Debe ingresar un valor"
                : ""
            }
            placeholder="Ej: 1, S-01, etc."
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
            size="small"
            placeholder="Ubicación del sondeo"
          />

          <TextField
            label="Nivel Freático"
            name="water_level"
            value={formData.water_level}
            onChange={handleChange}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LayersIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {profileStats.totalRows > 0 && (
          <Box sx={{ mb: 3 }}>
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

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Datos de Golpes
        </Typography>

        <Box
          sx={{
            maxHeight: "500px",
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 1,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "#f5f5f5",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <th style={{ padding: "8px", textAlign: "left" }}>
                  Profundidad (m)
                </th>
                <th style={{ padding: "8px", textAlign: "center" }}>6"</th>
                <th style={{ padding: "8px", textAlign: "center" }}>12"</th>
                <th style={{ padding: "8px", textAlign: "center" }}>18"</th>
                <th style={{ padding: "8px", textAlign: "center" }}>N</th>
                <th style={{ padding: "8px", textAlign: "left" }}>
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.blows_data.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: Number(row.n) > 0 ? "#f5f9ff" : undefined,
                  }}
                >
                  <td style={{ padding: "8px" }}>{row.depth}</td>
                  <td style={{ padding: "8px" }}>
                    <TextField
                      type="number"
                      value={row.blows6}
                      onChange={(e) =>
                        handleBlowChange(index, "blows6", e.target.value)
                      }
                      size="small"
                      fullWidth
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <TextField
                      type="number"
                      value={row.blows12}
                      onChange={(e) =>
                        handleBlowChange(index, "blows12", e.target.value)
                      }
                      size="small"
                      fullWidth
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    />
                  </td>
                  <td style={{ padding: "8px" }}>
                    <TextField
                      type="number"
                      value={row.blows18}
                      onChange={(e) =>
                        handleBlowChange(index, "blows18", e.target.value)
                      }
                      size="small"
                      fullWidth
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: Number(row.n) > 0 ? "#1976d2" : "inherit",
                    }}
                  >
                    {row.n}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <TextField
                      value={row.observation || ""}
                      onChange={(e) =>
                        handleBlowChange(index, "observation", e.target.value)
                      }
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
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
        >
          {profileId && profileId !== "nuevo" ? "Actualizar" : "Guardar"} Perfil
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
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

export default DesktopProfileView;
