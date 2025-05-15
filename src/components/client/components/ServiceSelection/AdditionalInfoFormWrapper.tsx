import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AdditionalInfoForm from "./AdditionalInfoForm";
import { ServiceItem } from "../types";
import { useServiceRequest } from "../ServiceRequestContext";
import { v4 as uuidv4 } from "uuid";

interface AdditionalInfoFormWrapperProps {
  open: boolean;
  quantity: number;
  service: ServiceItem;
  initialAdditionalInfo?: Record<string, string | number | boolean | string[]>;
  serviceId?: string;
  instanceId?: string;
  onClose: () => void;
  onSave: (
    instances: Array<{
      id: string;
      additionalInfo: Record<string, string | number | boolean | string[]>;
    }>
  ) => void;
}

const AdditionalInfoFormWrapper: React.FC<AdditionalInfoFormWrapperProps> = ({
  open,
  quantity,
  service,
  initialAdditionalInfo = {},
  serviceId,
  instanceId,
  onClose,
  onSave,
}) => {
  const { state, validateForm } = useServiceRequest();
  const { loading, error } = state;
  const [currentStep, setCurrentStep] = useState(0);
  const [instances, setInstances] = useState<
    Array<{
      id: string;
      additionalInfo: Record<string, string | number | boolean | string[]>;
    }>
  >([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const existingInstances = useMemo(() => {
    if (!serviceId) return [];
    const existingService = state.selectedServices.find(
      (s) => s.id === serviceId
    );
    if (!existingService) return [];
    return existingService.instances.map((instance) => ({
      id: instance.id,
      additionalInfo: {
        ...instance.additionalInfo,
        ...(instance.id === instanceId ? initialAdditionalInfo : {}),
      },
    }));
  }, [serviceId, instanceId, initialAdditionalInfo, state.selectedServices]);

  useEffect(() => {
    if (!open || instances.length > 0) return;
    if (serviceId && existingInstances.length > 0) {
      setInstances(existingInstances);
      const instanceIndex = instanceId
        ? existingInstances.findIndex((inst) => inst.id === instanceId)
        : 0;
      setCurrentStep(instanceIndex >= 0 ? instanceIndex : 0);
    } else {
      const newInstances = Array.from({ length: quantity }, () => ({
        id: uuidv4(),
        additionalInfo: {},
      }));
      setInstances(newInstances);
    }
  }, [open, quantity, serviceId, instanceId, existingInstances]);

  const validateInstance = useCallback(
    async (
      additionalInfo: Record<string, string | number | boolean | string[]>
    ) => {
      const isValid = await validateForm();
      if (!isValid) return false;
      const requiredFields = service.additionalInfo?.filter(
        (field) => field.required
      );
      if (!requiredFields?.length) return true;
      return requiredFields.every((field) => {
        const value = additionalInfo[field.field];
        return value !== undefined && value !== "" && value !== null;
      });
    },
    [service.additionalInfo, validateForm]
  );

  const handleNext = useCallback(async () => {
    if (currentStep < instances.length - 1) {
      const currentInstance = instances[currentStep];
      if (!(await validateInstance(currentInstance.additionalInfo))) {
        setNotification({
          open: true,
          message: "Por favor completa todos los campos requeridos",
          severity: "warning",
        });
        return;
      }
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, instances, validateInstance]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSaveInstance = useCallback(
    (
      additionalInfoOrUpdater:
        | Record<string, string | number | boolean | string[]>
        | ((
            prev: Record<string, string | number | boolean | string[]>
          ) => Record<string, string | number | boolean | string[]>)
    ) => {
      setInstances((prevInstances) => {
        const currentAdditionalInfo =
          prevInstances[currentStep]?.additionalInfo || {};
        const newAdditionalInfo =
          typeof additionalInfoOrUpdater === "function"
            ? additionalInfoOrUpdater(currentAdditionalInfo)
            : additionalInfoOrUpdater;
        return prevInstances.map((instance, index) =>
          index === currentStep
            ? { ...instance, additionalInfo: { ...newAdditionalInfo } }
            : instance
        );
      });
    },
    [currentStep]
  );

  const handleAddInstance = useCallback(async () => {
    const currentInstance = instances[currentStep];
    if (!(await validateInstance(currentInstance.additionalInfo))) {
      setNotification({
        open: true,
        message:
          "Por favor completa todos los campos requeridos antes de agregar otra instancia",
        severity: "warning",
      });
      return;
    }
    setInstances((prev) => [...prev, { id: uuidv4(), additionalInfo: {} }]);
    setCurrentStep((prev) => prev + 1);
  }, [instances, currentStep, validateInstance]);

  const handleSaveAll = useCallback(async () => {
    try {
      const invalidInstances = await Promise.all(
        instances.map(
          async (instance) => !(await validateInstance(instance.additionalInfo))
        )
      );
      if (invalidInstances.some((invalid) => invalid)) {
        setNotification({
          open: true,
          message:
            "Por favor completa todos los campos requeridos en todas las instancias",
          severity: "warning",
        });
        return;
      }
      onSave(instances);
      setNotification({
        open: true,
        message: "Instancias guardadas con éxito",
        severity: "success",
      });
      handleCancel();
    } catch (error) {
      setNotification({
        open: true,
        message: "Error al guardar las instancias",
        severity: "error",
      });
    }
  }, [instances, onSave, validateInstance]);

  const handleCancel = useCallback(() => {
    setCurrentStep(0);
    setInstances([]);
    onClose();
  }, [onClose]);

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const progress = useMemo(
    () => ((currentStep + 1) / instances.length) * 100,
    [currentStep, instances.length]
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="additional-info-wrapper-title"
    >
      <DialogTitle id="additional-info-wrapper-title">
        Información Adicional para {service.name} - Instancia {currentStep + 1}{" "}
        de {instances.length}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Instancia {currentStep + 1} de {instances.length}
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <AdditionalInfoForm
          service={service}
          itemAdditionalInfo={instances[currentStep]?.additionalInfo || {}}
          setItemAdditionalInfo={handleSaveInstance}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          color="secondary"
          disabled={loading}
          aria-label="Cancel additional info"
        >
          Cancelar
        </Button>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            aria-label="Previous instance"
          >
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === instances.length - 1 || loading}
            aria-label="Next instance"
          >
            Siguiente
          </Button>
        </Box>
        <Button
          onClick={handleAddInstance}
          variant="outlined"
          color="primary"
          disabled={loading}
          aria-label="Add another instance"
        >
          Agregar Instancia
        </Button>
        <Button
          onClick={handleSaveAll}
          variant="contained"
          color="primary"
          disabled={loading}
          aria-label="Save all instances"
        >
          Guardar Todo
        </Button>
      </DialogActions>
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
    </Dialog>
  );
};

export default AdditionalInfoFormWrapper;
