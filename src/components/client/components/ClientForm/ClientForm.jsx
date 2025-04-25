import { useState, useEffect } from "react";
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


const ClientForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [openConfirmation, setOpenConfirmation] = useState(false);
    const [notification, setNotification] = useState({
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
                setError(null);
            } catch (error) {
                setError(error);
                setNotification({
                    open: true,
                    message: "Error al cargar los servicios",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };


        fetchServices();
    }, [setLoading, setError]);


    useEffect(() => {
        //  Asegúrate de que location.state exista antes de acceder a step
        if (location.state && location.state.step !== activeStep) {
            setActiveStep(location.state.step);
        }
    }, [location.state, activeStep]);


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
            await api.post("/service-requests", state);
            setNotification({
                open: true,
                message: "Solicitud enviada correctamente",
                severity: "success",
            });
            reset();
            setActiveStep(0);
            navigate("/");
        } catch (error) {
            setError(error);
            setNotification({
                open: true,
                message: "Error al enviar la solicitud",
                severity: "error",
            });
        } finally {
            setLoading(false);
            setOpenConfirmation(false);
        }
    };


    const handleCloseNotification = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotification({ ...notification, open: false });
    };


    return (
        <Box sx={{ width: "100%" }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label) => {
                    return (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {state.error && (
                <Alert severity="error">{state.error.message}</Alert>
            )}
            {state.loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {activeStep === 0 && <InitialInfoForm />}
                    {activeStep === 1 && <ServiceSelection services={services} />}
                    {activeStep === 2 && <ServiceReview />}
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