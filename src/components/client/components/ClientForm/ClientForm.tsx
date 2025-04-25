import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import InitialInfoForm from "./InitialInfoForm";
import ServiceSelection from "../ServiceSelection/ServiceSelection";
import ServiceReview from "./ServiceReview";
import ConfirmationModal from "./ConfirmationModal";
import { useServiceRequest } from "../ServiceRequestContext";
import api from "../../../../api";

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
  const [services, setServices] = useState([]);
  const { state, reset, setLoading, setError } = useServiceRequest();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await api.get("/service-requests/services/all");
        setServices(response.data.services);
      } catch (error: any) {
        setError(error.message || "Error al cargar los servicios");
        setNotification({
          open: true,
          message: error.message || "Error al cargar los servicios",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    if (location.state && location.state.step) {
      setActiveStep(location.state.step as number);
    }
  }, [location.state, setLoading, setError]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setOpenConfirmation(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      //  Aquí iría la llamada a la API para crear la solicitud
      //  const response = await api.post("/service-requests", state);
      //  console.log("Solicitud creada:", response.data);

      //  Simulación de la llamada a la API (reemplazar con la real)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setNotification({
        open: true,
        message: "Solicitud creada con éxito",
        severity: "success",
      });
      reset();
      setActiveStep(0);
      navigate("/"); //  O a donde quieras redirigir
    } catch (error: any) {
      setError(error.message || "Error al crear la solicitud");
      setNotification({
        open: true,
        message: error.message || "Error al crear la solicitud",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setOpenConfirmation(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <InitialInfoForm />;
      case 1:
        return <ServiceSelection services={services} />;
      case 2:
        return <ServiceReview />;
      default:
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <Box sx={{ width: "80%", margin: "auto", mt: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {state.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Atrás
            </Button>
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={state.loading}
            >
              {activeStep === steps.length - 1 ? "Confirmar" : "Siguiente"}
            </Button>
          </Box>

          <ConfirmationModal
            open={openConfirmation}
            onClose={handleCloseConfirmation}
            onConfirm={handleSubmit}
            loading={state.loading}
          />

          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
          >
            <Alert
              onClose={handleCloseNotification}
              severity={notification.severity}
              sx={{ width: "100%" }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default ClientForm;
