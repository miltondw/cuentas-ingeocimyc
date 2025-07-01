import React, { useState, useEffect, memo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  useAdminServiceRequest,
  useUpdateServiceRequest,
} from "@/api/hooks/useAdminServiceRequests";
import {
  ServiceRequest,
  AdditionalValue,
  UISelectedService,
  ServiceInstance,
  AdditionalField,
  EditableServiceRequest,
  ServiceItemProps,
} from "@/types/serviceRequests";
import { useAdminServices } from "@/api/hooks/useAdminServices";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";

// Tipos para campos adicionales
const ServiceItem: React.FC<ServiceItemProps> = memo(
  ({
    sel,
    idx,
    onServiceChange,
    onAdditionalValueChange,
    onAddInstance,
    onRemoveInstance,
    onDuplicateInstance,
    onRemoveService,
  }: ServiceItemProps) => {
    // Mostrar todas las instancias si existen, si no, reconstruirlas desde additionalValues
    const hasInstances =
      Array.isArray(sel.serviceInstances) && sel.serviceInstances.length > 0;
    let instances: ServiceInstance[];
    if (hasInstances) {
      instances = sel.serviceInstances ?? [];
    } else if (
      Array.isArray(sel.additionalValues) &&
      sel.additionalValues.some((v: AdditionalValue) =>
        v.fieldName.startsWith("instance_")
      ) &&
      Array.isArray(
        (sel.service as { additionalFields?: AdditionalField[] })
          ?.additionalFields
      ) &&
      ((sel.service as { additionalFields?: AdditionalField[] })
        .additionalFields?.length ?? 0) > 0
    ) {
      // Agrupar additionalValues por instance_N
      const instanceMap: { [instanceKey: string]: AdditionalValue[] } = {};
      sel.additionalValues.forEach((v: AdditionalValue) => {
        const match = v.fieldName.match(/^instance_(\d+)_field_/);
        if (match) {
          const key = match[1];
          if (!instanceMap[key]) instanceMap[key] = [];
          instanceMap[key].push(v);
        }
      });
      // Ordenar por número de instancia
      const sortedKeys = Object.keys(instanceMap).sort(
        (a: string, b: string) => Number(a) - Number(b)
      );
      instances = sortedKeys.map((key: string) => ({
        instanceId: key,
        additionalValues: instanceMap[key],
      }));
      // Si no hay ninguna instancia encontrada, fallback a una sola
      if (instances.length === 0) {
        instances = [
          {
            additionalValues: Array.isArray(sel.additionalValues)
              ? sel.additionalValues
              : [],
          },
        ];
      }
    } else {
      // Fallback: solo una instancia
      instances = [
        {
          additionalValues: Array.isArray(sel.additionalValues)
            ? sel.additionalValues
            : [],
        },
      ];
    }
    return (
      <Paper
        key={sel.id}
        sx={{ p: 2, mb: 2, background: "#f9f9f9", position: "relative" }}
      >
        {/* Botón eliminar servicio */}
        <Button
          size="small"
          color="error"
          variant="outlined"
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={() => onRemoveService(idx)}
        >
          Eliminar servicio
        </Button>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            {sel.service?.name || "Servicio"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({sel.service?.code})
          </Typography>
          <Typography variant="body2" color="primary">
            {sel.service?.category?.name}
          </Typography>
        </Box>
        <Box mt={2} display="flex" gap={2} alignItems="center">
          {/* Si el servicio tiene instancias (muestras), mostrar solo la cantidad de muestras, no editable */}
          {hasInstances && (
            <Typography variant="body2" color="text.secondary">
              {`Cantidad de muestras: ${instances.length}`}
            </Typography>
          )}
          {/* Si NO tiene instancias, permitir editar cantidad */}
          {!hasInstances && (
            <TextField
              label="Cantidad"
              type="number"
              name="quantity"
              value={sel.quantity}
              onChange={(e) =>
                onServiceChange(idx, "quantity", Number(e.target.value))
              }
              size="small"
              sx={{ maxWidth: 120 }}
            />
          )}
        </Box>
        {/* Campos adicionales por instancia */}
        {Array.isArray(sel.service?.additionalFields) &&
          sel.service.additionalFields.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle2" fontWeight="bold">
                Campos adicionales:
              </Typography>
              {instances.map((instance, instanceIdx) => (
                <Box
                  key={instance.instanceId || instanceIdx}
                  sx={{
                    mb: 2,
                    pl: 1,
                    borderLeft:
                      instances.length > 1 ? "2px solid #eee" : undefined,
                  }}
                >
                  {instances.length > 1 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Muestra #{instanceIdx + 1}
                    </Typography>
                  )}
                  {(sel.service?.additionalFields || [])
                    .slice()
                    .sort(
                      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
                    )
                    .map((field) => {
                      const val = Array.isArray(instance.additionalValues)
                        ? instance.additionalValues.find((v) =>
                            v.fieldName.endsWith(`_${field.id}`)
                          )
                        : undefined;
                      // Lógica de dependencias
                      const visible = shouldShowField(
                        field,
                        sel.service?.additionalFields || [],
                        Array.isArray(instance.additionalValues)
                          ? instance.additionalValues
                          : []
                      );
                      if (!visible) {
                        if (val && val.fieldValue !== "") {
                          onAdditionalValueChange(
                            idx,
                            instanceIdx,
                            field.id,
                            ""
                          );
                        }
                        return null;
                      }
                      return renderAdditionalField(
                        field,
                        val?.fieldValue || "",
                        (newValue) =>
                          onAdditionalValueChange(
                            idx,
                            instanceIdx,
                            field.id,
                            newValue
                          )
                      );
                    })}
                  <Box display="flex" gap={1} mt={1}>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onRemoveInstance(idx, instanceIdx)}
                      disabled={instances.length === 1}
                    >
                      Eliminar
                    </Button>
                    <Button
                      size="small"
                      onClick={() => onDuplicateInstance(idx, instanceIdx)}
                    >
                      Duplicar
                    </Button>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() => onAddInstance(idx)}
                sx={{ mt: 1 }}
              >
                Agregar muestra
              </Button>
            </Box>
          )}
      </Paper>
    );
  }
);
ServiceItem.displayName = "ServiceItem";

