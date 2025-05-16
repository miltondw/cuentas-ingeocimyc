import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Chip,
  LinearProgress,
  InputAdornment,
  Divider,
  IconButton,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
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
import ProfileFormField from "./ProfileFormField";
import BlowDataTable from "./BlowDataTable";

interface DesktopProfileViewProps {
  formData: ProfileFormData;
  profileId: string | undefined;
  projectId: string | undefined;
  profileStats: ProfileStats;
  errors: Partial<Record<keyof ProfileFormData, string>>;
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
}));

const DesktopProfileView = ({
  formData,
  profileId,
  projectId,
  profileStats,
  errors,
  handleChange,
  handleBlowChange,
  handleSubmit,
  handleCloseNotification,
  notification,
  navigate,
}: DesktopProfileViewProps) => {
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const handleCancel = () => {
    setOpenCancelDialog(true);
  };

  const confirmCancel = () => {
    navigate(`/lab/proyectos/${projectId}/perfiles`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={handleCancel}
          aria-label="Volver a la lista de perfiles"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ ml: 2, fontWeight: "bold" }}>
          {profileId && profileId !== "nuevo"
            ? "Editar Perfil"
            : "Crear Perfil"}
        </Typography>
      </Box>

      <StyledPaper elevation={3}>
        <Alert
          severity={Object.keys(errors).length > 0 ? "error" : "info"}
          sx={{ mb: 3 }}
          aria-live="polite"
        >
          {Object.keys(errors).length > 0
            ? "Por favor, corrige los errores en el formulario"
            : "Completa los campos obligatorios para crear o actualizar el perfil"}
        </Alert>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          <ProfileFormField
            label="Número de Sondeo"
            name="sounding_number"
            value={formData.sounding_number}
            onChange={handleChange}
            required
            error={!!errors.sounding_number}
            helperText={errors.sounding_number || "Por ejemplo, 1, S-01, etc."}
            placeholder="Por ejemplo, 1, S-01, etc."
            aria-label="Entrada de número de sondeo"
          />

          <ProfileFormField
            label="Ubicación"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ingresa la ubicación del sondeo"
            aria-label="Entrada de ubicación"
          />

          <ProfileFormField
            label="Nivel de Agua"
            name="water_level"
            value={formData.water_level}
            onChange={handleChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">m</InputAdornment>,
              startAdornment:
                formData.water_level && formData.water_level !== "ninguno" ? (
                  <InputAdornment position="start">
                    <WaterDropIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ) : null,
            }}
            aria-label="Entrada de nivel de agua"
          />

          <ProfileFormField
            label="Fecha"
            name="profile_date"
            type="date"
            value={formData.profile_date}
            onChange={handleChange}
            required
            slotProps={{ inputLabel: { shrink: true } }}
            aria-label="Entrada de fecha"
          />

          <ProfileFormField
            label="Número de Muestras"
            name="samples_number"
            type="number"
            value={formData.samples_number}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LayersIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            aria-label="Entrada de número de muestras"
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
              <Typography variant="body2" color="text.secondary">
                Progreso: {profileStats.completedRows}/{profileStats.totalRows}{" "}
                Profundidades
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {profileStats.percentComplete}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={profileStats.percentComplete}
              sx={{ height: 10, borderRadius: 5 }}
              aria-label="Barra de progreso del perfil"
            />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Datos de Golpes
        </Typography>

        <BlowDataTable
          blowsData={formData.blows_data}
          handleBlowChange={handleBlowChange}
        />
      </StyledPaper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          size="large"
          aria-label="Cancelar creación del perfil"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
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

      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Confirmar Cancelación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            ¿Estás seguro de que deseas cancelar? Se perderán todos los cambios
            no guardados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Permanecer</Button>
          <Button onClick={confirmCancel} color="error" autoFocus>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

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

export default DesktopProfileView;
