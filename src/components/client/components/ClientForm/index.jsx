import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid2,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Collapse,
    useTheme,
    useMediaQuery,
    Chip,
    Badge,
    Snackbar,
    Alert,
    InputAdornment,
    Card,
    CardHeader,
    CardContent,
    Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { services } from './services';
import PropTypes from 'prop-types';

/**
 * Formulario de selección de servicios mejorado
 * Compatible con Material UI v7
 */
const ServiceSelectionForm = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    const { control, handleSubmit, watch, reset, formState: { isValid } } = useForm({
        defaultValues: {
            projectName: '',
            city: '',
            requester: '',
            projectLocation: '',
        },
        mode: 'onChange'
    });

    // Estados para gestionar la UI
    const [selectedItems, setSelectedItems] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedServices, setExpandedServices] = useState({});
    const [quantityInputs, setQuantityInputs] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [cartVisible, setCartVisible] = useState(true);

    // Cargar datos guardados al iniciar
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('serviceSelectionData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.selectedItems) {
                    setSelectedItems(parsedData.selectedItems);
                }
                if (parsedData.formValues) {
                    reset(parsedData.formValues);
                }
                // Expandir automáticamente la primera categoría si no hay selecciones previas
                if (!parsedData.selectedItems || parsedData.selectedItems.length === 0) {
                    setExpandedCategories({ 1: true });
                }
            } else {
                // Si no hay datos guardados, expandir la primera categoría
                setExpandedCategories({ 1: true });
            }
        } catch (error) {
            console.error("Error loading saved data:", error);
            setNotification({
                open: true,
                message: 'Error al cargar datos guardados',
                severity: 'error'
            });
        }
    }, [reset]);

    // Guardar datos cuando cambian
    useEffect(() => {
        const formValues = watch();
        const dataToSave = {
            formValues,
            selectedItems
        };
        localStorage.setItem('serviceSelectionData', JSON.stringify(dataToSave));
    }, [selectedItems, watch]);

    // Filtrar servicios según el término de búsqueda
    const filteredServices = useMemo(() => {
        if (!searchTerm) return services;

        return services.map(category => {
            // Filtrar servicios que coincidan con el término de búsqueda
            const filteredItems = category.items.filter(service =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.subServices.some(subService =>
                    subService.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );

            // Si hay resultados en esta categoría, devolver la categoría con los items filtrados
            if (filteredItems.length > 0) {
                return {
                    ...category,
                    items: filteredItems
                };
            }

            // Si no hay resultados, devolver null
            return null;
        }).filter(Boolean); // Eliminar categorías sin resultados
    }, [searchTerm]); // Eliminar services del arreglo de dependencias

    // Cálculo del número total de items seleccionados
    const totalItemsCount = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [selectedItems]);

    // Funciones de manejo de UI
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const toggleService = (serviceId) => {
        setExpandedServices(prev => ({
            ...prev,
            [serviceId]: !prev[serviceId]
        }));
    };

    const toggleCart = () => {
        setCartVisible(prev => !prev);
    };

    const handleQuantityChange = (id, value) => {
        const sanitizedValue = Math.max(1, isNaN(value) ? 1 : value);
        setQuantityInputs(prev => ({
            ...prev,
            [id]: sanitizedValue
        }));
    };

    const handleAddService = (category, service, subService = null) => {
        const serviceId = subService ? `${service.id}-${subService.id}` : service.id;
        const quantity = quantityInputs[serviceId] || 1;

        const existingItemIndex = selectedItems.findIndex(item =>
            item.categoryId === category.id &&
            item.serviceId === service.id &&
            item.subServiceId === (subService ? subService.id : null)
        );

        const newItems = [...selectedItems];

        if (existingItemIndex >= 0) {
            newItems[existingItemIndex].quantity += quantity;
        } else {
            newItems.push({
                categoryId: category.id,
                categoryName: category.category,
                serviceId: service.id,
                serviceName: service.name,
                subServiceId: subService ? subService.id : null,
                subServiceName: subService ? subService.name : null,
                quantity: quantity
            });
        }

        setSelectedItems(newItems);

        // Mostrar notificación
        setNotification({
            open: true,
            message: 'Servicio agregado correctamente',
            severity: 'success'
        });

        // Resetear la cantidad después de agregar
        setQuantityInputs(prev => ({
            ...prev,
            [serviceId]: 1
        }));
    };

    const handleRemoveService = (index) => {
        const updatedItems = [...selectedItems];
        if (updatedItems[index].quantity > 1) {
            updatedItems[index].quantity -= 1;
            setSelectedItems(updatedItems);
        } else {
            updatedItems.splice(index, 1);
            setSelectedItems(updatedItems);
        }

        setNotification({
            open: true,
            message: 'Servicio eliminado correctamente',
            severity: 'info'
        });
    };

    const handleClearServices = () => {
        if (selectedItems.length > 0) {
            setSelectedItems([]);
            setNotification({
                open: true,
                message: 'Todos los servicios han sido eliminados',
                severity: 'info'
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const onSubmit = (data) => {
        const completeData = {
            ...data,
            selectedServices: selectedItems
        };
        console.log('Form data:', completeData);

        // Mostrar notificación de éxito
        setNotification({
            open: true,
            message: 'Solicitud guardada correctamente',
            severity: 'success'
        });
    };

    // Componente de acciones para servicios (cantidad y botones)
    const ServiceActions = ({ category, service, subService = null }) => {
        const serviceId = subService ? `${service.id}-${subService.id}` : service.id;

        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                mt: isMobile ? 1 : 0,
                width: isMobile ? '100%' : 'auto'
            }}>
                <TextField
                    type="number"
                    size="small"
                    value={quantityInputs[serviceId] || 1}
                    onChange={(e) => handleQuantityChange(serviceId, parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{
                        width: '70px',
                        '& input': {
                            textAlign: 'center',
                            py: 1
                        }
                    }}
                />
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddService(category, service, subService)}
                    sx={{
                        whiteSpace: 'nowrap',
                        py: 1
                    }}
                >
                    Agregar
                </Button>
            </Box>
        );
    };
    ServiceActions.propTypes = {
        category: PropTypes.object.isRequired,
        service: PropTypes.object.isRequired,
        subService: PropTypes.object
    };

    // Renderizado de elementos de servicio
    const renderServiceItem = (category, service) => (
        <React.Fragment key={service.id}>
            <ListItem
                sx={{
                    pl: isMobile ? 2 : 4,
                    pr: 2,
                    py: 1.5,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                <Box sx={{ flexGrow: 1, width: isMobile ? '100%' : 'auto' }}>
                    <ListItemText
                        primary={service.name}
                        primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                    />
                </Box>
                <ServiceActions category={category} service={service} />
            </ListItem>

            {service.subServices.length > 0 && (
                <Box>
                    <ListItem
                        button
                        onClick={() => toggleService(service.id)}
                        sx={{
                            pl: isMobile ? 3 : 5,
                            py: 0.5,
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <ListItemText
                            primary={`${expandedServices[service.id] ? 'Ocultar' : 'Ver'} subservicios (${service.subServices.length})`}
                            primaryTypographyProps={{
                                fontSize: '0.85rem',
                                fontWeight: 500
                            }}
                        />
                        <ExpandMoreIcon sx={{
                            fontSize: '1.2rem',
                            transform: expandedServices[service.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }} />
                    </ListItem>

                    <Collapse in={expandedServices[service.id]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {service.subServices.map((subService) => (
                                <ListItem
                                    key={subService.id}
                                    sx={{
                                        pl: isMobile ? 4 : 7,
                                        pr: 2,
                                        py: 1,
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: 'background.default',
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                >
                                    <Box sx={{ flexGrow: 1, width: isMobile ? '100%' : 'auto' }}>
                                        <ListItemText
                                            primary={subService.name}
                                            primaryTypographyProps={{
                                                fontSize: isMobile ? '0.85rem' : '0.9rem',
                                                fontStyle: 'italic'
                                            }}
                                        />
                                    </Box>
                                    <ServiceActions category={category} service={service} subService={subService} />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </Box>
            )}
        </React.Fragment>
    );

    // Renderizado de categorías de servicios
    const renderServiceCategories = () => {
        if (filteredServices.length === 0) {
            return (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No se encontraron servicios que coincidan con tu búsqueda. Intenta con otro término.
                    </Typography>
                </Paper>
            );
        }

        if (isDesktop) {
            return (
                <Grid2 container spacing={3}>
                    {filteredServices.map((category) => (
                        <Grid2 item xs={12} lg={6} key={category.id}>
                            <Card elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
                                <CardHeader
                                    onClick={() => toggleCategory(category.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText',
                                        '&:hover': {
                                            bgcolor: 'primary.main',
                                        }
                                    }}
                                    title={category.category}
                                    action={
                                        <IconButton
                                            edge="end"
                                            sx={{ color: 'inherit' }}
                                        >
                                            <ExpandMoreIcon sx={{
                                                transform: expandedCategories[category.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s'
                                            }} />
                                        </IconButton>
                                    }
                                />

                                <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                                    <CardContent sx={{ p: 0 }}>
                                        <List disablePadding>
                                            {category.items.map((service) => renderServiceItem(category, service))}
                                        </List>
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </Grid2>
                    ))}
                </Grid2>
            );
        }

        return (
            <Box>
                {filteredServices.map((category) => (
                    <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }} key={category.id}>
                        <CardHeader
                            onClick={() => toggleCategory(category.id)}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                }
                            }}
                            title={category.category}
                            titleTypographyProps={{
                                variant: 'body1',
                                fontWeight: 'bold'
                            }}
                            action={
                                <IconButton
                                    edge="end"
                                    sx={{ color: 'inherit' }}
                                >
                                    <ExpandMoreIcon sx={{
                                        transform: expandedCategories[category.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s'
                                    }} />
                                </IconButton>
                            }
                        />

                        <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                            <CardContent sx={{ p: 0 }}>
                                <List disablePadding>
                                    {category.items.map((service) => renderServiceItem(category, service))}
                                </List>
                            </CardContent>
                        </Collapse>
                    </Card>
                ))}
            </Box>
        );
    };

    // Renderizado de servicios seleccionados (carrito)
    const renderSelectedItems = () => {
        if (selectedItems.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No has seleccionado ningún servicio aún
                    </Typography>
                </Box>
            );
        }

        return (
            <>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
                        Servicios Seleccionados ({totalItemsCount})
                    </Typography>
                    <Tooltip title="Eliminar todos los servicios">
                        <IconButton
                            color="error"
                            onClick={handleClearServices}
                            size={isMobile ? "small" : "medium"}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <List disablePadding>
                    {selectedItems.map((item, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                justifyContent: 'space-between',
                                py: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ flexGrow: 1, width: isMobile ? '100%' : 'auto' }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                            <Typography variant="body1" component="span" fontWeight={500}>
                                                {item.serviceName}
                                            </Typography>
                                            <Chip
                                                label={item.categoryName}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                    }
                                    secondary={item.subServiceName ? `Subservicio: ${item.subServiceName}` : null}
                                    secondaryTypographyProps={{
                                        fontStyle: 'italic',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: isMobile ? 1 : 0,
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: isMobile ? 'flex-end' : 'flex-end'
                            }}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveService(index)}
                                    color="error"
                                >
                                    <RemoveIcon />
                                </IconButton>
                                <Typography sx={{ mx: 1.5, minWidth: '20px', textAlign: 'center' }}>
                                    {item.quantity}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        if (item.subServiceId) {
                                            const category = services.find(c => c.id === item.categoryId);
                                            const service = category?.items.find(s => s.id === item.serviceId);
                                            const subService = service?.subServices.find(ss => ss.id === item.subServiceId);
                                            if (category && service && subService) {
                                                handleAddService(category, service, subService);
                                            }
                                        } else {
                                            const category = services.find(c => c.id === item.categoryId);
                                            const service = category?.items.find(s => s.id === item.serviceId);
                                            if (category && service) {
                                                handleAddService(category, service);
                                            }
                                        }
                                    }}
                                    color="primary"
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </>
        );
    };

    return (
        <Box sx={{ p: isMobile ? 1 : 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Cabecera del formulario */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        fontWeight: 600,
                        color: 'primary.main'
                    }}
                >
                    SOLICITUD DE SERVICIOS
                </Typography>

                <Badge badgeContent={totalItemsCount} color="primary" showZero>
                    <Tooltip title={cartVisible ? "Ocultar carrito" : "Mostrar carrito"}>
                        <IconButton
                            onClick={toggleCart}
                            color={cartVisible ? "primary" : "default"}
                            size={isMobile ? "medium" : "large"}
                        >
                            <ShoppingCartIcon />
                        </IconButton>
                    </Tooltip>
                </Badge>
            </Box>

            {/* Layout principal */}
            <Grid2 container spacing={3}>
                {/* Columna izquierda: Formulario y catálogo */}
                <Grid2 item xs={12} md={cartVisible ? 8 : 12}>
                    {/* Información del Proyecto */}
                    <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
                        <CardHeader
                            title="Información del Proyecto"
                            titleTypographyProps={{
                                variant: isMobile ? 'h6' : 'h5',
                                fontSize: isMobile ? '1rem' : '1.25rem',
                                fontWeight: 600
                            }}
                            sx={{
                                bgcolor: 'background.paper',
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        />
                        <CardContent>
                            <Grid2 container spacing={2}>
                                <Grid2 item xs={12} md={6}>
                                    <Controller
                                        name="projectName"
                                        control={control}
                                        rules={{ required: "El nombre del proyecto es obligatorio" }}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                label="Nombre del Proyecto"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                error={!!error}
                                                helperText={error?.message}
                                                required
                                            />
                                        )}
                                    />
                                </Grid2>
                                <Grid2 item xs={12} md={6}>
                                    <Controller
                                        name="city"
                                        control={control}
                                        rules={{ required: "La ciudad es obligatoria" }}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                label="Ciudad"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                error={!!error}
                                                helperText={error?.message}
                                                required
                                            />
                                        )}
                                    />
                                </Grid2>
                                <Grid2 item xs={12} md={6}>
                                    <Controller
                                        name="requester"
                                        control={control}
                                        rules={{ required: "El solicitante es obligatorio" }}
                                        render={({ field, fieldState: { error } }) => (
                                            <TextField
                                                {...field}
                                                label="Solicitante"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                error={!!error}
                                                helperText={error?.message}
                                                required
                                            />
                                        )}
                                    />
                                </Grid2>
                                <Grid2 item xs={12} md={6}>
                                    <Controller
                                        name="projectLocation"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Localización del Proyecto"
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </CardContent>
                    </Card>

                    {/* Búsqueda y selección de servicios */}
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                fontSize: isMobile ? '1rem' : '1.25rem',
                                fontWeight: 600
                            }}
                        >
                            Selecciona los servicios requeridos
                        </Typography>

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar servicios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {renderServiceCategories()}
                    </Box>
                </Grid2>

                {/* Columna derecha: Carrito */}
                {cartVisible && (
                    <Grid2 item xs={12} md={4}>
                        <Card
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                position: isDesktop ? 'sticky' : 'static',
                                top: isDesktop ? '20px' : 'auto',
                                maxHeight: isDesktop ? 'calc(100vh - 40px)' : 'auto',
                                overflow: 'auto'
                            }}
                        >
                            <CardContent>
                                {renderSelectedItems()}

                                {selectedItems.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size={isMobile ? 'medium' : 'large'}
                                            onClick={handleSubmit(onSubmit)}
                                            fullWidth
                                            disabled={!isValid || selectedItems.length === 0}
                                            startIcon={<SaveIcon />}
                                        >
                                            Guardar Solicitud
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid2>
                )}
            </Grid2>

            {/* Notificaciones */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ServiceSelectionForm;

