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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

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
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: servicesData, isLoading, error } = useServices();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Solo para servicios sin información adicional
  const [quantityInputs, setQuantityInputs] = useState<Record<string, number>>(
    {}
  );

  // Estados para el modal de configuración
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configService, setConfigService] = useState<{
    service: APIService;
    quantity: number;
    instanceIndex?: number;
    selectedServiceId?: string;
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
          additionalFields: service.additionalFields
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((field) => ({
              id: field.id.toString(),
              name: field.name,
              label: field.label,
              type: field.type,
              required: field.required,
              options: field.options || undefined,
              dependsOnField: field.dependsOnField || undefined,
              dependsOnValue: field.dependsOnValue || undefined,
              displayOrder: field.displayOrder || 0,
            })),
        });
      }
    });

    return Array.from(categoriesMap.values());
  }, [servicesData]);

  // Función para agregar un servicio SIN información adicional (con cantidad)
  const addServiceWithQuantity = useCallback(
    (serviceId: string, quantity: number = 1) => {
      const service = categories
        ?.flatMap((cat) => cat.services)
        ?.find((s) => s.id === serviceId);

      if (!service || service.hasAdditionalFields) return;

      // Use a UI type or let TypeScript infer the type (remove explicit SelectedService)
      const newSelectedService = {
        serviceId:
          typeof service.id === "string" ? Number(service.id) : service.id,
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

  // Función para manejar cambio de cantidad antes de agregar (solo servicios sin info adicional)
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

  // Función para remover una instancia
  const removeInstance = useCallback(
    (serviceId: string, instanceId: string) => {
      const updatedServices =
        (data.selectedServices
          ?.map((selectedService) => {
            // Asegura que ambos sean string para comparar
            if (String(selectedService.serviceId) === String(serviceId)) {
              const newInstances = (selectedService.instances ?? []).filter(
                (inst) => String(inst.instanceId) !== String(instanceId)
              );

              // Si no quedan instancias, remover el servicio completamente
              if (newInstances.length === 0) {
                return null;
              }

              return {
                ...selectedService,
                instances: newInstances,
                totalQuantity: newInstances.length, // Para servicios con info adicional
              };
            }
            return selectedService;
          })
          .filter(Boolean) as SelectedService[]) || [];

      onChange({ selectedServices: updatedServices });
    },
    [data.selectedServices, onChange]
  );

  // Función para actualizar cantidad de una instancia (solo para servicios SIN info adicional)
  const updateInstanceQuantity = useCallback(
    (serviceId: string, instanceId: string, quantity: number) => {
      const service = categories
        ?.flatMap((cat) => cat.services)
        ?.find((s) => s.id === serviceId);

      // Si tiene información adicional, no permitir cambiar cantidad (siempre es 1 por muestra)
      if (service?.hasAdditionalFields) return;

      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === Number(serviceId)) {
            const newInstances = (selectedService.instances ?? []).map(
              (inst) => {
                if (inst.instanceId === instanceId) {
                  return { ...inst, quantity: Math.max(1, quantity) };
                }
                return inst;
              }
            );

            return {
              ...selectedService,
              instances: newInstances,
              totalQuantity: newInstances.reduce(
                (sum, inst) => sum + (inst.quantity ?? 1),
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
  // Función para actualizar datos adicionales (reservada para uso futuro)
  const _updateAdditionalData = useCallback(
    (
      serviceId: string,
      instanceId: string,
      fieldId: string,
      value: string | number | boolean
    ) => {
      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === serviceId) {
            const newInstances = selectedService?.instances?.map((inst) => {
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
  }, []);

  // Verificar si un servicio está seleccionado
  const isServiceSelected = useCallback(
    (serviceId: string) => {
      return (
        data.selectedServices?.some((s) => s.serviceId === serviceId) || false
      );
    },
    [data.selectedServices]
  );
  // Funciones del modal de configuración
  const openConfigModal = useCallback(
    (
      service: APIService,
      quantity: number = 1,
      instanceIndex?: number,
      selectedServiceId?: string // Nuevo parámetro opcional
    ) => {
      // Encontrar el servicio original de la API para tener acceso a la estructura completa
      const originalService = servicesData?.find(
        (s) => s.id.toString() === service.id.toString()
      );
      if (!originalService) {
        console.error("No se encontró el servicio original:", service.id);
        return;
      }

      // Si es para editar una instancia existente
      if (instanceIndex !== undefined) {
        const selectedService = data.selectedServices?.find(
          (s) => s.serviceId === originalService.id.toString()
        );
        if (
          selectedService &&
          (selectedService.instances ?? [])[instanceIndex]
        ) {
          const instance = (selectedService.instances ?? [])[instanceIndex];
          setConfigInstances([{ ...instance }]);
        }
      } else if (selectedServiceId) {
        // Si es para editar todas las muestras de un servicio ya seleccionado
        const selectedService = data.selectedServices?.find(
          (s) => s.serviceId === selectedServiceId
        );
        if (selectedService) {
          // Cargar todas las instancias existentes para editar
          setConfigInstances(
            (selectedService.instances ?? []).map((inst) => ({ ...inst }))
          );
          setConfigService({
            service: originalService,
            quantity,
            instanceIndex: undefined,
            selectedServiceId,
          });
          setConfigModalOpen(true);
          return;
        }
      } else {
        // Nueva configuración - para servicios con info adicional, cada instancia = 1 muestra
        const newInstance: ServiceInstance = {
          instanceId: uuidv4(),
          quantity: 1, // Siempre 1 para servicios con información adicional
          additionalData: (originalService.additionalFields || []).map(
            (field) => ({
              fieldId: field.id.toString(),
              value: "",
            })
          ),
          notes: "",
        };
        setConfigInstances([newInstance]);
      }

      setConfigService({ service: originalService, quantity, instanceIndex });
      setConfigModalOpen(true);
    },
    [data.selectedServices, servicesData]
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
      quantity: 1, // Siempre 1 para servicios con información adicional
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

    const { service, instanceIndex, selectedServiceId } = configService;

    if (instanceIndex !== undefined) {
      // Editando una instancia existente
      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === Number(service.id)) {
            const updatedInstances = [...(selectedService.instances ?? [])];
            updatedInstances[instanceIndex] = configInstances[0];

            return {
              ...selectedService,
              instances: updatedInstances,
              totalQuantity: updatedInstances.length, // Para servicios con info adicional
            };
          }
          return selectedService;
        }) || [];

      onChange({ selectedServices: updatedServices });
    } else if (selectedServiceId) {
      // Agregar una nueva muestra a un servicio ya seleccionado
      const updatedServices =
        data.selectedServices?.map((selectedService) => {
          if (selectedService.serviceId === selectedServiceId) {
            const newInstances = [
              ...(selectedService?.instances ?? []),
              ...configInstances,
            ];
            return {
              ...selectedService,
              instances: newInstances,
              totalQuantity: newInstances.length,
            };
          }
          return selectedService;
        }) || [];
      onChange({ selectedServices: updatedServices });
    } else {
      // Agregando nuevo servicio
      const newSelectedService = {
        serviceId: Number(service.id),
        serviceName: service.name,
        serviceDescription: `${service.code} - ${service.name}`,
        instances: configInstances,
        totalQuantity: configInstances?.length || 0,
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
  ]);
  // Función para verificar si un campo debe ser visible basado en dependencias
  const shouldShowField = useCallback(
    (
      field: { dependsOnField?: string | null; dependsOnValue?: string | null },
      instanceId: string
    ): boolean => {
      if (!field.dependsOnField || !field.dependsOnValue) {
        return true; // Mostrar si no tiene dependencias
      }

      // Buscar la instancia actual en configInstances
      const currentInstance = configInstances.find(
        (inst) => inst.instanceId === instanceId
      );

      if (!currentInstance) {
        return true;
      }

      // Buscar el campo padre por name
      const parentField = configService?.service.additionalFields?.find(
        (f) => f.name === field.dependsOnField
      );

      if (!parentField) {
        return true; // Si no se encuentra el campo padre, mostrar el campo
      }

      // Buscar el valor del campo padre
      const parentFieldValue = currentInstance.additionalData?.find(
        (data) => data.fieldId === parentField.id.toString()
      )?.value;

      // Si no hay valor en el campo padre, no mostrar
      if (
        parentFieldValue === undefined ||
        parentFieldValue === null ||
        parentFieldValue === ""
      ) {
        return false;
      }

      // Normalizar valores para comparación (convertir a string y trim)
      const normalizedParentValue = String(parentFieldValue).trim();
      const normalizedDependsValue = String(field.dependsOnValue).trim();

      // Mostrar el campo solo si el valor del campo padre coincide
      return normalizedParentValue === normalizedDependsValue;
    },
    [configInstances, configService]
  );

  // Renderizar campo en el modal
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
        dependsOnField?: string | null;
        dependsOnValue?: string | null;
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
              slotProps={{ inputLabel: { shrink: true } }}
            />
          );

        default:
          return null;
      }
    },
    [updateInstanceFieldInModal]
  );

  // Definir la función duplicateInstanceInModal en el scope del componente
  const duplicateInstanceInModal = useCallback((instanceId: string) => {
    setConfigInstances((prev) => {
      const instanceToCopy = prev.find(
        (inst) => inst.instanceId === instanceId
      );
      if (!instanceToCopy) return prev;
      const duplicated = {
        ...instanceToCopy,
        instanceId: uuidv4(),
      };
      return [...prev, duplicated];
    });
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          flexDirection: isExtraSmallScreen ? "column" : "row",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" textAlign="center">
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
    <Box sx={{ width: "100%" }}>
      <Typography
        variant={isExtraSmallScreen ? "h6" : "h5"}
        gutterBottom
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        Selección de Servicios
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: { xs: 3, md: 4 } }}
      >
        Seleccione los servicios que necesita. Para servicios con información
        adicional, cada instancia representa una muestra con configuraciones
        específicas.
      </Typography>

      {/* Mostrar errores */}
      {errors.selectedServices && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.selectedServices}
        </Alert>
      )}

      {/* Servicios seleccionados */}
      {data.selectedServices && data.selectedServices.length > 0 && (
        <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
          <Typography
            variant={isExtraSmallScreen ? "subtitle1" : "h6"}
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <LayersOutlined color="primary" />
            <Box component="span">
              Servicios Seleccionados ({data.selectedServices.length})
            </Box>
          </Typography>

          <Stack spacing={2}>
            {data.selectedServices.map((selectedService) => {
              const service = categories
                ?.flatMap((cat) => cat.services)
                ?.find((s) => s.id === selectedService.serviceId);

              return (
                <Accordion key={selectedService.serviceId}>
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
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            wordBreak: "break-word",
                            fontSize: { xs: "0.9rem", md: "1rem" },
                          }}
                        >
                          {selectedService.serviceName}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}
                        >
                          {service?.hasAdditionalFields
                            ? `${selectedService.totalQuantity} muestra(s) • ${selectedService.instances?.length} instancia(s)`
                            : `Total: ${selectedService.totalQuantity} unidades • ${selectedService.instances?.length} instancia(s)`}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeService(String(selectedService.serviceId));
                        }}
                        sx={{
                          "&:hover": {
                            bgcolor: "error.light",
                          },
                        }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid2 container spacing={2}>
                      {selectedService?.instances?.map((instance, index) => (
                        <Grid2 size={{ xs: 12 }} key={instance.instanceId}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 2,
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              <Typography variant="subtitle2">
                                {service?.hasAdditionalFields
                                  ? `Muestra ${index + 1}`
                                  : `Instancia ${index + 1}`}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                }}
                              >
                                {/* Solo mostrar cantidad si NO tiene información adicional */}
                                {!service?.hasAdditionalFields && (
                                  <TextField
                                    type="number"
                                    label="Cantidad"
                                    value={instance.quantity}
                                    onChange={(e) =>
                                      updateInstanceQuantity(
                                        String(selectedService.serviceId),
                                        String(instance.instanceId),
                                        Number(e.target.value)
                                      )
                                    }
                                    size="small"
                                    sx={{ width: { xs: 80, md: 100 } }}
                                    inputProps={{ min: 1 }}
                                  />
                                )}

                                {service?.hasAdditionalFields && (
                                  <Tooltip title="Editar información de la muestra">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        openConfigModal(
                                          service as unknown as APIService,
                                          instance.quantity,
                                          index
                                        )
                                      }
                                    >
                                      <InfoOutlined />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip
                                  title={
                                    service?.hasAdditionalFields
                                      ? "Remover muestra"
                                      : "Remover instancia"
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      removeInstance(
                                        String(selectedService.serviceId),
                                        String(instance.instanceId)
                                      )
                                    }
                                  >
                                    <DeleteOutlined />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>

                            {instance.notes && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  fontSize: { xs: "0.7rem", md: "0.75rem" },
                                }}
                              >
                                Notas: {instance.notes}
                              </Typography>
                            )}
                          </Paper>
                        </Grid2>
                      ))}

                      {service?.hasAdditionalFields && (
                        <Grid2 size={{ xs: 12 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddOutlined />}
                            onClick={() =>
                              openConfigModal(
                                service as unknown as APIService,
                                1,
                                undefined,
                                String(selectedService.serviceId) // Asegura string
                              )
                            }
                            fullWidth
                          >
                            Agregar nueva muestra
                          </Button>
                        </Grid2>
                      )}
                    </Grid2>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Catálogo de servicios */}
      <Typography
        variant={isExtraSmallScreen ? "subtitle1" : "h6"}
        gutterBottom
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        Catálogo de Servicios Disponibles
      </Typography>

      <Grid2 container spacing={{ xs: 2, md: 3 }}>
        {categories?.map((category) => {
          const CategoryIcon =
            CATEGORY_ICONS[category.id] || AssessmentOutlined;
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Grid2 size={{ xs: 12 }} key={category.id}>
              <Card elevation={2}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      cursor: "pointer",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, md: 2 },
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <CategoryIcon color="primary" />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant={isExtraSmallScreen ? "subtitle1" : "h6"}
                          sx={{ wordBreak: "break-word" }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                        >
                          {category.services.length} servicios disponibles
                        </Typography>
                      </Box>
                    </Box>
                    <ExpandMoreOutlined
                      sx={{
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </Box>

                  {isExpanded && (
                    <>
                      <Divider sx={{ mb: 2 }} />
                      <Grid2 container spacing={{ xs: 1, md: 2 }}>
                        {category.services.map((service) => (
                          <Grid2
                            size={{ xs: 12, sm: 6, lg: 4 }}
                            key={service.id}
                          >
                            <Paper
                              variant="outlined"
                              sx={{
                                p: { xs: 1.5, md: 2 },
                                border: isServiceSelected(service.id)
                                  ? "2px solid"
                                  : "1px solid",
                                borderColor: isServiceSelected(service.id)
                                  ? "primary.main"
                                  : "divider",
                                bgcolor: isServiceSelected(service.id)
                                  ? "primary.light"
                                  : "background.paper",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{
                                  fontSize: { xs: "0.9rem", md: "1rem" },
                                  wordBreak: "break-word",
                                }}
                              >
                                {service.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mb: 2,
                                  display: "block",
                                  fontSize: { xs: "0.7rem", md: "0.75rem" },
                                }}
                              >
                                {service.code}
                              </Typography>

                              {service.hasAdditionalFields && (
                                <Chip
                                  label="Requiere información adicional"
                                  size="small"
                                  color="info"
                                  sx={{
                                    mb: 2,
                                    fontSize: { xs: "0.7rem", md: "0.75rem" },
                                    height: { xs: 24, md: 32 },
                                  }}
                                />
                              )}

                              <Box sx={{ mt: "auto", pt: 1 }}>
                                {!isServiceSelected(service.id) && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      flexDirection: service.hasAdditionalFields
                                        ? "column"
                                        : { xs: "column", sm: "row" },
                                    }}
                                  >
                                    {!service.hasAdditionalFields ? (
                                      // Servicios SIN información adicional: mostrar cantidad
                                      <>
                                        <TextField
                                          type="number"
                                          label="Cantidad"
                                          value={
                                            quantityInputs[service.id] || 1
                                          }
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              service.id,
                                              Number(e.target.value)
                                            )
                                          }
                                          size="small"
                                          sx={{
                                            width: { xs: "100%", sm: 100 },
                                            flexShrink: 0,
                                          }}
                                          inputProps={{ min: 1 }}
                                        />
                                        <Button
                                          variant="contained"
                                          size="small"
                                          onClick={() =>
                                            addServiceWithQuantity(
                                              service.id,
                                              quantityInputs[service.id] || 1
                                            )
                                          }
                                          sx={{
                                            width: { xs: "100%", sm: "auto" },
                                            minWidth: { sm: 80 },
                                          }}
                                        >
                                          Agregar
                                        </Button>
                                      </>
                                    ) : (
                                      // Servicios CON información adicional: botón directo
                                      <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddOutlined />}
                                        onClick={() =>
                                          openConfigModal(
                                            service as unknown as APIService,
                                            1
                                          )
                                        }
                                        fullWidth
                                      >
                                        Agregar muestra
                                      </Button>
                                    )}
                                  </Box>
                                )}

                                {isServiceSelected(service.id) && (
                                  <>
                                    <Chip
                                      label="✓ Seleccionado"
                                      color="success"
                                      size="small"
                                      sx={{
                                        fontSize: {
                                          xs: "0.7rem",
                                          md: "0.75rem",
                                        },
                                        height: { xs: 24, md: 32 },
                                        mb: service.hasAdditionalFields ? 1 : 0,
                                      }}
                                    />
                                    {/* Botón para editar muestras, solo si tiene información adicional */}
                                    {service.hasAdditionalFields && (
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() =>
                                          openConfigModal(
                                            service as unknown as APIService,
                                            1,
                                            undefined,
                                            service.id // Pasar el serviceId para editar/agregar muestras
                                          )
                                        }
                                        sx={{
                                          mt: 1,
                                          width: "100%",
                                          color: "#fff",
                                          borderColor: "#ccc",
                                          backgroundColor: "primary.dark",
                                          "&:hover": {
                                            backgroundColor: "primary.main",
                                          },
                                        }}
                                      >
                                        Editar muestras
                                      </Button>
                                    )}
                                  </>
                                )}
                              </Box>
                            </Paper>
                          </Grid2>
                        ))}
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
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2 },
          mt: { xs: 3, md: 3 },
          bgcolor: "info.light",
        }}
      >
        <Typography
          variant="body2"
          color="info.contrastText"
          sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
        >
          💡 <strong>Consejos:</strong>
          <br />
          • Los servicios simples manejan cantidad directamente
          <br />
          • Los servicios con información adicional manejan muestras
          individuales
          <br />
          • Cada muestra puede tener configuraciones específicas
          <br />
          • Use las notas para agregar detalles específicos
          <br />• Puede editar la información de muestras existentes
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
            m: isExtraSmallScreen ? 0 : 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, px: { xs: 2, md: 3 } }}>
          <Box>
            <Typography
              variant={isExtraSmallScreen ? "subtitle1" : "h6"}
              sx={{ wordBreak: "break-word" }}
            >
              {configService?.instanceIndex !== undefined
                ? "Editar información de la muestra"
                : "Configurar información de la muestra"}
            </Typography>
            {configService && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.8rem", md: "0.875rem" },
                  wordBreak: "break-word",
                }}
              >
                {configService.service.name} ({configService.service.code})
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, md: 3 } }}>
          {configService && (
            <Stack spacing={{ xs: 2, md: 3 }}>
              {configInstances.map((instance, index) => (
                <Paper
                  key={instance.instanceId}
                  variant="outlined"
                  sx={{ p: { xs: 1.5, md: 2 } }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                    >
                      Muestra {index + 1}
                      {configInstances.length > 1
                        ? ` de ${configInstances.length}`
                        : ""}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {/* Botón duplicar muestra */}
                      <Tooltip title="Duplicar muestra">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            duplicateInstanceInModal(instance?.instanceId || "")
                          }
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {/* Botón eliminar muestra */}
                      {configInstances.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            removeInstanceInModal(instance?.instanceId || "")
                          }
                        >
                          <DeleteOutlined />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Grid2 container spacing={{ xs: 1, md: 2 }}>
                    {/* No mostrar cantidad para servicios con información adicional */}

                    {(configService.service.additionalFields || [])
                      .sort(
                        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
                      )
                      .map((field, fieldIndex) => {
                        const currentValue = instance.additionalData?.find(
                          (data) => data.fieldId === field.id.toString()
                        )?.value;

                        // Asegurar que instance.instanceId es string
                        const safeInstanceId = instance.instanceId ?? "";

                        if (!shouldShowField(field, safeInstanceId)) {
                          return null;
                        }

                        return (
                          <Grid2
                            size={{ xs: 12, sm: 6 }}
                            key={`${field.id}-${fieldIndex}`}
                          >
                            {renderModalField(
                              field,
                              safeInstanceId,
                              currentValue
                            )}
                          </Grid2>
                        );
                      })}

                    <Grid2 size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Notas adicionales (opcional)"
                        value={instance.notes || ""}
                        onChange={(e) =>
                          updateInstanceInModal(instance.instanceId ?? "", {
                            notes: e.target.value,
                          })
                        }
                        placeholder="Agregue cualquier información adicional relevante..."
                        size="small"
                      />
                    </Grid2>
                  </Grid2>
                  <Button
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    onClick={() =>
                      duplicateInstanceInModal(instance?.instanceId || "")
                    }
                    size={isExtraSmallScreen ? "medium" : "large"}
                    sx={{ margin: "1rem auto", display: "flex", gap: 1 }}
                  >
                    Duplicar Muestra
                  </Button>
                </Paper>
              ))}

              {configService.instanceIndex === undefined && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    onClick={addInstanceInModal}
                    fullWidth
                    size={isExtraSmallScreen ? "medium" : "large"}
                  >
                    Agregar nueva muestra
                  </Button>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 2 }, gap: 1 }}>
          <Button
            onClick={closeConfigModal}
            color="inherit"
            size={isExtraSmallScreen ? "medium" : "large"}
          >
            Cancelar
          </Button>
          <Button
            onClick={saveConfiguredService}
            variant="contained"
            disabled={configInstances.length === 0}
            size={isExtraSmallScreen ? "medium" : "large"}
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
