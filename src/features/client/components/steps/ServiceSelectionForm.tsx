/**
 * Formulario de selección de servicios - Paso 2
 * @file ServiceSelectionForm.tsx
 */

import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid2,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  EngineeringOutlined,
  ScienceOutlined,
  ConstructionOutlined,
  AssessmentOutlined,
  ExpandMoreOutlined,
  AddOutlined,
  DeleteOutlined,
  LayersOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

import { useServices } from "../../hooks/useServiceRequests";
import type {
  InternalServiceRequestData,
  SelectedService,
  ServiceInstance,
  APIService,
  ProcessedServiceCategory,
} from "@/types/serviceRequests";

export interface ServiceSelectionFormProps {
  data: InternalServiceRequestData;
  errors: Partial<Record<keyof InternalServiceRequestData, string>>;
  onChange: (updates: Partial<InternalServiceRequestData>) => void;
}

// Interfaces locales para el formulario
interface ServiceField {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
  };
  options?: string[];
  dependsOnField?: string;
  dependsOnValue?: string;
}

// Iconos por categoría (fallback si no viene de la API)
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  geotecnia: EngineeringOutlined,
  laboratorio: ScienceOutlined,
  construccion: ConstructionOutlined,
  consultoria: AssessmentOutlined,
};

/**
 * Componente del paso de selección de servicios
 */
