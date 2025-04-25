import { useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    IconButton,
    TextField,
    Alert,
    Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PropTypes from "prop-types";
import AdditionalInfoForm from "./AdditionalInfoForm";
import { useServiceRequest } from "../ServiceRequestContext";  // Importa el hook


const ServiceItem = ({ item }) => {
    const { state, setSelectedServices, setAdditionalInfo } = useServiceRequest();  // Usa el hook
    const selectedService = state.selectedServices.find(
        (service) => service.item.id === item.id
    );
    const selectedServiceIndex = state.selectedServices.findIndex(
        (service) => service.item.id === item.id
    );
    const [quantity, setQuantity] = useState(selectedService?.quantity || 1);
    const [itemAdditionalInfo, setItemAdditionalInfo] = useState(
        selectedService?.additionalInfo || {}
    );
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });


    const isSelected = !!selectedService;


    // Usamos useCallback para optimizar la actualización de la cantidad
    const updateQuantity = useCallback(() => {
        if (isSelected) {
            setSelectedServices(state.selectedServices.map((service) =>
                service.item.id === item.id ? { ...service, quantity } : service
            ));
        }
    }, [quantity, state.selectedServices, setSelectedServices, item.id, isSelected]);


    useEffect(() => {
        updateQuantity();
    }, [updateQuantity]);


    const handleAddService = useCallback(() => {
        setSelectedServices([...state.selectedServices, { item, quantity }]);  // Usa setSelectedServices
        setNotification({
            open: true,
            message: "Servicio agregado",
            severity: "success",
        });
    }, [state.selectedServices, setSelectedServices, item, quantity]);


    const handleRemoveService = useCallback(() => {
        setSelectedServices(state.selectedServices.filter(  // Usa setSelectedServices
            (service) => service.item.id !== item.id
        ));
        setNotification({
            open: true,
            message: "Servicio eliminado",
            severity: "success",
        });
    }, [state.selectedServices, setSelectedServices, item.id]);


    const handleQuantityChange = useCallback((event) => {
        const newQuantity = parseInt(event.target.value, 10);
        setQuantity(isNaN(newQuantity) ? 1 : newQuantity);
    }, []);


    const handleOpenAdditionalInfo = useCallback(() => {
        setShowAdditionalInfo(true);
    }, []);





    const handleSaveAdditionalInfo = useCallback(() => {
        setAdditionalInfo(selectedServiceIndex, itemAdditionalInfo);  // Usa setAdditionalInfo
        setShowAdditionalInfo(false);
        setNotification({
            open: true,
            message: "Información adicional guardada",
            severity: "success",
        });
    }, [setAdditionalInfo, selectedServiceIndex, itemAdditionalInfo]);


    const handleCancelAdditionalInfo = useCallback(() => {
        setItemAdditionalInfo(selectedService?.additionalInfo || {});
        setShowAdditionalInfo(false);
    }, [selectedService?.additionalInfo]);


    const handleCloseNotification = useCallback((event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotification({ ...notification, open: false });
    }, [notification]);


    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {item.code}
                </Typography>


                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <Typography variant="body1" mr={1}>
                        Cantidad:
                    </Typography>
                    <TextField
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        inputProps={{ min: 1 }}
                        sx={{ width: "60px", mr: 2 }}
                    />
                    {isSelected ? (
                        <IconButton onClick={handleRemoveService}>
                            <RemoveIcon />
                        </IconButton>
                    ) : (
                        <IconButton onClick={handleAddService}>
                            <AddIcon />
                        </IconButton>
                    )}
                </Box>


                {item.additionalInfo && (
                    <Button onClick={handleOpenAdditionalInfo} sx={{ mt: 2 }}>
                        Añadir Información Adicional
                    </Button>
                )}


                {showAdditionalInfo && (
                    <Box sx={{ mt: 2 }}>
                        <AdditionalInfoForm
                            service={item}
                            itemAdditionalInfo={itemAdditionalInfo}
                            setItemAdditionalInfo={setItemAdditionalInfo}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <Button onClick={handleSaveAdditionalInfo}>Guardar</Button>
                            <Button onClick={handleCancelAdditionalInfo}>
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                )}


                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    aria-describedby="service-notification"
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{ width: "100%" }}
                        id="service-notification"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </CardContent>
        </Card>
    );
};


ServiceItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        code: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        additionalInfo: PropTypes.arrayOf(
            PropTypes.shape({
                field: PropTypes.string.isRequired,
                type: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
                required: PropTypes.bool,
                options: PropTypes.arrayOf(PropTypes.string),
                dependsOn: PropTypes.shape({
                    field: PropTypes.string,
                    value: PropTypes.string,
                }),
            })
        ),
    }).isRequired,
};


export default ServiceItem;