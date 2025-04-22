import { useState } from 'react';
import {
    Box,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Snackbar,
    Alert,
} from '@mui/material';
import InitialInfoForm from './InitialInfoForm';
import ServiceSelection from '../ServiceSelection'; // Asegúrate de que la ruta sea correcta
import ServiceReview from './ServiceReview';
import ConfirmationModal from './ConfirmationModal';
import { services } from './services';

const ServiceRequestForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        nameProject: '',
        location: '',
        identification: '',
        phone: '',
        email: '',
        description: '',
    });
    const [selectedServices, setSelectedServices] = useState([]);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const steps = ['Información del Solicitante', 'Seleccionar Servicios', 'Revisar Solicitud'];

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleOpenConfirmation = () => {
        setConfirmationOpen(true);
    };

    const handleCloseConfirmation = () => {
        setConfirmationOpen(false);
    };

    const handleSubmit = () => {
        // Lógica para enviar la solicitud (aún no implementada)
        console.log('Form data:', formData);
        console.log('Selected services:', selectedServices);
        setConfirmationOpen(false);
        setNotification({ open: true, message: 'Solicitud enviada correctamente', severity: 'success' });
        // Aquí podrías resetear el formulario o redirigir al usuario
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <InitialInfoForm formData={formData} setFormData={setFormData} />;
            case 1:
                return <ServiceSelection services={services} selectedServices={selectedServices} setSelectedServices={setSelectedServices} />;
            case 2:
                return <ServiceReview selectedServices={selectedServices} onBack={handleBack} onConfirm={handleOpenConfirmation} />;
            default:
                return <Typography>Paso desconocido</Typography>;
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', mt: 4, mb: 4, p: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Solicitud de Servicios
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper elevation={3} sx={{ p: 3 }}>
                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    {activeStep > 0 && (
                        <Button onClick={handleBack}>
                            Atrás
                        </Button>
                    )}
                    {activeStep < steps.length - 1 && (
                        <Button variant="contained" color="primary" onClick={handleNext}>
                            Siguiente
                        </Button>
                    )}
                    {activeStep === steps.length - 1 && (
                        <Button variant="contained" color="success" onClick={handleOpenConfirmation}>
                            Enviar Solicitud
                        </Button>
                    )}
                </Box>
            </Paper>

            <ConfirmationModal
                open={confirmationOpen}
                onClose={handleCloseConfirmation}
                onConfirm={handleSubmit}
                selectedServices={selectedServices} // Cambiado de services a selectedServices
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};



export default ServiceRequestForm;