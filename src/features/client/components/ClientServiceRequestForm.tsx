/**
 * Formulario multi-step para solicitudes de servicio de clientes
 * @file ClientServiceRequestForm.tsx
 */

import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  PersonOutline,
  BusinessOutlined,
  AssignmentOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";

// Componentes del formulario
import { ClientInfoForm } from "./steps/ClientInfoForm";
import { ServiceSelectionForm } from "./steps/ServiceSelectionForm";
import { ProjectDetailsForm } from "./steps/ProjectDetailsForm";
import { ReviewAndConfirmForm } from "./steps/ReviewAndConfirmForm";
import { SuccessStep } from "./steps/SuccessStep";

// Hooks
import {
  useCreateServiceRequest,
  useServices,
} from "../hooks/useServiceRequests";

// Tipos
import type {
  CreateServiceRequestRequest,
  InternalServiceRequestData,
  ServiceRequest,
  APIService,
  ProcessedServiceCategory,
  ProcessedService,
  BackendServiceRequest,
} from "@/types/serviceRequests";

// Definir los pasos del formulario
const FORM_STEPS = [
  {
    id: "client-info",
    label: "Información del Cliente",
    icon: PersonOutline,
    description: "Datos de contacto y empresa",
  },
  {
    id: "service-selection",
    label: "Selección de Servicios",
    icon: BusinessOutlined,
    description: "Tipo de servicio requerido",
  },
  {
    id: "project-details",
    label: "Detalles del Proyecto",
    icon: AssignmentOutlined,
    description: "Descripción y ubicación",
  },
  {
    id: "review-confirm",
    label: "Revisión y Confirmación",
    icon: CheckCircleOutline,
    description: "Verificar y enviar solicitud",
  },
] as const;

// Datos iniciales del formulario
const INITIAL_FORM_DATA: InternalServiceRequestData = {
  nombre: "",
  email: "",
  telefono: "",
  empresa: "",
  nameProject: "",
  identification: "",
  descripcion: "",
  ubicacionProyecto: "",
  selectedServices: [],
};

export interface ClientServiceRequestFormProps {
  onSuccess?: (serviceRequest: ServiceRequest) => void;
  onCancel?: () => void;
}

/**
 * Componente principal del formulario de solicitud de servicio
 */
export const ClientServiceRequestForm: React.FC<
  ClientServiceRequestFormProps
