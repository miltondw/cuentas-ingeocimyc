import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useServiceRequest } from "../hooks/useServiceRequest";

interface AdditionalInfo {
  [key: string]: string | number | boolean | string[] | undefined | null;
}

interface FieldInfo {
  field: string;
  label: string;
  dependsOnField?: string;
  dependsOnValue?: string | number | boolean;
  type?: string;
}

interface ServiceInstance {
  id: string;
  additionalInfo?: AdditionalInfo;
}

interface ServiceItem {
  id: number;
  code: string;
  name: string;
  additionalInfo?: FieldInfo[];
}

export interface SelectedService {
  id: string;
  item: ServiceItem;
  category?: string;
  quantity?: number;
  instances: ServiceInstance[];
}

const ServiceReview: React.FC = () => {
  const { state, removeSelectedService, updateAdditionalInfo } =
    useServiceRequest();
  const navigate = useNavigate();
  const { formData, selectedServices, error, loading } = state;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    serviceId: string;
    instanceId?: string;
    serviceName?: string;
  } | null>(null);
  const headerCellStyle = useMemo(
    () => ({
      fontWeight: "bold",
      textAlign: "center" as const,
      whiteSpace: "nowrap" as const,
      padding: "10px 16px",
      backgroundColor: "#f5f5f5",
      borderBottom: "2px solid rgba(224, 224, 224, 1)",
    }),
    []
  );

  const bodyCellStyle = useMemo(
    () => ({
      textAlign: "center" as const,
      whiteSpace: "nowrap" as const,
      padding: "10px 16px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "250px",
    }),
    []
  );
  const fieldLabels: { [key: string]: string } = useMemo(
    () => ({
      name: "Solicitante",
      nameProject: "Nombre del proyecto",
      location: "Ubicación",
      identification: "Identificación",
      phone: "Teléfono",
      email: "Correo electrónico",
      description: "Descripción del servicio",
      status: "Estado",
      // Etiquetas para campos adicionales
      tipoMuestra: "Tipo de Muestra",
      tamanoCilindro: "Tamaño del Cilindro",
      resistenciaCompresion: "Resistencia a Compresión",
      elementoFundido: "Elemento Fundido",
      resistenciaDiseno: "Resistencia de Diseño",
      identificacionMuestra: "Identificación de Muestra",
      estructuraRealizada: "Estructura Realizada",
      fechaFundida: "Fecha Fundida",
      edadEnsayo: "Edad de Ensayo",
    }),
    []
  );

  const servicesWithoutAdditionalInfo = useMemo(
    () =>
      selectedServices.filter(
        (service) =>
          !service.instances.some(
            (instance) =>
              instance.additionalInfo &&
              Object.keys(instance.additionalInfo).length > 0
          )
      ),
    [selectedServices]
  );

  const servicesWithAdditionalInfo = useMemo(
    () =>
      selectedServices.filter((service) =>
        service.instances.some(
          (instance) =>
            instance.additionalInfo &&
            Object.keys(instance.additionalInfo).length > 0
        )
      ),
    [selectedServices]
  );

  const handleEditService = useCallback(
    (
      serviceId: string,
      category: string,
      instanceId: string,
      additionalInfo: AdditionalInfo
    ) => {
      const service = selectedServices.find((s) => s.id === serviceId);
      if (!service?.item.id) return;
      navigate("/cliente", {
        state: {
          step: 1,
          editServiceId: serviceId,
          editInstanceId: instanceId,
          editCategory: category,
          editAdditionalInfo: { ...additionalInfo },
          serviceItemId: service.item.id,
        },
      });
    },
    [navigate, selectedServices]
  );

  const handleOpenDeleteDialog = useCallback(
    (serviceId: string, instanceId?: string, serviceName?: string) => {
      setDeleteTarget({ serviceId, instanceId, serviceName });
      setDeleteDialogOpen(true);
    },
    []
  );

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteTarget(null);
    setDeleteDialogOpen(false);
  }, []);
  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const { serviceId, instanceId } = deleteTarget;
    if (instanceId) {
      const service = selectedServices.find((s) => s.id === serviceId);
      if (service) {
        const updatedInstances = service.instances.filter(
          (instance) => instance.id !== instanceId
        );
        if (updatedInstances.length > 0) {
          // Ensure all instances have valid additionalInfo objects without null/undefined values
          const validUpdatedInstances = updatedInstances.map((instance) => {
            const rawAdditionalInfo = instance.additionalInfo || {};
            // Filter out null and undefined values to match Record<string, string | number | boolean | string[]>
            const cleanedAdditionalInfo: Record<
              string,
              string | number | boolean | string[]
            > = {};

            Object.entries(rawAdditionalInfo).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                cleanedAdditionalInfo[key] = value as
                  | string
                  | number
                  | boolean
                  | string[];
              }
            });

            return {
              id: instance.id,
              additionalInfo: cleanedAdditionalInfo,
            };
          });
          updateAdditionalInfo(
            serviceId,
            instanceId,
            {},
            validUpdatedInstances
          );
        } else {
          removeSelectedService(serviceId);
        }
      }
    } else {
      removeSelectedService(serviceId);
    }
    handleCloseDeleteDialog();
  }, [
    deleteTarget,
    removeSelectedService,
    updateAdditionalInfo,
    selectedServices,
    handleCloseDeleteDialog,
  ]);
  const formatAdditionalInfoValue = useCallback(
    (
      value: string | number | boolean | string[] | undefined | null | object
    ): string => {
      // Handle undefined, null, or empty values
      if (value === undefined || value === null || value === "") return "N/A";

      // Handle arrays - check if array and handle empty arrays
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "N/A";
      }

      // Handle empty strings with whitespace
      if (typeof value === "string") {
        return value.trim() === "" ? "N/A" : value.trim();
      }

      // Handle invalid numbers
      if (typeof value === "number") {
        return isNaN(value) ? "N/A" : String(value);
      }

      // Handle empty objects
      if (typeof value === "object") {
        return Object.keys(value || {}).length === 0
          ? "N/A"
          : JSON.stringify(value);
      }

      // Convert any other value to string
      return String(value);
    },
    []
  );
  const clientInfoTable = useMemo(
    () => (
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxWidth: "100%",
          border: "1px solid rgba(224, 224, 224, 1)",
        }}
      >
        <Table aria-label="Información del cliente">
          <TableBody>
            {Object.entries(formData).map(([field, value]) => (
              <TableRow key={field}>
                <TableCell
                  sx={{ textTransform: "uppercase", ...bodyCellStyle }}
                >
                  {fieldLabels[field] || field}
                </TableCell>
                <TableCell sx={bodyCellStyle}>
                  {formatAdditionalInfoValue(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [formData, fieldLabels, bodyCellStyle, formatAdditionalInfoValue]
  );
  const noAdditionalInfoTable = useMemo(
    () =>
      servicesWithoutAdditionalInfo.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{
            overflow: "auto",
            maxWidth: "100%",
            border: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          <Table aria-label="Servicios sin información adicional">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellStyle}>CÓDIGO</TableCell>
                <TableCell sx={headerCellStyle}>NOMBRE</TableCell>
                <TableCell sx={headerCellStyle}>CATEGORÍA</TableCell>
                <TableCell sx={headerCellStyle}>CANTIDAD</TableCell>
                <TableCell sx={headerCellStyle}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicesWithoutAdditionalInfo.map((serviceInstance) => (
                <TableRow key={serviceInstance.id}>
                  <TableCell sx={bodyCellStyle}>
                    {formatAdditionalInfoValue(serviceInstance.item.code)}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {formatAdditionalInfoValue(serviceInstance.item.name)}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {formatAdditionalInfoValue(serviceInstance.category)}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {formatAdditionalInfoValue(serviceInstance.quantity)}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      disabled={loading}
                      onClick={() =>
                        handleEditService(
                          serviceInstance.id,
                          serviceInstance.category || "",
                          serviceInstance.instances[0]?.id || "",
                          {}
                        )
                      }
                      sx={{ mr: 1 }}
                      aria-label={`Editar servicio ${serviceInstance.item.name}`}
                    >
                      Editar
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={loading}
                      onClick={() =>
                        handleOpenDeleteDialog(
                          serviceInstance.id,
                          undefined,
                          serviceInstance.item.name
                        )
                      }
                      aria-label={`Eliminar servicio ${serviceInstance.item.name}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" sx={{ mt: 2, textAlign: "center" }}>
          No hay servicios sin información adicional.
        </Typography>
      ),
    [
      servicesWithoutAdditionalInfo,
      handleEditService,
      handleOpenDeleteDialog,
      loading,
      headerCellStyle,
      bodyCellStyle,
      formatAdditionalInfoValue,
    ]
  ); // Esta sección anteriormente contenía la definición de shouldShowField y getOrderedFields,
  // pero ahora usamos un enfoque más directo con finalFieldList

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", textTransform: "uppercase" }}
      >
        Revisar Solicitud de Servicio
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
        Información del Cliente
      </Typography>
      {clientInfoTable}
      <Button
        variant="outlined"
        disabled={loading}
        onClick={() => navigate("/cliente", { state: { step: 0 } })}
        sx={{ mt: 2, mb: 3 }}
        startIcon={<EditIcon />}
        aria-label="Editar información del cliente"
      >
        Editar Información
      </Button>
      {servicesWithoutAdditionalInfo.length > 0 && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mt: 3, textAlign: "center" }}
          >
            Servicios sin Información Adicional
          </Typography>
          {noAdditionalInfoTable}
        </>
      )}
      {servicesWithAdditionalInfo.length > 0 && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mt: 3, textAlign: "center" }}
          >
            Servicios con Información Adicional
          </Typography>
          {servicesWithAdditionalInfo.map((serviceInstance) => {
            const validInstances = serviceInstance.instances.filter(
              (instance) =>
                instance.additionalInfo &&
                Object.keys(instance.additionalInfo).length > 0
            );
            if (validInstances.length === 0) return null; // Usamos un enfoque directo para definir los campos que queremos mostrar
            const fixedFields = [
              "tipoMuestra",
              "tamanoCilindro",
              "resistenciaCompresion",
              "elementoFundido",
              "resistenciaDiseno",
              "identificacionMuestra",
            ];

            // Recopilamos todos los campos disponibles en todas las instancias
            const allAdditionalInfoFields = new Set<string>();
            validInstances.forEach((instance) => {
              if (instance.additionalInfo) {
                Object.keys(instance.additionalInfo).forEach((key) => {
                  allAdditionalInfoFields.add(key);
                });
              }
            });

            // Aseguramos que los campos importantes siempre estén presentes en el orden correcto
            const finalFieldList = [
              ...fixedFields.filter((field) =>
                allAdditionalInfoFields.has(field)
              ),
              ...Array.from(allAdditionalInfoFields).filter(
                (field) => !fixedFields.includes(field)
              ),
            ];

            return (              <Box key={serviceInstance.id} sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}
                >
                  {serviceInstance.item.name} (
                  {serviceInstance.category || "N/A"})
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{
                    overflow: "auto",
                    maxWidth: "100%",
                    border: "1px solid rgba(224, 224, 224, 1)",
                  }}
                >
                  <Table                    aria-label={`Servicios con información adicional para ${serviceInstance.item.name}`}
                    size="small"
                    sx={{ minWidth: 650 }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>N° MUESTRA</TableCell>
                        <TableCell sx={headerCellStyle}>CÓDIGO</TableCell>
                        <TableCell sx={headerCellStyle}>NOMBRE</TableCell>
                        <TableCell sx={headerCellStyle}>CATEGORÍA</TableCell>
                        {finalFieldList.map((field) => (
                          <TableCell key={field} sx={headerCellStyle}>
                            {fieldLabels[field] || field.toUpperCase()}
                          </TableCell>
                        ))}
                        <TableCell sx={headerCellStyle}>ACCIONES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validInstances.map((instance, index) => (
                        <TableRow key={`${serviceInstance.id}-${instance.id}`}>
                          <TableCell sx={bodyCellStyle}>{index + 1}</TableCell>
                          <TableCell sx={bodyCellStyle}>
                            {formatAdditionalInfoValue(
                              serviceInstance.item.code
                            )}
                          </TableCell>                          <TableCell sx={bodyCellStyle}>
                            {formatAdditionalInfoValue(
                              serviceInstance.item.name
                            )}
                          </TableCell>
                          <TableCell sx={bodyCellStyle}>
                            {formatAdditionalInfoValue(
                              serviceInstance.category
                            )}
                          </TableCell>
                          {finalFieldList.map((field) => {
                            // Manejo especial para campos específicos de Cilindro
                            let displayValue;
                            if (
                              (field === "tamanoCilindro" ||
                                field === "resistenciaCompresion") &&
                              instance.additionalInfo?.["tipoMuestra"] !==
                                "Cilindro"
                            ) {
                              displayValue = "N/A";
                            } else {
                              displayValue = formatAdditionalInfoValue(
                                instance.additionalInfo?.[field]
                              );
                            }

                            return (
                              <TableCell key={field} sx={bodyCellStyle}>
                                {displayValue}
                              </TableCell>
                            );
                          })}
                          <TableCell sx={bodyCellStyle}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              disabled={loading}
                              onClick={() =>
                                handleEditService(
                                  serviceInstance.id,
                                  serviceInstance.category || "",
                                  instance.id,
                                  instance.additionalInfo || {}
                                )
                              }
                              sx={{ mr: 1 }}
                              aria-label={`Editar instancia ${index + 1} de ${
                                serviceInstance.item.name
                              }`}
                            >
                              Editar
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={loading}
                              onClick={() =>
                                handleOpenDeleteDialog(
                                  serviceInstance.id,
                                  instance.id,
                                  serviceInstance.item.name
                                )
                              }
                              aria-label={`Eliminar instancia ${index + 1} de ${
                                serviceInstance.item.name
                              }`}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })}
        </>
      )}
      {servicesWithAdditionalInfo.length === 0 &&
        servicesWithoutAdditionalInfo.length === 0 && (
          <Typography variant="body1" sx={{ mt: 3, textAlign: "center" }}>
            No hay servicios seleccionados.
          </Typography>
        )}
      <Button
        variant="outlined"
        disabled={loading}
        onClick={() => navigate("/cliente", { state: { step: 1 } })}
        sx={{ mt: 4 }}
        startIcon={<EditIcon />}
        aria-label="Editar servicios seleccionados"
      >
        Editar Servicios
      </Button>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar{" "}
            {deleteTarget?.instanceId
              ? `la instancia del servicio "${deleteTarget.serviceName}"`
              : `el servicio "${deleteTarget?.serviceName}"`}
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
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
    </Box>
  );
};

export default ServiceReview;
