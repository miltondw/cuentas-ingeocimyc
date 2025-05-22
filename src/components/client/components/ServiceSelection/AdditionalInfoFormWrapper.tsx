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
import { useServiceRequest } from "../hooks/useServiceRequest";
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
}): React.ReactElement => {
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

  const handleCancel = useCallback(() => {
    setCurrentStep(0);
    setInstances([]);
    onClose();
  }, [onClose]);

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
  }, [open, quantity, serviceId, instanceId, existingInstances, instances.length]);

  // Helper function to check if a field is valid for a specific service  
  const isValidField = useCallback((serviceCode: string, fieldName: string): boolean => {
    // Define service-specific invalid fields
    const invalidFieldsByService: Record<string, string[]> = {
      // No invalid fields now that we know areaPredio is required for EDS-1
      // Add other service codes and their invalid fields here as needed
    };
    
    // Check if the field is invalid for this service
    if (invalidFieldsByService[serviceCode] && 
        invalidFieldsByService[serviceCode]?.includes(fieldName)) {
      return false;
    }
    
    return true;
  }, []);

  const validateInstance = useCallback(
    async (
      additionalInfo: Record<string, string | number | boolean | string[]>,
      showWarnings = true
    ): Promise<boolean> => {
      await validateForm();
      
      // Check for invalid fields based on service code
      const invalidFields = Object.keys(additionalInfo).filter(
        (fieldName) => !isValidField(service.code, fieldName)
      );
      
      if (invalidFields.length > 0 && showWarnings) {
        setNotification({
          open: true,
          message: `Advertencia: El campo "${invalidFields[0]}" podría no ser válido para el servicio ${service.code}`,
          severity: "warning",
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(prev => ({ ...prev, open: false }));
        }, 3000);
      }
      
      // Check required fields
      const requiredFields = service.additionalInfo?.filter(
        (field) => field.required
      );
      
      if (requiredFields?.length) {
        const missingRequiredFields = requiredFields.filter((field) => {
          const value = additionalInfo[field.field];
          return value === undefined || value === "" || value === null;
        });
        
        if (missingRequiredFields.length > 0 && showWarnings) {
          setNotification({
            open: true,
            message: `Advertencia: Campo incompleto: ${missingRequiredFields[0].label}`,
            severity: "warning",
          });
          
          // Auto-hide notification after 3 seconds
          setTimeout(() => {
            setNotification(prev => ({ ...prev, open: false }));
          }, 3000);
        }
      }
      
      // Always return true to avoid blocking the user flow
      return true;
    },
    [service.additionalInfo, service.code, validateForm, setNotification, isValidField]
  );
  const handleNext = useCallback(async (): Promise<void> => {
    if (currentStep < instances.length - 1) {
      const currentInstance = instances[currentStep];
      // Validate but don't block - validateInstance will show warnings
      await validateInstance(currentInstance.additionalInfo);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, instances, validateInstance]);

  const handleBack = useCallback((): void => {
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
    ): void => {
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

  const handleAddInstance = useCallback(async (): Promise<void> => {
    const currentInstance = instances[currentStep];
    
    // Validate but don't block - show warnings and continue
    await validateInstance(currentInstance.additionalInfo);
    
    // Always proceed to add a new instance
    setInstances((prev) => [...prev, { id: uuidv4(), additionalInfo: {} }]);
    setCurrentStep((prev) => prev + 1);
  }, [instances, currentStep, validateInstance]);

  const handleSaveAll = useCallback(async (): Promise<void> => {
    try {
      // Validate all instances but don't block - just show warnings
      await Promise.all(
        instances.map(
          async (instance) => {
            // Validate but continue anyway (validateInstance always returns true now)
            await validateInstance(instance.additionalInfo, true);
            return false; // No longer used to block
          }
        )
      );
      
      // Always proceed to save instances
      await onSave(instances);
      
      // Show success notification
      setNotification({
        open: true,
        message: "Instancias guardadas con éxito",
        severity: "success",
      });
      
      // Auto-hide success notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 3000);
      
      handleCancel(); // Cierra el diálogo y restablece el estado
    } catch {
      setNotification({
        open: true,
        message: "Error al guardar las instancias",
        severity: "error",
      });
      
      // Auto-hide error notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, open: false }));
      }, 3000);
    }
  }, [instances, onSave, validateInstance, handleCancel]);

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
          service={{...service, additionalInfo: service.additionalInfo}}
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
      </DialogActions>      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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