// Lógica para dependencias entre campos adicionales
function shouldShowField(
  field: AdditionalField & {
    dependsOnField?: string | null;
    dependsOnValue?: string | null;
  },
  allFields: (AdditionalField & { id: number })[],
  additionalValues: AdditionalValue[]
) {
  if (!field.dependsOnField || !field.dependsOnValue) return true;
  // Buscar el valor del campo padre
  const parentField = allFields.find(
    (f) => f.fieldName === field.dependsOnField
  );
  if (!parentField) return true;
  const parentValue = additionalValues.find((v) =>
    v.fieldName.endsWith(`_${parentField.id}`)
  )?.fieldValue;
  return parentValue === field.dependsOnValue;
}

// Utilidad para renumerar los fieldName de todas las instancias
function renumberInstanceFieldNames(
  instances: ServiceInstance[],
  _additionalFields: AdditionalField[]
) {
  return instances.map((inst, idx) => ({
    ...inst,
    additionalValues: (inst.additionalValues || []).map((v) => {
      const fieldIdMatch = v.fieldName.match(/field_(\d+)$/);
      const fieldId = fieldIdMatch ? fieldIdMatch[1] : null;
      if (!fieldId) return v;
      return {
        ...v,
        fieldName: `instance_${idx + 1}_field_${fieldId}`,
      };
    }),
  }));
}

