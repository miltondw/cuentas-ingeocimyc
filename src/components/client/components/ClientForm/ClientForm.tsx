import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Grid2,
  Tooltip,
} from "@mui/material";
import InitialInfoForm from "./InitialInfoForm";
import ServiceSelection from "../ServiceSelection/ServiceSelection";
import ServiceReview from "./ServiceReview";
import ConfirmationModal from "./ConfirmationModal";
import { useServiceRequest } from "../ServiceRequestContext";
import api from "@api";
import { Service } from "../types";

interface LocationState {
  step?: number;
  editServiceId?: string;
  editInstanceId?: string;
  editCategory?: string;
  editAdditionalInfo?: Record<string, string | number | boolean | string[]>;
  serviceItemId?: string;
}

const steps = [
  "Información inicial",
  "Seleccionar servicios",
  "Revisar solicitud",
];

const ClientForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { state, submitForm, validateForm } = useServiceRequest();
  const { error } = state;

  const locationState = location.state as LocationState | null;

  // Forzar inicio en paso 0 si no hay estado previo
  useEffect(() => {
    if (locationState?.step !== undefined) {
      setActiveStep(locationState.step);
    } else {
      setActiveStep(0); // Asegura que siempre inicie en "Información inicial"
      navigate("/cliente", { state: { step: 0 }, replace: true });
    }
  }, [locationState?.step, navigate]);

  // Carga los servicios solo en el paso 1
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/service-requests/services/all");
      setServices(response.data.services);
    } catch (error) {
      setNotification({
        open: true,
        message: "Error al cargar los servicios",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeStep === 1) {
      fetchServices();
    }
  }, [activeStep, fetchServices]);

  // Maneja el avance al siguiente paso
  const handleNext = useCallback(async () => {
    if (activeStep === 0 && !(await validateForm())) {
      setNotification({
        open: true,
        message: "Por favor completa todos los campos requeridos",
        severity: "warning",
      });
      return;
    }
    if (activeStep === steps.length - 1) {
      setOpenConfirmation(true);
    } else {
      setActiveStep((prev) => prev + 1);
      navigate("/cliente", { state: { step: activeStep + 1 } });
    }
  }, [activeStep, validateForm, navigate]);

  // Maneja el retroceso al paso anterior
  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
    navigate("/cliente", { state: { step: activeStep - 1 } });
  }, [activeStep, navigate]);

  // Cierra el modal de confirmación
  const handleCloseConfirmation = useCallback(() => {
    setOpenConfirmation(false);
  }, []);

  // Envía el formulario (simulado, guarda en localStorage)
  const handleSubmit = useCallback(async () => {
    setOpenConfirmation(false);
    setLoading(true);
    try {
      await submitForm();
      setNotification({
        open: true,
        message: "Solicitud procesada con éxito (guardada localmente)",
        severity: "success",
      });
      setActiveStep(0);
      navigate("/cliente", { replace: true, state: { step: 0 } });
    } catch (error) {
      setNotification({
        open: true,
        message: "Error al procesar la solicitud",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [submitForm, navigate]);

  // Cierra la notificación
  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Selecciona el componente del paso actual
  const currentStepComponent = useMemo(() => {
    switch (activeStep) {
      case 0:
        return <InitialInfoForm />;
      case 1:
        return (
          <ServiceSelection
            services={services}
            loading={loading}
            editCategory={locationState?.editCategory}
          />
        );
      case 2:
        return <ServiceReview />;
      default:
        return null;
    }
  }, [activeStep, services, loading, locationState?.editCategory]);

  // Determina si el botón "Siguiente" está deshabilitado

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 3 } }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", mb: 4 }}
        aria-label="Formulario de solicitud de servicio"
      >
        Solicitud de Servicio
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              aria-label={`Paso ${index + 1}: ${label}`}
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {loading && activeStep !== 1 ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress aria-label="Cargando formulario" />
        </Box>
      ) : (
        <Box sx={{ minHeight: "400px" }}>{currentStepComponent}</Box>
      )}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      <Grid2
        container
        spacing={2}
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Grid2>
          {activeStep > 0 && (
            <Tooltip title="Volver al paso anterior">
              <Button
                onClick={handleBack}
                disabled={loading}
                variant="outlined"
                aria-label="Volver al paso anterior"
              >
                Atrás
              </Button>
            </Tooltip>
          )}
        </Grid2>
        <Grid2>
          <Tooltip
            title={
              activeStep === steps.length - 1
                ? "Enviar solicitud"
                : "Continuar al siguiente paso"
            }
          >
            <Button
              onClick={handleNext}
              variant="contained"
              aria-label={
                activeStep === steps.length - 1
                  ? "Enviar solicitud"
                  : "Continuar"
              }
            >
              {activeStep === steps.length - 1 ? "Enviar" : "Siguiente"}
            </Button>
          </Tooltip>
        </Grid2>
      </Grid2>
      <ConfirmationModal
        open={openConfirmation}
        onCancel={handleCloseConfirmation}
        onConfirm={handleSubmit}
      />
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientForm;
