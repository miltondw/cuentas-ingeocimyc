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
import React from "react";

interface MobileProfileViewProps {
  formData: ProfileFormData;
  profileId: string | undefined;
  projectId: string | undefined;
  profileStats: ProfileStats;
  errors: Partial<Record<keyof ProfileFormData, string>>;
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

const MobileProfileView = ({
  formData,
  profileId,
  projectId,
  profileStats,
  errors,
  expandedDepth,
  handleChange,
  handleBlowChange,
  handleAccordionChange,
  handleSubmit,
  handleCloseNotification,
  notification,
  navigate,
}: MobileProfileViewProps) => {
  return (
    <Container sx={{ py: 2, px: 1, mb: 8 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/lab/proyectos/${projectId}/perfiles`)}
          aria-label="Volver a la lista de perfiles"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          {profileId && profileId !== "nuevo"
            ? "Editar Perfil"
            : "Nuevo Perfil"}
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Información Básica
        </Typography>

        <Alert
          severity={Object.keys(errors).length > 0 ? "error" : "info"}
          sx={{ mb: 2 }}
          aria-live="polite"
        >
          {Object.keys(errors).length > 0
            ? "Por favor, corrige los errores en el formulario"
            : "Completa los campos obligatorios para continuar"}
        </Alert>

        <TextField
          label="Número de Sondeo"
          name="sounding_number"
          value={formData.sounding_number}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          required
          error={!!errors.sounding_number}
          helperText={errors.sounding_number || "Por ejemplo, 1, S-01, etc."}
          placeholder="Ingresa el número de sondeo"
          inputProps={{
            "aria-label": "Entrada de número de sondeo",
            sx: {
              borderWidth: errors.sounding_number ? 2 : 1,
              backgroundColor: errors.sounding_number
                ? "rgba(211, 47, 47, 0.05)"
                : undefined,
            },
          }}
        />

        <TextField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          placeholder="Ingresa la ubicación del sondeo"
          inputProps={{ "aria-label": "Entrada de ubicación" }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Nivel de Agua"
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
            inputProps={{ "aria-label": "Entrada de nivel de agua" }}
          />
          <TextField
            label="Número de Muestras"
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
            inputProps={{ "aria-label": "Entrada de número de muestras" }}
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
          inputProps={{ "aria-label": "Entrada de fecha" }}
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
                Progreso: {profileStats.completedRows}/{profileStats.totalRows}{" "}
                Profundidades
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileStats.percentComplete}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={profileStats.percentComplete}
              sx={{ height: 8, borderRadius: 2 }}
              aria-label="Barra de progreso del perfil"
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Chip
                size="small"
                label={`N Máximo: ${profileStats.maxN}`}
                color="primary"
                variant="outlined"
                aria-label={`Valor N máximo: ${profileStats.maxN}`}
              />
              <Chip
                size="small"
                label={`Profundidad Máxima: ${profileStats.maxDepth}m`}
                color="primary"
                variant="outlined"
                aria-label={`Profundidad máxima: ${profileStats.maxDepth} metros`}
              />
            </Box>
          </Box>
        )}
      </Paper>

      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1">Datos de Golpes</Typography>
        <Typography variant="caption" color="text.secondary">
          Toca para expandir detalles
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
          aria-label={`Datos de golpes para profundidad ${row.depth} metros`}
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
                  label="6 Pulgadas"
                  type="number"
                  value={row.blows6}
                  onChange={(e) =>
                    handleBlowChange(index, "blows6", e.target.value)
                  }
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  aria-label={`Golpes a 6 pulgadas para profundidad ${row.depth}`}
                />
                <TextField
                  label="12 Pulgadas"
                  type="number"
                  value={row.blows12}
                  onChange={(e) =>
                    handleBlowChange(index, "blows12", e.target.value)
                  }
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  aria-label={`Golpes a 12 pulgadas para profundidad ${row.depth}`}
                />
                <TextField
                  label="18 Pulgadas"
                  type="number"
                  value={row.blows18}
                  onChange={(e) =>
                    handleBlowChange(index, "blows18", e.target.value)
                  }
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  aria-label={`Golpes a 18 pulgadas para profundidad ${row.depth}`}
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
                  aria-label={`Valor N para profundidad ${row.depth}`}
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
                placeholder="Por ejemplo, color, textura, tipo de suelo..."
                inputProps={{
                  "aria-label": `Observación para profundidad ${row.depth}`,
                }}
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
          aria-label={
            profileId && profileId !== "nuevo"
              ? "Actualizar perfil"
              : "Guardar perfil"
          }
        >
          {profileId && profileId !== "nuevo"
            ? "Actualizar Perfil"
            : "Guardar Perfil"}
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
          aria-live="polite"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MobileProfileView;
