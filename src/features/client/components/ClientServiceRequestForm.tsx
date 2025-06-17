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
import { useServiceRequest } from "../hooks/useServiceRequest";
import { serviceRequestsService } from "@/api/services";
import { ROUTES } from "@/utils/routes";
import { InitialInfoForm } from "./InitialInfoForm";
import { ServiceSelection } from "./ServiceSelection";
import { ServiceReview } from "./ServiceReview";
import { ConfirmationModal } from "./ConfirmationModal";
import type { Service } from "../types";

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

/**
 * Formulario principal para solicitudes de servicios de clientes
 * Migrado desde components/client/components/ClientForm/ClientForm.tsx
 */
export const ClientServiceRequestForm: React.FC = () => {
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

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const {
    state: requestState,
    dispatch,
    submitRequest,
    loadData,
    isLoading,
    services,
  } = useServiceRequest();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejar navegación desde otras páginas
  useEffect(() => {
    if (state?.step !== undefined) {
      setActiveStep(state.step);
    }
  }, [state?.step]);

  // Validar formulario básico
  const isFormValid = useMemo(() => {
    const { formData } = requestState;
    return (
      formData.name.trim() !== "" &&
      formData.nameProject.trim() !== "" &&
      formData.location.trim() !== "" &&
      formData.identification.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    );
  }, [requestState.formData]);

  // Validar si hay servicios seleccionados
  const hasServices = useMemo(() => {
    return requestState.selectedServices.length > 0;
  }, [requestState.selectedServices]);

  const canProceedToNextStep = useMemo(() => {
    switch (activeStep) {
      case 0:
        return isFormValid;
      case 1:
        return hasServices;
      case 2:
        return true;
      default:
        return false;
    }
  }, [activeStep, isFormValid, hasServices]);

  const handleNext = useCallback(() => {
    if (activeStep === steps.length - 1) {
      setOpenConfirmation(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [activeStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    try {
      setOpenConfirmation(false);
      await submitRequest();

      setNotification({
        open: true,
        message: "Solicitud enviada exitosamente",
        severity: "success",
      });

      // Resetear formulario después de un delay
      setTimeout(() => {
        navigate(ROUTES.CLIENT);
      }, 2000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setNotification({
        open: true,
        message: "Error al enviar la solicitud. Por favor, inténtelo de nuevo.",
        severity: "error",
      });
    }
  }, [submitRequest, navigate]);

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <InitialInfoForm
            formData={requestState.formData}
            onChange={(field, value) =>
              dispatch({
                type: "UPDATE_FORM_DATA",
                payload: { [field]: value },
              })
            }
            errors={{}}
          />
        );
      case 1:
        return (
          <ServiceSelection
            services={services}
            selectedServices={requestState.selectedServices}
            onServiceSelect={(service) =>
              dispatch({ type: "ADD_SERVICE", payload: service })
            }
            onServiceRemove={(serviceId) =>
              dispatch({ type: "REMOVE_SERVICE", payload: serviceId })
            }
            onServiceUpdate={(serviceId, updates) =>
              dispatch({
                type: "UPDATE_SERVICE",
                payload: { serviceId, updates },
              })
            }
            state={state}
          />
        );
      case 2:
        return (
          <ServiceReview
            formData={requestState.formData}
            selectedServices={requestState.selectedServices}
            onEdit={(serviceId, instanceId) => {
              navigate(location.pathname, {
                state: {
                  step: 1,
                  editServiceId: serviceId,
                  editInstanceId: instanceId,
                },
              });
              setActiveStep(1);
            }}
            onRemove={(serviceId) =>
              dispatch({ type: "REMOVE_SERVICE", payload: serviceId })
            }
          />
        );
      default:
        return "Paso desconocido";
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Solicitud de Servicios
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 3 }}>{getStepContent(activeStep)}</Box>

      <Grid2 container spacing={2} justifyContent="space-between">
        <Grid2>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Anterior
          </Button>
        </Grid2>

        <Grid2>
          <Tooltip
            title={
              !canProceedToNextStep
                ? activeStep === 0
                  ? "Complete todos los campos requeridos"
                  : "Seleccione al menos un servicio"
                : ""
            }
          >
            <span>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceedToNextStep || isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : undefined
                }
              >
                {activeStep === steps.length - 1
                  ? "Enviar Solicitud"
                  : "Siguiente"}
              </Button>
            </span>
          </Tooltip>
        </Grid2>
      </Grid2>

      {/* Modal de confirmación */}
      <ConfirmationModal
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        formData={requestState.formData}
        selectedServices={requestState.selectedServices}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

export default ClientServiceRequestForm;