// Utilidad para renderizar campos adicionales tipo ServiceSelectionForm
function renderAdditionalField(
  field: AdditionalField & {
    type?: string;
    options?: string[];
    required?: boolean;
    dependsOnField?: string | null;
    dependsOnValue?: string | null;
  },
  value: string,
  onChange: (val: string) => void
) {
  // Usa el tipo real si está disponible
  const type = field.type || "text";
  if (type === "date") {
    return (
      <TextField
        key={field.id}
        label={field.label}
        name={field.fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{ mt: 1, mr: 2, minWidth: 200 }}
        type="date"
        InputLabelProps={{ shrink: true }}
        required={field.required}
      />
    );
  }
  if (type === "number") {
    return (
      <TextField
        key={field.id}
        label={field.label}
        name={field.fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{ mt: 1, mr: 2, minWidth: 200 }}
        type="number"
        required={field.required}
      />
    );
  }
  if (type === "select" && Array.isArray(field.options)) {
    return (
      <TextField
        key={field.id}
        select
        label={field.label}
        name={field.fieldName}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        sx={{ mt: 1, mr: 2, minWidth: 200 }}
        required={field.required}
      >
        {field.options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
    );
  }
  // Por defecto: texto
  return (
    <TextField
      key={field.id}
      label={field.label}
      name={field.fieldName}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      sx={{ mt: 1, mr: 2, minWidth: 200 }}
      type="text"
      required={field.required}
    />
  );
}

// Memoizado para reconstruir instancias desde additionalValues al cargar del backend
function buildServiceInstancesFromAdditionalValues(
  sel: UISelectedService
): ServiceInstance[] {
  if (!Array.isArray(sel.additionalValues) || sel.additionalValues.length === 0)
    return [];
  // Si los fieldName tienen el formato instance_N_field_X, agrupar por N
  const instanceMap: { [instanceKey: string]: AdditionalValue[] } = {};
  let hasInstanceFormat = false;
  sel.additionalValues.forEach((v: AdditionalValue) => {
    const match = v.fieldName.match(/^instance_(\d+)_field_/);
    if (match) {
      hasInstanceFormat = true;
      const key = match[1];
      if (!instanceMap[key]) instanceMap[key] = [];
      instanceMap[key].push(v);
    }
  });
  if (hasInstanceFormat && Object.keys(instanceMap).length > 0) {
    // Hay varias muestras
    const sortedKeys = Object.keys(instanceMap).sort(
      (a: string, b: string) => Number(a) - Number(b)
    );
    return sortedKeys.map((key: string) => ({
      instanceId: key,
      additionalValues: instanceMap[key],
    }));
  } else {
    // Solo una muestra (o formato plano)
    return [
      {
        instanceId: "1",
        additionalValues: sel.additionalValues,
      },
    ];
  }
}

// --- CORRECCIONES DE TIPADO Y ACCESO SEGURO ---

// 1. Asegurar que el mapeo de servicios desde la API produce un UISelectedService válido
// 2. Proteger el acceso a serviceToAdd.additionalFields
// 3. Tipar correctamente los callbacks y evitar any
// 4. Eliminar referencias a updated_at y funciones/utilidades no usadas
// 5. Evitar non-null assertions

const ServiceRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: serviceRequest, isLoading: loadingRequest } =
    useAdminServiceRequest(Number(id));
  const updateMutation = useUpdateServiceRequest();
  const { data: allServices, isLoading: loadingServices } = useAdminServices();
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [serviceToAdd, setServiceToAdd] = useState<
    | (UISelectedService["service"] & { additionalFields?: AdditionalField[] })
    | null
  >(null);
  const [addQuantity, setAddQuantity] = useState(1);
  const [addInstances, setAddInstances] = useState<ServiceInstance[]>([]);

  // Estado separado para datos principales y servicios
  const [mainData, setMainData] = useState<Omit<
    EditableServiceRequest,
    "selectedServices"
  > | null>(null);
  const [selectedServices, setSelectedServices] = useState<UISelectedService[]>(
    []
  );
  const selectedServicesRef = useRef<UISelectedService[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (serviceRequest && allServices) {
      // Separa los datos principales y los servicios
      const { selectedServices: ss, ...main } =
        serviceRequest as ServiceRequest;
      setMainData(main);
      setSelectedServices(
        ss
          ? ss.map((sel) => {
              // Buscar el servicio completo en el catálogo para obtener los additionalFields
              const fullService = allServices.find(
                (s: { id: number }) =>
                  s.id === (sel.service?.id || sel.serviceId)
              );
              // Si el servicio tiene additionalValues, reconstruir serviceInstances
              let serviceInstances: ServiceInstance[] = [];
              if (
                Array.isArray(sel.additionalValues) &&
                sel.additionalValues.length > 0
              ) {
                serviceInstances = buildServiceInstancesFromAdditionalValues({
                  ...sel,
                  service: {
                    ...sel.service,
                    ...(fullService
                      ? { additionalFields: fullService.additionalFields }
                      : {}),
                  },
                } as UISelectedService);
              }
              // Retornar un UISelectedService robusto
              return {
                id: sel.id,
                quantity: sel.quantity,
                service: {
                  ...sel.service,
                  ...(fullService
                    ? { additionalFields: fullService.additionalFields }
                    : {}),
                },
                additionalValues: sel.additionalValues,
                serviceInstances,
                created_at: sel.created_at ?? "",
                requestId: sel.requestId ?? 0,
                serviceId: sel.serviceId ?? sel.service?.id ?? 0,
              } as UISelectedService;
            })
          : []
      );
    }
  }, [serviceRequest, allServices]);

  useEffect(() => {
    selectedServicesRef.current = selectedServices;
  }, [selectedServices]);

  // Abrir modal para añadir servicio
  const handleOpenAddService = () => {
    setServiceToAdd(null);
    setAddQuantity(1);
    setAddInstances([]);
    setAddServiceOpen(true);
  };
  const handleCloseAddService = () => {
    setAddServiceOpen(false);
    setServiceToAdd(null);
    setAddQuantity(1);
    setAddInstances([]);
  };

  // Cuando seleccionas un servicio en el modal
  const handleSelectService = (
    service:
      | (UISelectedService["service"] & {
          additionalFields?: AdditionalField[];
        })
      | null
  ) => {
    setServiceToAdd(service);
    if (
      service?.additionalFields?.length &&
      service.additionalFields.length > 0
    ) {
      // Inicializar una muestra vacía
      setAddInstances([
        {
          instanceId: `${Date.now()}_${Math.random()}`,
          additionalValues: service.additionalFields.map((f) => ({
            fieldName: `instance_1_field_${f.id}`,
            fieldValue: "",
          })),
        },
      ]);
    } else {
      setAddQuantity(1);
      setAddInstances([]);
    }
  };

  // Guardar el nuevo servicio
  const handleAddService = () => {
    if (!serviceToAdd) return;
    setSelectedServices((prev) => [
      ...prev,
      {
        id: Date.now(),
        quantity:
          Array.isArray(serviceToAdd.additionalFields) &&
          serviceToAdd.additionalFields.length > 0
            ? addInstances.length
            : addQuantity,
        service: serviceToAdd,
        additionalValues:
          Array.isArray(serviceToAdd.additionalFields) &&
          serviceToAdd.additionalFields.length > 0
            ? []
            : [],
        serviceInstances:
          Array.isArray(serviceToAdd.additionalFields) &&
          serviceToAdd.additionalFields.length > 0
            ? addInstances
            : [],
        created_at: "",
        requestId: 0,
        serviceId: serviceToAdd.id ?? 0,
      } as UISelectedService,
    ]);
    handleCloseAddService();
  };

  // Mover buildPayload fuera del handler para evitar redefiniciones
  function buildPayload(
    mainData: Omit<EditableServiceRequest, "selectedServices">,
    selectedServices: UISelectedService[]
  ) {
    return {
      ...mainData,
      selectedServices: selectedServices.map((s: UISelectedService) => ({
        serviceId: s.service?.id || s.serviceId,
        quantity: s.quantity,
        additionalValues:
          Array.isArray(s.serviceInstances) && s.serviceInstances.length > 0
            ? s.serviceInstances.flatMap((inst: ServiceInstance) =>
                Array.isArray(inst.additionalValues)
                  ? inst.additionalValues.map((v: AdditionalValue) => ({
                      fieldName: v.fieldName,
                      fieldValue: v.fieldValue,
                    }))
                  : []
              )
            : Array.isArray(s.additionalValues)
            ? s.additionalValues.map((v: AdditionalValue) => ({
                fieldName: v.fieldName,
                fieldValue: v.fieldValue,
              }))
            : [],
      })),
    };
  }

  if (loadingRequest) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!serviceRequest || !mainData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Typography variant="h6">
          Solicitud de servicio no encontrada
        </Typography>
      </Box>
    );
  }

  // Handler para datos principales
  const handleMainChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMainData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  // Optimización: handlers eficientes para servicios
  const handleServiceChange = (
    idx: number,
    key: keyof UISelectedService,
    value: unknown
  ) => {
    setSelectedServices((prev: UISelectedService[]) =>
      prev.map((s: UISelectedService, i: number) =>
        i === idx ? { ...s, [key]: value } : s
      )
    );
  };

  // Handler para campos adicionales
  const handleAdditionalValueChange = (
    idx: number,
    instanceIdx: number,
    fieldId: number,
    value: string
  ) => {
    setSelectedServices((prev: UISelectedService[]) =>
      prev.map((s: UISelectedService, i: number) => {
        if (i !== idx) return s;
        // Determinar si hay instancias
        let newInstances: ServiceInstance[] = [];
        if (s.serviceInstances && s.serviceInstances.length > 0) {
          newInstances = s.serviceInstances.map(
            (inst: ServiceInstance, j: number) => {
              if (j !== instanceIdx) return inst;
              // Actualizar el campo en la instancia correspondiente
              const fieldName = `instance_${instanceIdx + 1}_field_${fieldId}`;
              let newAdditionalValues = Array.isArray(inst.additionalValues)
                ? [...inst.additionalValues]
                : [];
              const index = newAdditionalValues.findIndex(
                (v: AdditionalValue) => v.fieldName === fieldName
              );
              if (index >= 0) {
                newAdditionalValues[index] = {
                  ...newAdditionalValues[index],
                  fieldValue: value,
                };
              } else {
                newAdditionalValues.push({
                  fieldName,
                  fieldValue: value,
                } as AdditionalValue);
              }
              return { ...inst, additionalValues: newAdditionalValues };
            }
          );
          return { ...s, serviceInstances: newInstances };
        } else {
          // Si no hay instancias, usar additionalValues plano (solo una muestra)
          const fieldName = `instance_1_field_${fieldId}`;
          let newAdditionalValues = Array.isArray(s.additionalValues)
            ? [...s.additionalValues]
            : [];
          const index = newAdditionalValues.findIndex(
            (v: AdditionalValue) => v.fieldName === fieldName
          );
          if (index >= 0) {
            newAdditionalValues[index] = {
              ...newAdditionalValues[index],
              fieldValue: value,
            };
          } else {
            newAdditionalValues.push({
              fieldName,
              fieldValue: value,
            } as AdditionalValue);
          }
          return { ...s, additionalValues: newAdditionalValues };
        }
      })
    );
  };

  // Handlers para instancias (muestras)
  const handleAddInstance = (serviceIdx: number) => {
    setSelectedServices((prev) =>
      prev.map((s, i) => {
        if (i !== serviceIdx) return s;
        const additionalFields = s.service?.additionalFields || [];
        let newInstances: ServiceInstance[] = [];
        if (
          (!s.serviceInstances || s.serviceInstances.length === 0) &&
          Array.isArray(s.additionalValues) &&
          s.additionalValues.some((v) => v.fieldName.startsWith("instance_"))
        ) {
          const instanceMap: { [instanceKey: string]: AdditionalValue[] } = {};
          s.additionalValues.forEach((v) => {
            const match = v.fieldName.match(/^instance_(\d+)_field_/);
            if (match) {
              const key = match[1];
              if (!instanceMap[key]) instanceMap[key] = [];
              instanceMap[key].push(v);
            }
          });
          const sortedKeys = Object.keys(instanceMap).sort(
            (a, b) => Number(a) - Number(b)
          );
          newInstances = sortedKeys.map((key) => ({
            instanceId: key,
            additionalValues: instanceMap[key],
          }));
        } else {
          newInstances = s.serviceInstances ? [...s.serviceInstances] : [];
        }
        // Agregar la nueva instancia vacía
        const newInstance: ServiceInstance = {
          instanceId: `${Date.now()}_${Math.random()}`,
          additionalValues: additionalFields.map((f) => ({
            fieldName: `instance_${newInstances.length + 1}_field_${f.id}`,
            fieldValue: "",
          })),
        };
        newInstances.push(newInstance);
        // Renumerar fieldNames
        newInstances = renumberInstanceFieldNames(
          newInstances,
          additionalFields
        );
        return {
          ...s,
          serviceInstances: newInstances,
          additionalValues: [],
        };
      })
    );
  };
  const handleRemoveInstance = (serviceIdx: number, instanceIdx: number) => {
    setSelectedServices((prev) =>
      prev.map((s, i) => {
        if (i !== serviceIdx) return s;
        const additionalFields = s.service?.additionalFields || [];
        let newInstances: ServiceInstance[] = [];
        if (
          (!s.serviceInstances || s.serviceInstances.length === 0) &&
          Array.isArray(s.additionalValues) &&
          s.additionalValues.some((v) => v.fieldName.startsWith("instance_"))
        ) {
          const instanceMap: { [instanceKey: string]: AdditionalValue[] } = {};
          s.additionalValues.forEach((v) => {
            const match = v.fieldName.match(/^instance_(\d+)_field_/);
            if (match) {
              const key = match[1];
              if (!instanceMap[key]) instanceMap[key] = [];
              instanceMap[key].push(v);
            }
          });
          const sortedKeys = Object.keys(instanceMap).sort(
            (a, b) => Number(a) - Number(b)
          );
          newInstances = sortedKeys.map((key) => ({
            instanceId: key,
            additionalValues: instanceMap[key],
          }));
        } else {
          newInstances = s.serviceInstances ? [...s.serviceInstances] : [];
        }
        // Eliminar la instancia
        newInstances = newInstances.filter((_, j) => j !== instanceIdx);
        // Renumerar fieldNames
        newInstances = renumberInstanceFieldNames(
          newInstances,
          additionalFields
        );
        return {
          ...s,
          serviceInstances: newInstances,
          additionalValues: [],
        };
      })
    );
  };
  const handleDuplicateInstance = (serviceIdx: number, instanceIdx: number) => {
    setSelectedServices((prev) =>
      prev.map((s, i) => {
        if (i !== serviceIdx) return s;
        const additionalFields = s.service?.additionalFields || [];
        let newInstances: ServiceInstance[] = [];
        if (
          (!s.serviceInstances || s.serviceInstances.length === 0) &&
          Array.isArray(s.additionalValues) &&
          s.additionalValues.some((v) => v.fieldName.startsWith("instance_"))
        ) {
          const instanceMap: { [instanceKey: string]: AdditionalValue[] } = {};
          s.additionalValues.forEach((v) => {
            const match = v.fieldName.match(/^instance_(\d+)_field_/);
            if (match) {
              const key = match[1];
              if (!instanceMap[key]) instanceMap[key] = [];
              instanceMap[key].push(v);
            }
          });
          const sortedKeys = Object.keys(instanceMap).sort(
            (a, b) => Number(a) - Number(b)
          );
          newInstances = sortedKeys.map((key) => ({
            instanceId: key,
            additionalValues: instanceMap[key],
          }));
        } else {
          newInstances = s.serviceInstances ? [...s.serviceInstances] : [];
        }
        // Duplicar la instancia
        const instanceToCopy = newInstances[instanceIdx];
        if (!instanceToCopy) return s;
        const duplicated = {
          ...instanceToCopy,
          instanceId: `${Date.now()}_${Math.random()}`,
          additionalValues: instanceToCopy?.additionalValues?.map((v) => ({
            ...v,
            // El fieldName se renumerará después
          })),
        };
        newInstances.push(duplicated);
        // Renumerar fieldNames
        newInstances = renumberInstanceFieldNames(
          newInstances,
          additionalFields
        );
        return {
          ...s,
          serviceInstances: newInstances,
          additionalValues: [],
        };
      })
    );
  };

  // Handler para eliminar un servicio completo
  const handleRemoveService = (serviceIdx: number) => {
    setSelectedServices((prev) => prev.filter((_, i) => i !== serviceIdx));
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <Paper sx={{ p: 4, minWidth: 400 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Detalles de la Solicitud de Servicio
        </Typography>
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Nombre"
            name="name"
            value={mainData.name || ""}
            onChange={handleMainChange}
            fullWidth
          />
          <TextField
            label="Proyecto"
            name="nameProject"
            value={mainData.nameProject || ""}
            onChange={handleMainChange}
            fullWidth
          />
          <TextField
            label="Ubicación"
            name="location"
            value={mainData.location || ""}
            onChange={handleMainChange}
            fullWidth
          />
          <TextField
            label="Identificación"
            name="identification"
            value={mainData.identification || ""}
            onChange={handleMainChange}
            fullWidth
          />
          <TextField
            label="Teléfono"
            name="phone"
            value={mainData.phone || ""}
            onChange={handleMainChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={mainData.email || ""}
            onChange={handleMainChange}
            fullWidth
          />
          <TextField
            label="Descripción"
            name="description"
            value={mainData.description || ""}
            onChange={handleMainChange}
            fullWidth
            multiline
            minRows={2}
          />
          {/* Servicios solicitados */}
          <Box mt={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Servicios Solicitados
            </Typography>
            {selectedServices && selectedServices.length > 0 ? (
              selectedServices.map((sel, idx) => (
                <ServiceItem
                  key={sel.id}
                  sel={sel}
                  idx={idx}
                  onServiceChange={handleServiceChange}
                  onAdditionalValueChange={handleAdditionalValueChange}
                  onAddInstance={handleAddInstance}
                  onRemoveInstance={handleRemoveInstance}
                  onDuplicateInstance={handleDuplicateInstance}
                  onRemoveService={handleRemoveService}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay servicios asociados a esta solicitud.
              </Typography>
            )}
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleOpenAddService}
            >
              Añadir servicio
            </Button>
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (!mainData) return;
                // Eliminar los campos prohibidos del payload
                const {
                  id: _id,
                  status: _status,
                  created_at: _created_at,
                  updatedAt: _updatedAt,
                  ...mainFields
                } = mainData;
                // Para el tipado, creamos un objeto dummy pero eliminamos los campos antes de enviar
                const mainFieldsWithFake: Omit<
                  EditableServiceRequest,
                  "selectedServices"
                > = {
                  id: 0,
                  status: "pendiente",
                  created_at: "",
                  updatedAt: "",
                  ...mainFields,
                };
                let payload = buildPayload(
                  mainFieldsWithFake,
                  selectedServices
                );
                // Eliminar los campos prohibidos del payload antes de enviarlo
                const {
                  id: __id,
                  status: __status,
                  created_at: __created_at,
                  updatedAt: __updatedAt,
                  ...payloadToSend
                } = payload;
                updateMutation
                  .mutateAsync({ id: mainData.id, data: payloadToSend })
                  .then(() => setSuccess(true));
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
          </Box>
        </Box>
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            Cambios guardados correctamente
          </Alert>
        </Snackbar>
        <Dialog
          open={addServiceOpen}
          onClose={handleCloseAddService}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Agregar nuevo servicio</DialogTitle>
          <DialogContent>
            {loadingServices ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={100}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                <Autocomplete
                  options={allServices || []}
                  getOptionLabel={(
                    option: UISelectedService["service"] & {
                      additionalFields?: AdditionalField[];
                    }
                  ) => `${option.name} (${option.code})`}
                  value={serviceToAdd}
                  onChange={(_, value) => handleSelectService(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Servicio" />
                  )}
                  isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                />
                {serviceToAdd &&
                Array.isArray(serviceToAdd.additionalFields) &&
                serviceToAdd.additionalFields.length > 0 ? (
                  <>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Muestras
                    </Typography>
                    {addInstances.map((instance, idx) => (
                      <Paper
                        key={instance.instanceId || idx}
                        sx={{ p: 2, mb: 1 }}
                      >
                        <Typography variant="caption">
                          Muestra #{idx + 1}
                        </Typography>
                        <Box mb={2}>
                          {Array.isArray(serviceToAdd.additionalFields)
                            ? serviceToAdd.additionalFields.map((field) => {
                                const val = instance?.additionalValues?.find(
                                  (v) => v.fieldName.endsWith(`_${field.id}`)
                                );
                                return renderAdditionalField(
                                  field,
                                  val?.fieldValue || "",
                                  (newValue) => {
                                    setAddInstances((prev) =>
                                      prev.map((inst, j) =>
                                        j === idx
                                          ? {
                                              ...inst,
                                              additionalValues:
                                                inst?.additionalValues?.map(
                                                  (v) =>
                                                    v.fieldName.endsWith(
                                                      `_${field.id}`
                                                    )
                                                      ? {
                                                          ...v,
                                                          fieldValue: newValue,
                                                        }
                                                      : v
                                                ),
                                            }
                                          : inst
                                      )
                                    );
                                  }
                                );
                              })
                            : null}
                        </Box>
                      </Paper>
                    ))}
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        onClick={() =>
                          setAddInstances((prev) => [
                            ...prev,
                            {
                              instanceId: `${Date.now()}_${Math.random()}`,
                              additionalValues: Array.isArray(
                                serviceToAdd.additionalFields
                              )
                                ? serviceToAdd.additionalFields.map((f) => ({
                                    fieldName: `instance_${
                                      addInstances.length + 1
                                    }_field_${f.id}`,
                                    fieldValue: "",
                                  }))
                                : [],
                            },
                          ])
                        }
                      >
                        Agregar muestra
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={addInstances.length === 1}
                        onClick={() =>
                          setAddInstances((prev) => prev.slice(0, -1))
                        }
                      >
                        Eliminar última
                      </Button>
                    </Box>
                  </>
                ) : serviceToAdd ? (
                  <TextField
                    label="Cantidad"
                    type="number"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(Number(e.target.value))}
                    size="small"
                    sx={{ maxWidth: 120 }}
                  />
                ) : null}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddService}>Cancelar</Button>
            <Button
              onClick={handleAddService}
              variant="contained"
              disabled={
                !serviceToAdd ||
                (Array.isArray(serviceToAdd.additionalFields) &&
                  serviceToAdd.additionalFields.length > 0 &&
                  addInstances.length === 0)
              }
            >
              Agregar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ServiceRequestDetailPage;
