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
  Collapse,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useServiceRequest } from "../ServiceRequestContext";

interface AdditionalInfo {
  [key: string]: string | number | boolean | string[];
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

  const headerCellStyle = { fontWeight: "bold", textAlign: "center" };
  const bodyCellStyle = { textAlign: "center" };

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
          updateAdditionalInfo(serviceId, instanceId, {}, updatedInstances);
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
  ]);

  const formatAdditionalInfoValue = (
    value: string | number | boolean | string[]
  ): string => (Array.isArray(value) ? value.join(", ") : String(value));

  const clientInfoTable = useMemo(
    () => (
      <TableContainer component={Paper}>
        <Table aria-label="Información del cliente">
          <TableBody>
            {Object.entries(formData).map(([field, value]) => (
              <TableRow key={field}>
                <TableCell
                  sx={{ textTransform: "uppercase", ...bodyCellStyle }}
                >
                  {fieldLabels[field] || field}
                </TableCell>
                <TableCell sx={bodyCellStyle}>{value || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [formData, fieldLabels]
  );

  const noAdditionalInfoTable = useMemo(
    () =>
      servicesWithoutAdditionalInfo.length > 0 ? (
        <TableContainer component={Paper}>
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
                    {serviceInstance.item.code}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {serviceInstance.item.name}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {serviceInstance.category}
                  </TableCell>
                  <TableCell sx={bodyCellStyle}>
                    {serviceInstance.quantity}
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
    ]
  );

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
            const additionalInfoFields =
              serviceInstance.item.additionalInfo?.map((info) => ({
                field: info.field,
                label: info.label,
              })) || [];
            const validInstances = serviceInstance.instances.filter(
              (instance) =>
                instance.additionalInfo &&
                Object.keys(instance.additionalInfo).length > 0
            );
            return validInstances.length > 0 ? (
              <Box key={serviceInstance.id} sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}
                >
                  {serviceInstance.item.name} ({serviceInstance.category})
                </Typography>
                <TableContainer component={Paper}>
                  <Table
                    aria-label={`Servicios con información adicional para ${serviceInstance.item.name}`}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>N° Muestra</TableCell>
                        <TableCell sx={headerCellStyle}>CÓDIGO</TableCell>
                        <TableCell sx={headerCellStyle}>NOMBRE</TableCell>
                        <TableCell sx={headerCellStyle}>CATEGORÍA</TableCell>
                        {additionalInfoFields.map((field) => (
                          <TableCell key={field.field} sx={headerCellStyle}>
                            {field.label}
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
                            {serviceInstance.item.code}
                          </TableCell>
                          <TableCell sx={bodyCellStyle}>
                            {serviceInstance.item.name}
                          </TableCell>
                          <TableCell sx={bodyCellStyle}>
                            {serviceInstance.category}
                          </TableCell>
                          {additionalInfoFields.map((field) => (
                            <TableCell key={field.field} sx={bodyCellStyle}>
                              {instance.additionalInfo[field.field] !==
                              undefined
                                ? formatAdditionalInfoValue(
                                    instance.additionalInfo[field.field]
                                  )
                                : "N/A"}
                            </TableCell>
                          ))}
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
            ) : null;
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