export const ServiceSelectionForm: React.FC<ServiceSelectionFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { data: servicesData, isLoading, error } = useServices();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const [quantityInputs, setQuantityInputs] = useState<Record<string, number>>(
    {}
  );
  // Estados para el modal de configuración
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configService, setConfigService] = useState<{
    service: APIService;
    quantity: number;
    instanceIndex?: number;
  } | null>(null);
  const [configInstances, setConfigInstances] = useState<ServiceInstance[]>([]);

  // Procesar datos de la API para organizarlos por categorías
  const categories = React.useMemo((): ProcessedServiceCategory[] => {
    if (!servicesData) return [];

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

      const category = categoriesMap.get(service.categoryId);
      if (category) {
        category.services.push({
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
        });
      }
    });

    return Array.from(categoriesMap.values());
  }, [servicesData]); // Función para agregar un servicio con cantidad (sin campos adicionales)
  const addServiceWithQuantity = useCallback(
    (serviceId: string, quantity: number = 1) => {
      const service = categories
        ?.flatMap((cat) => cat.services)
        ?.find((s) => s.id === serviceId);

      if (!service) return;

      const newSelectedService: SelectedService = {
        serviceId: service.id,
        serviceName: service.name,
        serviceDescription:
          service.description || `${service.code} - ${service.name}`,
        instances: [
          {
            instanceId: uuidv4(),
            quantity: Math.max(1, quantity),
            additionalData: [],
            notes: "",
          },
        ],
        totalQuantity: Math.max(1, quantity),
      };

      const updatedServices = [
        ...(data.selectedServices || []),
        newSelectedService,
      ];
      onChange({ selectedServices: updatedServices });

      // Limpiar cantidad
      setQuantityInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[serviceId];
        return newInputs;
      });
    },
    [categories, data.selectedServices, onChange]
  );

  // Función para manejar cambio de cantidad antes de agregar
  const handleQuantityChange = useCallback(
    (serviceId: string, quantity: number) => {
      setQuantityInputs((prev) => ({
        ...prev,
        [serviceId]: Math.max(1, quantity),
      }));
    },
    []
  );

  // Función para remover un servicio
  const removeService = useCallback(
    (serviceId: string) => {
      const updatedServices =
        data.selectedServices?.filter((s) => s.serviceId !== serviceId) || [];
      onChange({ selectedServices: updatedServices });
    },
    [data.selectedServices, onChange]
  );

  // Función para agregar una nueva instancia (capa)
  const addInstance = useCallback(
    (serviceId: string) => {
      const service = categories
        ?.flatMap((cat) => cat.services)
        ?.find((s) => s.id === serviceId);

      if (!service?.hasAdditionalFields) return;

      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === serviceId) {
            const newInstance: ServiceInstance = {
              instanceId: uuidv4(),
              quantity: 1,
              additionalData: [],
              notes: "",
            };

            const newInstances = [...selectedService.instances, newInstance];
            return {
              ...selectedService,
              instances: newInstances,
              totalQuantity: newInstances.reduce(
                (sum, inst) => sum + inst.quantity,
                0
              ),
            };
          }
          return selectedService;
        }) || [];

      onChange({ selectedServices: updatedServices });
    },
    [categories, data.selectedServices, onChange]
  );

  // Función para remover una instancia
  const removeInstance = useCallback(
    (serviceId: string, instanceId: string) => {
      const updatedServices =
        (data.selectedServices
          ?.map((selectedService) => {
            if (selectedService.serviceId === serviceId) {
              const newInstances = selectedService.instances.filter(
                (inst) => inst.instanceId !== instanceId
              );

              // Si no quedan instancias, remover el servicio completamente
              if (newInstances.length === 0) {
                return null;
              }

              return {
                ...selectedService,
                instances: newInstances,
                totalQuantity: newInstances.reduce(
                  (sum, inst) => sum + inst.quantity,
                  0
                ),
              };
            }
            return selectedService;
          })
          .filter(Boolean) as SelectedService[]) || [];

      onChange({ selectedServices: updatedServices });
    },
    [data.selectedServices, onChange]
  );

  // Función para actualizar cantidad de una instancia
  const updateInstanceQuantity = useCallback(
    (serviceId: string, instanceId: string, quantity: number) => {
      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === serviceId) {
            const newInstances = selectedService.instances.map((inst) => {
              if (inst.instanceId === instanceId) {
                return { ...inst, quantity: Math.max(1, quantity) };
              }
              return inst;
            });

            return {
              ...selectedService,
              instances: newInstances,
              totalQuantity: newInstances.reduce(
                (sum, inst) => sum + inst.quantity,
                0
              ),
            };
          }
          return selectedService;
        }) || [];

      onChange({ selectedServices: updatedServices });
    },
    [data.selectedServices, onChange]
  );

  // Función para actualizar datos adicionales
  const updateAdditionalData = useCallback(
    (
      serviceId: string,
      instanceId: string,
      fieldId: string,
      value: string | number | boolean
    ) => {
      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === serviceId) {
            const newInstances = selectedService.instances.map((inst) => {
              if (inst.instanceId === instanceId) {
                const existingData = inst.additionalData || [];
                const updatedData = existingData.filter(
                  (d) => d.fieldId !== fieldId
                );
                updatedData.push({ fieldId, value });

                return { ...inst, additionalData: updatedData };
              }
              return inst;
            });

            return { ...selectedService, instances: newInstances };
          }
          return selectedService;
        }) || [];

      onChange({ selectedServices: updatedServices });
    },
    [data.selectedServices, onChange]
  );

  // Función para toggle de categorías expandidas
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []); // Verificar si un servicio está seleccionado
  const isServiceSelected = useCallback(
    (serviceId: string) => {
      return (
        data.selectedServices?.some((s) => s.serviceId === serviceId) || false
      );
    },
    [data.selectedServices]
  );
  // Renderizar campo adicional
  const renderAdditionalField = useCallback(
    (
      field: ServiceField,
      serviceId: string,
      instanceId: string,
      currentValue?: string | number | boolean
    ) => {
      const value = currentValue ?? field.defaultValue ?? "";

      switch (field.type) {
        case "text":
        case "textarea":
          return (
            <TextField
              key={field.id}
              fullWidth
              label={field.label}
              placeholder={field.placeholder}
              multiline={field.type === "textarea"}
              rows={field.type === "textarea" ? 3 : 1}
              value={value}
              required={field.required}
              onChange={(e) =>
                updateAdditionalData(
                  serviceId,
                  instanceId,
                  field.id,
                  e.target.value
                )
              }
              variant="outlined"
              size="small"
            />
          );

        case "number":
          return (
            <TextField
              key={field.id}
              fullWidth
              type="number"
              label={field.label}
              placeholder={field.placeholder}
              value={value}
              required={field.required}
              inputProps={{
                min: field.validation?.min,
                max: field.validation?.max,
              }}
              onChange={(e) =>
                updateAdditionalData(
                  serviceId,
                  instanceId,
                  field.id,
                  Number(e.target.value)
                )
              }
              variant="outlined"
              size="small"
            />
          );

        case "select":
          return (
            <FormControl key={field.id} fullWidth size="small">
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={value}
                label={field.label}
                required={field.required}
                onChange={(e) =>
                  updateAdditionalData(
                    serviceId,
                    instanceId,
                    field.id,
                    e.target.value
                  )
                }
              >
                {field.options?.map((option: string) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        case "checkbox":
          return (
            <FormControlLabel
              key={field.id}
              control={
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) =>
                    updateAdditionalData(
                      serviceId,
                      instanceId,
                      field.id,
                      e.target.checked
                    )
                  }
                />
              }
              label={field.label}
            />
          );

        case "date":
          return (
            <TextField
              key={field.id}
              fullWidth
              type="date"
              label={field.label}
              value={value}
              required={field.required}
              onChange={(e) =>
                updateAdditionalData(
                  serviceId,
                  instanceId,
                  field.id,
                  e.target.value
                )
              }
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          );

        default:
          return null;
      }
    },
    [updateAdditionalData]
  );
  // Funciones del modal de configuración
  const openConfigModal = useCallback(
    (service: APIService, quantity: number = 1, instanceIndex?: number) => {
      // Si es para editar una instancia existente
      if (instanceIndex !== undefined) {
        const selectedService = data.selectedServices?.find(
          (s) => s.serviceId === service.id.toString()
        );
        if (selectedService && selectedService.instances[instanceIndex]) {
          const instance = selectedService.instances[instanceIndex];
          setConfigInstances([{ ...instance }]);
        }
      } else {
        // Nueva configuración
        const newInstance: ServiceInstance = {
          instanceId: uuidv4(),
          quantity: quantity,
          additionalData: (service.additionalFields || []).map((field) => ({
            fieldId: field.id.toString(),
            value: "",
          })),
          notes: "",
        };
        setConfigInstances([newInstance]);
      }

      setConfigService({ service, quantity, instanceIndex });
      setConfigModalOpen(true);
    },
    [data.selectedServices]
  );

  const closeConfigModal = useCallback(() => {
    setConfigModalOpen(false);
    setConfigService(null);
    setConfigInstances([]);
  }, []);
  const addInstanceInModal = useCallback(() => {
    if (!configService) return;

    const newInstance: ServiceInstance = {
      instanceId: uuidv4(),
      quantity: 1,
      additionalData: (configService.service.additionalFields || []).map(
        (field) => ({
          fieldId: field.id.toString(),
          value: "",
        })
      ),
      notes: "",
    };

    setConfigInstances((prev) => [...prev, newInstance]);
  }, [configService]);

  const removeInstanceInModal = useCallback((instanceId: string) => {
    setConfigInstances((prev) =>
      prev.filter((inst) => inst.instanceId !== instanceId)
    );
  }, []);

  const updateInstanceInModal = useCallback(
    (instanceId: string, updates: Partial<ServiceInstance>) => {
      setConfigInstances((prev) =>
        prev.map((inst) =>
          inst.instanceId === instanceId ? { ...inst, ...updates } : inst
        )
      );
    },
    []
  );
  const updateInstanceFieldInModal = useCallback(
    (instanceId: string, fieldId: string, value: string | number | boolean) => {
      setConfigInstances((prev) =>
        prev.map((inst) =>
          inst.instanceId === instanceId
            ? {
                ...inst,
                additionalData: (inst.additionalData || []).map((data) =>
                  data.fieldId === fieldId ? { ...data, value } : data
                ),
              }
            : inst
        )
      );
    },
    []
  );
  const saveConfiguredService = useCallback(() => {
    if (!configService || configInstances.length === 0) return;

    const { service, instanceIndex } = configService;

    if (instanceIndex !== undefined) {
      // Editando una instancia existente
      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === service.id.toString()) {
            const updatedInstances = [...selectedService.instances];
            updatedInstances[instanceIndex] = configInstances[0];

            return {
              ...selectedService,
              instances: updatedInstances,
              totalQuantity: updatedInstances.reduce(
                (sum, inst) => sum + inst.quantity,
                0
              ),
            };
          }
          return selectedService;
        }) || [];

      onChange({ selectedServices: updatedServices });
    } else {
      // Agregando nuevo servicio
      const newSelectedService: SelectedService = {
        serviceId: service.id.toString(),
        serviceName: service.name,
        serviceDescription: `${service.code} - ${service.name}`,
        instances: configInstances,
        totalQuantity: configInstances.reduce(
          (sum, inst) => sum + inst.quantity,
          0
        ),
      };

      const updatedServices = [
        ...(data.selectedServices || []),
        newSelectedService,
      ];

      onChange({ selectedServices: updatedServices });
    }

    closeConfigModal();
  }, [
    configService,
    configInstances,
    data.selectedServices,
    onChange,
    closeConfigModal,
  ]); // Renderizar campo en el modal
  const renderModalField = useCallback(
    (
      field: {
        id: string | number;
        label: string;
        type: string;
        placeholder?: string;
        required?: boolean;
        defaultValue?: string | number | boolean;
        validation?: { min?: number; max?: number };
        options?: string[] | null;
      },
      instanceId: string,
      currentValue?: string | number | boolean
    ) => {
      const value = currentValue ?? "";

      switch (field.type) {
        case "text":
        case "textarea":
          return (
            <TextField
              fullWidth
              label={field.label}
              placeholder={field.placeholder}
              multiline={field.type === "textarea"}
              rows={field.type === "textarea" ? 3 : 1}
              value={value}
              required={field.required}
              onChange={(e) =>
                updateInstanceFieldInModal(
                  instanceId,
                  field.id.toString(),
                  e.target.value
                )
              }
              variant="outlined"
              size="small"
            />
          );

        case "number":
          return (
            <TextField
              fullWidth
              type="number"
              label={field.label}
              placeholder={field.placeholder}
              value={value}
              required={field.required}
              onChange={(e) =>
                updateInstanceFieldInModal(
                  instanceId,
                  field.id.toString(),
                  Number(e.target.value)
                )
              }
              inputProps={{
                min: field.validation?.min,
                max: field.validation?.max,
              }}
              variant="outlined"
              size="small"
            />
          );

        case "select":
          return (
            <FormControl fullWidth required={field.required} size="small">
              <InputLabel>{field.label}</InputLabel>
              <Select
                value={value}
                label={field.label}
                onChange={(e) =>
                  updateInstanceFieldInModal(
                    instanceId,
                    field.id.toString(),
                    e.target.value
                  )
                }
              >
                {(field.options || []).map((option: string) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );

        case "checkbox":
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(e) =>
                    updateInstanceFieldInModal(
                      instanceId,
                      field.id.toString(),
                      e.target.checked
                    )
                  }
                />
              }
              label={field.label}
            />
          );

        case "date":
          return (
            <TextField
              fullWidth
              type="date"
              label={field.label}
              value={value}
              required={field.required}
              onChange={(e) =>
                updateInstanceFieldInModal(
                  instanceId,
                  field.id.toString(),
                  e.target.value
                )
              }
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          );

        default:
          return null;
      }
    },
    [updateInstanceFieldInModal]
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Cargando servicios disponibles...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error al cargar los servicios disponibles. Por favor, intente
        nuevamente.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Selección de Servicios
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Seleccione los servicios que necesita. Para servicios con información
        adicional, puede agregar múltiples capas con diferentes configuraciones.
      </Typography>
      {/* Mostrar errores */}
      {errors.selectedServices && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.selectedServices}
        </Alert>
      )}
      {/* Servicios seleccionados */}
      {data.selectedServices && data.selectedServices.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <LayersOutlined color="primary" />
            Servicios Seleccionados ({data.selectedServices.length})
          </Typography>

          {data.selectedServices.map((selectedService) => {
            const service = categories
              ?.flatMap((cat) => cat.services)
              ?.find((s) => s.id === selectedService.serviceId);

            return (
              <Accordion key={selectedService.serviceId} sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreOutlined />}
                  sx={{ pr: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      mr: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedService.serviceName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total: {selectedService.totalQuantity} unidades •
                        {selectedService.instances.length} instancia(s)
                      </Typography>
                    </Box>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation();
                        removeService(selectedService.serviceId);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        color: "error.main",
                        "&:hover": {
                          bgcolor: "error.light",
                          borderRadius: 1,
                        },
                        p: 0.5,
                      }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid2 container spacing={2}>
                    {selectedService.instances.map((instance, index) => (
                      <Grid2 size={{ xs: 12 }} key={instance.instanceId}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography variant="subtitle2">
                              Instancia {index + 1}
                              {service?.hasAdditionalFields && (
                                <Chip
                                  label="Con campos adicionales"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {/* Botón para editar en modal */}
                              {service?.hasAdditionalFields && (
                                <Tooltip title="Editar información adicional">
                                  <IconButton
                                    onClick={() => {
                                      const apiService = servicesData?.find(
                                        (s) =>
                                          s.id.toString() ===
                                          selectedService.serviceId
                                      );
                                      if (apiService) {
                                        openConfigModal(
                                          apiService,
                                          instance.quantity,
                                          index
                                        );
                                      }
                                    }}
                                    color="primary"
                                    size="small"
                                  >
                                    <InfoOutlined />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {selectedService.instances.length > 1 && (
                                <IconButton
                                  onClick={() =>
                                    removeInstance(
                                      selectedService.serviceId,
                                      instance.instanceId
                                    )
                                  }
                                  color="error"
                                  size="small"
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                          <Grid2 container spacing={2}>
                            {/* Cantidad */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <TextField
                                fullWidth
                                type="number"
                                label="Cantidad"
                                value={instance.quantity}
                                inputProps={{ min: 1 }}
                                onChange={(e) =>
                                  updateInstanceQuantity(
                                    selectedService.serviceId,
                                    instance.instanceId,
                                    Number(e.target.value)
                                  )
                                }
                                variant="outlined"
                                size="small"
                              />
                            </Grid2>

                            {/* Campos adicionales */}
                            {service?.hasAdditionalFields &&
                              service.additionalFields && (
                                <>
                                  {service.additionalFields.map(
                                    (field: ServiceField) => {
                                      const currentValue =
                                        instance.additionalData?.find(
                                          (d) => d.fieldId === field.id
                                        )?.value;

                                      return (
                                        <Grid2
                                          size={{ xs: 12, sm: 6, md: 4 }}
                                          key={field.id}
                                        >
                                          {renderAdditionalField(
                                            field,
                                            selectedService.serviceId,
                                            instance.instanceId,
                                            currentValue
                                          )}
                                        </Grid2>
                                      );
                                    }
                                  )}
                                </>
                              )}

                            {/* Notas */}
                            <Grid2 size={{ xs: 12 }}>
                              <TextField
                                fullWidth
                                label="Notas adicionales (opcional)"
                                multiline
                                rows={2}
                                value={instance.notes || ""}
                                onChange={(e) => {
                                  const updatedServices =
                                    data.selectedServices?.map((s) => {
                                      if (
                                        s.serviceId ===
                                        selectedService.serviceId
                                      ) {
                                        const newInstances = s.instances.map(
                                          (inst) => {
                                            if (
                                              inst.instanceId ===
                                              instance.instanceId
                                            ) {
                                              return {
                                                ...inst,
                                                notes: e.target.value,
                                              };
                                            }
                                            return inst;
                                          }
                                        );
                                        return {
                                          ...s,
                                          instances: newInstances,
                                        };
                                      }
                                      return s;
                                    }) || [];
                                  onChange({
                                    selectedServices: updatedServices,
                                  });
                                }}
                                variant="outlined"
                                size="small"
                              />
                            </Grid2>
                          </Grid2>
                        </Paper>
                      </Grid2>
                    ))}

                    {/* Botón para agregar nueva instancia */}
                    {service?.hasAdditionalFields && (
                      <Grid2 size={{ xs: 12 }}>
                        <Button
                          startIcon={<AddOutlined />}
                          onClick={() => addInstance(selectedService.serviceId)}
                          variant="outlined"
                          size="small"
                        >
                          Agregar Nueva Capa
                        </Button>
                      </Grid2>
                    )}
                  </Grid2>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Paper>
      )}
      {/* Catálogo de servicios */}
      <Typography variant="h6" gutterBottom>
        Catálogo de Servicios Disponibles
      </Typography>
      <Grid2 container spacing={3}>
        {categories?.map((category) => {
          const CategoryIcon =
            CATEGORY_ICONS[category.id] || AssessmentOutlined;
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Grid2 size={{ xs: 12 }} key={category.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        cursor: "pointer",
                        flex: 1,
                        py: 1,
                      }}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <CategoryIcon color="primary" />
                      <Box>
                        <Typography variant="h6">{category.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={`${category.services.length} servicios`}
                        size="small"
                        variant="outlined"
                      />
                      <IconButton onClick={() => toggleCategory(category.id)}>
                        <ExpandMoreOutlined
                          sx={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.3s",
                          }}
                        />
                      </IconButton>
                    </Box>
                  </Box>
                  {isExpanded && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Grid2 container spacing={2}>
                        {category.services.map((service) => {
                          const isSelected = isServiceSelected(service.id);

                          return (
                            <Grid2
                              size={{ xs: 12, sm: 6, md: 4 }}
                              key={service.id}
                            >
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  border: isSelected ? 2 : 1,
                                  borderColor: isSelected
                                    ? "primary.main"
                                    : "divider",
                                  bgcolor: isSelected
                                    ? "primary.light"
                                    : "background.paper",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    bgcolor: isSelected
                                      ? "primary.light"
                                      : "action.hover",
                                  },
                                }}
                              >
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    {service.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    paragraph
                                  >
                                    {service.description}
                                  </Typography>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Chip
                                      label={service.code}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                    {service.hasAdditionalFields && (
                                      <Tooltip title="Este servicio tiene campos adicionales configurables">
                                        <Chip
                                          label="Configurable"
                                          size="small"
                                          color="secondary"
                                          icon={<InfoOutlined />}
                                        />
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>

                                {!isSelected ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 2,
                                    }}
                                  >
                                    {/* Cantidad */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "center",
                                      }}
                                    >
                                      <TextField
                                        type="number"
                                        label="Cantidad"
                                        size="small"
                                        value={quantityInputs[service.id] || 1}
                                        onChange={(e) =>
                                          handleQuantityChange(
                                            service.id,
                                            Number(e.target.value)
                                          )
                                        }
                                        inputProps={{ min: 1, max: 999 }}
                                        sx={{ width: 100 }}
                                      />
                                      {/* Botón para configurar en modal */}
                                      {service.hasAdditionalFields && (
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          onClick={() => {
                                            const apiService =
                                              servicesData?.find(
                                                (s) =>
                                                  s.id.toString() === service.id
                                              );
                                            if (apiService) {
                                              const quantity =
                                                quantityInputs[service.id] || 1;
                                              openConfigModal(
                                                apiService,
                                                quantity
                                              );
                                            }
                                          }}
                                          startIcon={<InfoOutlined />}
                                          sx={{ flexShrink: 0 }}
                                        >
                                          Agregar información
                                        </Button>
                                      )}

                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          const quantity =
                                            quantityInputs[service.id] || 1;
                                          addServiceWithQuantity(
                                            service.id,
                                            quantity
                                          );
                                        }}
                                        sx={{ flexShrink: 0 }}
                                      >
                                        Agregar
                                      </Button>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() => removeService(service.id)}
                                  >
                                    ✓ Seleccionado - Clic para quitar
                                  </Button>
                                )}
                              </Paper>
                            </Grid2>
                          );
                        })}
                      </Grid2>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid2>
          );
        })}
      </Grid2>
      {/* Información adicional */}
      <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "info.light" }}>
        <Typography variant="body2" color="info.contrastText">
          💡 <strong>Consejos:</strong>
          <br />
          • Puede seleccionar múltiples servicios según sus necesidades
          <br />
          • Los servicios con información adicional se configuran usando
          &quot;Agregar información&quot;
          <br />
          • Use el modal para agregar múltiples instancias con configuraciones
          diferentes
          <br />
          • Puede editar la información adicional de instancias existentes
          usando el ícono de información
          <br />
          • Use las notas para agregar detalles específicos de cada instancia
          <br />• Los precios mostrados son base y pueden variar según la
          configuración final
        </Typography>
      </Paper>
      {/* Modal de configuración de servicios */}
      <Dialog
        open={configModalOpen}
        onClose={closeConfigModal}
        maxWidth="md"
        fullWidth
        fullScreen={isSmallScreen}
        PaperProps={{
          sx: {
            ...(isSmallScreen ? {} : { minHeight: "50vh" }),
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box>
            <Typography variant="h6">
              {configService?.instanceIndex !== undefined
                ? "Editar configuración del servicio"
                : "Configurar servicio"}
            </Typography>
            {configService && (
              <Typography variant="body2" color="text.secondary">
                {configService.service.name} - {configService.service.code}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {configService && (
            <Stack spacing={3}>
              {configInstances.map((instance, index) => (
                <Paper
                  key={instance.instanceId}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle1" color="primary">
                      {configInstances.length > 1
                        ? `Instancia ${index + 1}`
                        : "Información del servicio"}
                    </Typography>
                    {configInstances.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          removeInstanceInModal(instance.instanceId)
                        }
                      >
                        <DeleteOutlined />
                      </IconButton>
                    )}
                  </Box>

                  <Grid2 container spacing={2}>
                    {/* Campo de cantidad */}
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Cantidad"
                        value={instance.quantity}
                        onChange={(e) =>
                          updateInstanceInModal(instance.instanceId, {
                            quantity: Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            ),
                          })
                        }
                        inputProps={{ min: 1, max: 999 }}
                        variant="outlined"
                        size="small"
                      />
                    </Grid2>
                    {/* Campos adicionales del servicio */}
                    {(configService.service.additionalFields || []).map(
                      (field) => {
                        const currentValue = instance.additionalData?.find(
                          (data) => data.fieldId === field.id.toString()
                        )?.value;

                        return (
                          <Grid2 key={field.id} size={{ xs: 12, sm: 6 }}>
                            {renderModalField(
                              field,
                              instance.instanceId,
                              currentValue
                            )}
                          </Grid2>
                        );
                      }
                    )}
                    {/* Campo de notas */}
                    <Grid2 size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notas adicionales (opcional)"
                        value={instance.notes}
                        onChange={(e) =>
                          updateInstanceInModal(instance.instanceId, {
                            notes: e.target.value,
                          })
                        }
                        variant="outlined"
                        size="small"
                        placeholder="Agregue cualquier información adicional relevante..."
                      />
                    </Grid2>
                  </Grid2>
                </Paper>
              ))}

              {/* Botón para agregar más instancias */}
              {configService.instanceIndex === undefined && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    onClick={addInstanceInModal}
                    sx={{ mt: 1 }}
                  >
                    Agregar otra instancia
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeConfigModal} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={saveConfiguredService}
            variant="contained"
            disabled={configInstances.length === 0}
          >
            {configService?.instanceIndex !== undefined
              ? "Guardar cambios"
              : "Agregar servicio"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