> = ({ onSuccess, onCancel }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] =
    useState<InternalServiceRequestData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof InternalServiceRequestData, string>>
  >({});

  // Estado para rastrear si venimos de revisión
  const [fromReview, setFromReview] = useState(false); // Hooks de mutación y validación
  const { mutate: createServiceRequest, isPending } = useCreateServiceRequest();
  const { data: servicesData } = useServices();
  // Procesar servicios disponibles (misma lógica que en ServiceSelectionForm)
  const availableServices = React.useMemo(() => {
    if (!servicesData) return [];

    const allServices: ProcessedService[] = [];
    const categoriesMap = new Map<number, ProcessedServiceCategory>();

    servicesData.forEach((service: APIService) => {
      if (!categoriesMap.has(service.categoryId)) {
        categoriesMap.set(service.categoryId, {
          id: service.category.id.toString(),
          name: service.category.name,
          description: `Servicios de ${service.category.name}`,
          code: service.category.code,
          services: [],
        });
      }

      const processedService = {
        id: service.id.toString(),
        name: service.name,
        description: `${service.code} - ${service.name}`,
        code: service.code,
        categoryId: service.categoryId.toString(),
        categoryName: service.category.name,
        hasAdditionalFields: service.additionalFields.length > 0,
        additionalFields: service.additionalFields.map((field) => ({
          id: field.id.toString(),
          name: field.fieldName,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options || undefined,
          dependsOnField: field.dependsOnField || undefined,
          dependsOnValue: field.dependsOnValue || undefined,
        })),
      };

      allServices.push(processedService);
      const category = categoriesMap.get(service.categoryId);
      if (category) {
        category.services.push(processedService);
      }
    });

    return allServices;
  }, [servicesData]);
  // Estado de éxito
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequest, setSubmittedRequest] =
    useState<ServiceRequest | null>(null);
  /**
   * Ir a un paso específico
   */
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < 4) {
        // Si estamos en revisión (paso 3) y vamos a otro paso, marcamos que venimos de revisión
        if (activeStep === 3 && step !== 3) {
          setFromReview(true);
        }
        setActiveStep(step);
      }
    },
    [activeStep]
  );
  /**
   * Transformar datos internos al formato del backend
   */
  const transformToBackendFormat = useCallback(
    (data: InternalServiceRequestData): CreateServiceRequestRequest => {
      // Transformar servicios al formato del backend
      const transformedServices: BackendServiceRequest[] =
        data.selectedServices.map((service) => {
          // Calcular la cantidad total del servicio
          const totalQuantity = service.instances.reduce(
            (sum, instance) => sum + instance.quantity,
            0
          );

          // Recopilar todos los campos adicionales de todas las instancias
          const allAdditionalValues: Array<{
            fieldName: string;
            fieldValue: string;
          }> = [];

          service.instances.forEach((instance, instanceIndex) => {
            if (instance.additionalData && instance.additionalData.length > 0) {
              instance.additionalData.forEach((data) => {
                // Agregar prefijo de instancia para distinguir valores entre instancias
                const fieldName = `instance_${instanceIndex + 1}_field_${
                  data.fieldId
                }`;
                allAdditionalValues.push({
                  fieldName: fieldName,
                  fieldValue: String(data.value),
                });
              });
            }

            // Agregar notas si existen
            if (instance.notes) {
              allAdditionalValues.push({
                fieldName: `instance_${instanceIndex + 1}_notes`,
                fieldValue: instance.notes,
              });
            }
          });

          return {
            serviceId: parseInt(service.serviceId),
            quantity: totalQuantity,
            additionalValues:
              allAdditionalValues.length > 0 ? allAdditionalValues : undefined,
          };
        });

      return {
        name: data.nombre,
        nameProject: data.nameProject,
        location: data.ubicacionProyecto,
        identification: data.identification,
        phone: data.telefono,
        email: data.email,
        description: data.descripcion,
        selectedServices: transformedServices,
      };
    },
    []
  );

  /**
   * Actualizar datos del formulario
   */
  const updateFormData = useCallback(
    (updates: Partial<InternalServiceRequestData>) => {
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      // Limpiar errores de los campos actualizados
      const updatedFields = Object.keys(updates);
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        updatedFields.forEach((field) => {
          delete newErrors[field as keyof InternalServiceRequestData];
        });
        return newErrors;
      });
    },
    []
  );
  /**
   * Validar paso actual
   */
  const validateCurrentStep = useCallback((): boolean => {
    // Por ahora simplificamos la validación
    let stepIsValid = true;
    const stepErrors: typeof formErrors = {};

    switch (activeStep) {
      case 0: {
        // Cliente info - validaciones básicas
        if (!formData.nombre.trim()) {
          stepErrors.nombre = "El nombre es requerido";
          stepIsValid = false;
        }
        if (!formData.email.trim()) {
          stepErrors.email = "El email es requerido";
          stepIsValid = false;
        }
        if (!formData.telefono.trim()) {
          stepErrors.telefono = "El teléfono es requerido";
          stepIsValid = false;
        }
        if (!formData.empresa.trim()) {
          stepErrors.empresa = "La empresa es requerida";
          stepIsValid = false;
        }
        if (!formData.identification.trim()) {
          stepErrors.identification = "La identificación es requerida";
          stepIsValid = false;
        }
        if (!formData.nameProject.trim()) {
          stepErrors.nameProject = "El nombre del proyecto es requerido";
          stepIsValid = false;
        }
        break;
      }

      case 1: {
        // Servicios - validar que al menos haya un servicio seleccionado
        if (
          !formData.selectedServices ||
          formData.selectedServices.length === 0
        ) {
          stepErrors.selectedServices = "Debe seleccionar al menos un servicio";
          stepIsValid = false;
        }
        break;
      }

      case 2: {
        // Proyecto
        if (!formData.descripcion.trim()) {
          stepErrors.descripcion = "La descripción es requerida";
          stepIsValid = false;
        }
        if (!formData.ubicacionProyecto.trim()) {
          stepErrors.ubicacionProyecto =
            "La ubicación del proyecto es requerida";
          stepIsValid = false;
        }
        break;
      }

      case 3: {
        // Revisión - validar todo
        // Aquí podríamos agregar validaciones finales
        break;
      }
    }

    setFormErrors(stepErrors);
    return stepIsValid;
  }, [activeStep, formData]);
  /**
   * Ir al siguiente paso
   */
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      // Si venimos de revisión, ir directamente a revisión después de validar
      if (fromReview) {
        setFromReview(false);
        setActiveStep(3);
      } else {
        setActiveStep((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
      }
    }
  }, [validateCurrentStep, fromReview]);
  /**
   * Ir al paso anterior
   */
  const handleBack = useCallback(() => {
    setFromReview(false); // Limpiar el estado si retrocedemos manualmente
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Ir a un paso específico
   */
  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= activeStep) {
        setActiveStep(stepIndex);
      }
    },
    [activeStep]
  );
  /**
   * Enviar formulario
   */
  const handleSubmit = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }

    // Transformar datos al formato del backend
    const backendData = transformToBackendFormat(formData);

    createServiceRequest(backendData, {
      onSuccess: (result) => {
        setSubmittedRequest(result);
        setIsSubmitted(true);
        onSuccess?.(result);
      },
    });
  }, [
    formData,
    validateCurrentStep,
    createServiceRequest,
    onSuccess,
    transformToBackendFormat,
  ]);
  /**
   * Reiniciar formulario
   */
  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setActiveStep(0);
    setIsSubmitted(false);
    setSubmittedRequest(null);
    setFromReview(false);
  }, []);

  /**
   * Renderizar el contenido del paso actual
   */
  const renderStepContent = () => {
    if (isSubmitted) {
      return (
        <SuccessStep
          serviceRequest={submittedRequest}
          onNewRequest={handleReset}
          onViewDetails={() =>
            submittedRequest && onSuccess?.(submittedRequest)
          }
        />
      );
    }

    switch (activeStep) {
      case 0:
        return (
          <ClientInfoForm
            data={formData}
            errors={formErrors}
            onChange={updateFormData}
          />
        );

      case 1:
        return (
          <ServiceSelectionForm
            data={formData}
            errors={formErrors}
            onChange={updateFormData}
          />
        );

      case 2:
        return (
          <ProjectDetailsForm
            data={formData}
            errors={formErrors}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <ReviewAndConfirmForm
            data={formData}
            errors={formErrors}
            onChange={updateFormData}
            onEditStep={goToStep}
            fromReview={fromReview}
            availableServices={availableServices}
          />
        );

      default:
        return null;
    }
  };

  /**
   * Renderizar botones de navegación
   */
  const renderNavigationButtons = () => {
    if (isSubmitted) {
      return null;
    }

    const isLastStep = activeStep === FORM_STEPS.length - 1;

    return (
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          onClick={activeStep === 0 ? onCancel : handleBack}
          disabled={isPending}
          variant="outlined"
        >
          {activeStep === 0 ? "Cancelar" : "Anterior"}
        </Button>

        <Button
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isPending}
          variant="contained"
          startIcon={
            isPending ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isPending
            ? "Enviando..."
            : isLastStep
            ? "Enviar Solicitud"
            : "Siguiente"}
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Solicitud de Servicios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete el formulario para solicitar nuestros servicios
              especializados
            </Typography>
          </Box>

          {/* Stepper */}
          {!isSubmitted && (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
              {FORM_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <Step
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    sx={{
                      cursor: index <= activeStep ? "pointer" : "default",
                      "& .MuiStepLabel-root": {
                        flexDirection: "column",
                      },
                    }}
                  >
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                              index <= activeStep
                                ? theme.palette.primary.main
                                : theme.palette.grey[300],
                            color:
                              index <= activeStep
                                ? theme.palette.primary.contrastText
                                : theme.palette.text.disabled,
                            mb: 1,
                          }}
                        >
                          <StepIcon fontSize="small" />
                        </Box>
                      )}
                    >
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          )}

          {/* Mostrar errores generales */}
          {Object.keys(formErrors).length > 0 && !isSubmitted && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Por favor corrija los errores en el formulario antes de continuar.
            </Alert>
          )}

          {/* Contenido del paso */}
          <Box sx={{ minHeight: 400 }}>{renderStepContent()}</Box>

          {/* Botones de navegación */}
          {renderNavigationButtons()}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClientServiceRequestForm;
