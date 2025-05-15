import { useState, useCallback, useEffect, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import AdditionalInfoFormWrapper from "./AdditionalInfoFormWrapper";
import { useServiceRequest } from "../ServiceRequestContext";
import { ServiceItem as ServiceItemType } from "../types";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface ServiceItemProps {
  item: ServiceItemType;
  category: string;
}

interface Notification {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const ServiceItem: React.FC<ServiceItemProps> = ({ item, category }) => {
  const {
    state,
    addSelectedService,
    removeSelectedService,
    updateAdditionalInfo,
    validateForm,
  } = useServiceRequest();
  const { loading, error } = state;
  const location = useLocation();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState<number>(1);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [initialAdditionalInfo, setInitialAdditionalInfo] = useState<
    Record<string, any>
  >({});

  const hasAdditionalInfoFields =
    item.additionalInfo && item.additionalInfo.length > 0;

  const selectedInstances = useMemo(
    () =>
      state.selectedServices.filter((service) => service.item.id === item.id),
    [state.selectedServices, item.id]
  );

  const totalQuantity = useMemo(
    () =>
      selectedInstances.reduce(
        (sum, service) => sum + (service.quantity || 1),
        0
      ),
    [selectedInstances]
  );

  const isServiceAdded = useMemo(
    () => selectedInstances.length > 0,
    [selectedInstances]
  );

  useEffect(() => {
    const { editServiceId, editInstanceId, editAdditionalInfo } =
      location.state || {};
    if (editServiceId && editInstanceId && !showAdditionalInfo) {
      const serviceToEdit = state.selectedServices.find(
        (service) => service.id === editServiceId && service.item.id === item.id
      );
      if (serviceToEdit) {
        const instanceToEdit = serviceToEdit.instances.find(
          (instance) => instance.id === editInstanceId
        );
        if (instanceToEdit) {
          setInitialAdditionalInfo({
            ...instanceToEdit.additionalInfo,
            ...(editAdditionalInfo || {}),
          });
          // Inicializar quantity con la cantidad total del servicio
          setQuantity(serviceToEdit.quantity || 1);
          setShowAdditionalInfo(true);
        }
      }
    }
  }, [state.selectedServices, item.id, location.state, showAdditionalInfo]);

  const handleSaveAdditionalInfo = useCallback(
    async (
      instances: Array<{
        id: string;
        additionalInfo: Record<string, string | number | boolean | string[]>;
      }>
    ) => {
      try {
        const isValid = await validateForm();
        if (!isValid) {
          setNotification({
            open: true,
            message: "Por favor completa todos los campos requeridos",
            severity: "warning",
          });
          return;
        }

        const editServiceId = location.state?.editServiceId;
        if (editServiceId) {
          // Actualizar servicio existente
          updateAdditionalInfo(
            editServiceId,
            instances[0].id,
            instances[0].additionalInfo,
            instances,
            quantity // Pasar la nueva cantidad
          );
          setNotification({
            open: true,
            message: "Servicio actualizado",
            severity: "success",
          });
          setShowAdditionalInfo(false);
          setInitialAdditionalInfo({});
          setQuantity(1);
          navigate("/cliente", { replace: true, state: { step: 2 } });
        } else {
          // Agregar nuevo servicio
          const newServiceId = uuidv4();
          addSelectedService(item, quantity, category, newServiceId, instances);
          setNotification({
            open: true,
            message: `Servicio agregado (${quantity} instancia${
              quantity > 1 ? "s" : ""
            })`,
            severity: "success",
          });
          setShowAdditionalInfo(false);
          setInitialAdditionalInfo({});
          setQuantity(1);
        }
      } catch (error) {
        setNotification({
          open: true,
          message: "Error al guardar el servicio",
          severity: "error",
        });
      }
    },
    [
      addSelectedService,
      updateAdditionalInfo,
      item,
      category,
      location.state,
      navigate,
      validateForm,
      quantity,
    ]
  );

  const handleOpenAdditionalInfo = useCallback(() => {
    setShowAdditionalInfo(true);
  }, []);

  const handleCancelAdditionalInfo = useCallback(() => {
    setShowAdditionalInfo(false);
    setQuantity(1);
    setInitialAdditionalInfo({});
  }, []);

  const handleAddService = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) {
      setNotification({
        open: true,
        message: "Por favor completa todos los campos requeridos",
        severity: "warning",
      });
      return;
    }

    const editServiceId = location.state?.editServiceId;
    if (editServiceId) {
      // Actualizar cantidad del servicio existente
      const serviceToEdit = state.selectedServices.find(
        (service) => service.id === editServiceId && service.item.id === item.id
      );
      if (serviceToEdit) {
        updateAdditionalInfo(
          editServiceId,
          null,
          null,
          serviceToEdit.instances,
          quantity
        );
        setNotification({
          open: true,
          message: "Cantidad actualizada",
          severity: "success",
        });
        setQuantity(1);
        navigate("/cliente", { replace: true, state: { step: 2 } });
      }
    } else {
      // Agregar nuevo servicio
      addSelectedService(item, quantity, category);
      setNotification({
        open: true,
        message: `Servicio agregado (${quantity} instancia${
          quantity > 1 ? "s" : ""
        })`,
        severity: "success",
      });
      setQuantity(1);
      navigate("/cliente", { replace: true, state: { step: 2 } });
    }
  }, [
    addSelectedService,
    updateAdditionalInfo,
    item,
    category,
    quantity,
    validateForm,
    location.state,
    state.selectedServices,
    navigate,
  ]);

  const handleConfirmDelete = useCallback(() => {
    if (selectedInstances.length === 1) {
      removeSelectedService(selectedInstances[0].id);
      setNotification({
        open: true,
        message: "Servicio eliminado",
        severity: "success",
      });
    }
    setDeleteDialogOpen(false);
  }, [selectedInstances, removeSelectedService]);

  const handleQuantityChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQuantity = parseInt(event.target.value, 10);
      setQuantity(isNaN(newQuantity) ? 1 : Math.max(1, newQuantity));
    },
    []
  );

  const handleIncrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const handleDecrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleCloseNotification = useCallback((_: unknown, reason?: string) => {
    if (reason === "clickaway") return;
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const handleGoNext = useCallback(async () => {
    if (isServiceAdded && !hasAdditionalInfoFields) {
      const editServiceId =
        location.state?.editServiceId || selectedInstances[0].id;
      updateAdditionalInfo(
        editServiceId,
        null,
        null,
        selectedInstances.map((instance) => ({
          id: instance.id,
          additionalInfo: instance.instances?.[0]?.additionalInfo ?? {},
        })),
        quantity
      );
      navigate("/cliente", { replace: true, state: { step: 2 } });
    } else if (!isServiceAdded) {
      await handleAddService();
    } else if (isServiceAdded && hasAdditionalInfoFields) {
      handleOpenAdditionalInfo();
    }
  }, [
    isServiceAdded,
    hasAdditionalInfoFields,
    selectedInstances,
    updateAdditionalInfo,
    quantity,
    navigate,
    handleAddService,
    handleOpenAdditionalInfo,
    location.state?.editServiceId,
  ]);
  return (
    <Card
      sx={{
        m: 1,
        border: isServiceAdded ? "2px solid" : undefined,
        borderColor: isServiceAdded ? "primary.main" : undefined,
      }}
    >
      <CardContent sx={{ m: 1 }}>
        <Typography variant="h6">{item.name}</Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {item.code}
        </Typography>
        {isServiceAdded && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Seleccionado: {totalQuantity} instancia
            {totalQuantity !== 1 ? "s" : ""}
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {hasAdditionalInfoFields ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  mb: 1,
                }}
              >
                <Typography variant="body1">Cantidad:</Typography>
                <Tooltip title="Reducir cantidad">
                  <span>
                    <IconButton
                      onClick={handleDecrementQuantity}
                      size="small"
                      disabled={loading}
                      aria-label={`Reducir cantidad de ${item.name}`}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1 }}
                  sx={{ width: "60px" }}
                  disabled={loading}
                  aria-label={`Cantidad de ${item.name}`}
                />
                <Tooltip title="Aumentar cantidad">
                  <span>
                    <IconButton
                      onClick={handleIncrementQuantity}
                      size="small"
                      disabled={loading}
                      aria-label={`Aumentar cantidad de ${item.name}`}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Tooltip
                title={isServiceAdded ? "Editar detalles" : "Añadir detalles"}
              >
                <span>
                  <Button
                    onClick={handleOpenAdditionalInfo}
                    variant="contained"
                    color="primary"
                    startIcon={<InfoIcon />}
                    fullWidth
                    disabled={loading}
                    aria-label={
                      isServiceAdded
                        ? `Editar detalles de ${item.name}`
                        : `Añadir detalles a ${item.name}`
                    }
                  >
                    {isServiceAdded ? "Editar Detalles" : "Añadir Detalles"}
                  </Button>
                </span>
              </Tooltip>
              {showAdditionalInfo && (
                <AdditionalInfoFormWrapper
                  open={showAdditionalInfo}
                  quantity={quantity}
                  service={item}
                  initialAdditionalInfo={initialAdditionalInfo}
                  serviceId={location.state?.editServiceId}
                  instanceId={location.state?.editInstanceId}
                  onClose={handleCancelAdditionalInfo}
                  onSave={handleSaveAdditionalInfo}
                />
              )}
              {isServiceAdded && !showAdditionalInfo && (
                <Tooltip title="Eliminar servicio">
                  <span>
                    <Button
                      onClick={() => setDeleteDialogOpen(true)}
                      variant="outlined"
                      color="error"
                      fullWidth
                      disabled={loading}
                      sx={{ mt: 1 }}
                      startIcon={<DeleteIcon />}
                      aria-label={`Eliminar servicio ${item.name}`}
                    >
                      Eliminar Servicio
                    </Button>
                  </span>
                </Tooltip>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body1">Cantidad:</Typography>
              <Tooltip title="Reducir cantidad">
                <span>
                  <IconButton
                    onClick={handleDecrementQuantity}
                    size="small"
                    disabled={loading}
                    aria-label={`Reducir cantidad de ${item.name}`}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1 }}
                sx={{ width: "60px" }}
                disabled={loading}
                aria-label={`Cantidad de ${item.name}`}
              />
              <Tooltip title="Aumentar cantidad">
                <span>
                  <IconButton
                    onClick={handleIncrementQuantity}
                    size="small"
                    disabled={loading}
                    aria-label={`Aumentar cantidad de ${item.name}`}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              {isServiceAdded ? (
                <>
                  <Tooltip title="Eliminar servicio">
                    <span>
                      <Button
                        onClick={() => setDeleteDialogOpen(true)}
                        variant="contained"
                        color="error"
                        disabled={loading}
                        startIcon={<DeleteIcon />}
                        aria-label={`Eliminar servicio ${item.name}`}
                      >
                        Eliminar Servicio
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Agregar servicio">
                    <span>
                      <Button
                        onClick={handleGoNext}
                        variant="contained"
                        disabled={loading}
                        aria-label={`Agregar servicio ${item.name}`}
                      >
                        {isServiceAdded ? "Actualizar" : "Agregar Servicio"}
                      </Button>
                    </span>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Agregar servicio">
                  <span>
                    <Button
                      onClick={handleGoNext}
                      variant="contained"
                      disabled={loading}
                      aria-label={`Agregar servicio ${item.name}`}
                    >
                      {isServiceAdded ? "Siguiente" : "Agregar Servicio"}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          aria-live="polite"
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-service-dialog-title"
        >
          <DialogTitle id="delete-service-dialog-title">
            Confirmar Eliminación
          </DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar el servicio "{item.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              aria-label="Cancelar eliminación"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={loading}
              aria-label="Confirmar eliminación"
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
