/**
 * Formulario de revisión y confirmación - Paso 4
 * @file ReviewAndConfirmForm.tsx
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import {
  PersonOutline,
  BusinessOutlined,
  PhoneOutlined,
  EmailOutlined,
  EngineeringOutlined,
  LocationOnOutlined,
  DescriptionOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ExpandMoreOutlined,
  InfoOutlined,
  ArrowBackOutlined,
  AssignmentOutlined,
  FingerprintOutlined,
} from "@mui/icons-material";

import type {
  InternalServiceRequestData,
  ProcessedService,
} from "@/types/serviceRequests";

export interface ReviewAndConfirmFormProps {
  data: InternalServiceRequestData;
  errors: Partial<Record<keyof InternalServiceRequestData, string>>;
  onChange: (updates: Partial<InternalServiceRequestData>) => void;
  onEditStep?: (step: number) => void;
  fromReview?: boolean;
  availableServices?: ProcessedService[]; // Para obtener los labels de campos adicionales
}

/**
 * Componente del paso de revisión y confirmación
 */
export const ReviewAndConfirmForm: React.FC<ReviewAndConfirmFormProps> = ({
  data,
  errors,
  onEditStep,
  fromReview,
  availableServices = [],
}) => {
  // Verificar si hay errores
  const hasErrors = Object.keys(errors).length > 0;

  // Función para obtener el label de un campo adicional
  const getFieldLabel = React.useCallback(
    (serviceId: string, fieldId: string): string => {
      const service = availableServices.find((s) => s.id === serviceId);
      if (!service) return `Campo ${fieldId}`;

      const field = service.additionalFields?.find(
        (f) => f.id === fieldId || f.name === fieldId
      );
      return field?.label || field?.name || `Campo ${fieldId}`;
    },
    [availableServices]
  );

  // Organizar servicios por categoría
  const servicesByCategory = React.useMemo(() => {
    if (!data.selectedServices) return {};

    return data.selectedServices.reduce((acc, service) => {
      // Extraer la categoría del servicio (asumiendo que viene en el nombre)
      const categoryName = service.serviceName.split(" - ")[0] || "General";

      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }

      acc[categoryName].push(service);
      return acc;
    }, {} as Record<string, typeof data.selectedServices>);
  }, [data]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Revisión y Confirmación
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Por favor revise toda la información antes de enviar su solicitud.
      </Typography>
      {/* Alerta de modo edición */}
      {fromReview && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderLeft: 4,
            borderLeftColor: "primary.main",
          }}
          icon={<ArrowBackOutlined />}
        >
          <Typography variant="subtitle2" gutterBottom>
            Modo de edición activado
          </Typography>
          <Typography variant="body2">
            Está editando información desde la revisión. Al hacer clic en
            &quot;Siguiente&quot; regresará automáticamente a la página de
            revisión.
          </Typography>
        </Alert>
      )}
      {/* Mostrar errores si los hay */}
      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Se encontraron errores en el formulario:
          </Typography>
          <List dense>
            {Object.entries(errors).map(([field, error]) => (
              <ListItem key={field} sx={{ py: 0 }}>
                <ListItemText primary={`• ${error}`} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
      <Grid2 container spacing={3}>
        {/* Información del Cliente */}
        <Grid2 size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PersonOutline color="primary" />
                  Información del Cliente
                </Typography>
                {onEditStep && (
                  <Tooltip title="Editar información del cliente">
                    <IconButton
                      onClick={() => onEditStep(0)}
                      color="primary"
                      size="small"
                    >
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <PersonOutline fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Nombre:
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 3 }}>
                    {data.nombre || "No especificado"}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <EmailOutlined fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Email:
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ pl: 3, wordBreak: "break-word" }}
                  >
                    {data.email || "No especificado"}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <PhoneOutlined fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Teléfono:
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 3 }}>
                    {data.telefono || "No especificado"}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <BusinessOutlined fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Empresa:
                    </Typography>
                  </Box>{" "}
                  <Typography variant="body2" sx={{ pl: 3 }}>
                    {data.empresa || "No especificado"}
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <FingerprintOutlined fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Identificación:
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 3 }}>
                    {data.identification || "No especificado"}
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <AssignmentOutlined fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Proyecto:
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 3 }}>
                    {data.nameProject || "No especificado"}
                  </Typography>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
        {/* Servicios Seleccionados */}
        <Grid2 size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <EngineeringOutlined color="primary" />
                  Servicios Seleccionados
                </Typography>
                {onEditStep && (
                  <Tooltip title="Editar servicios seleccionados">
                    <IconButton
                      onClick={() => onEditStep(1)}
                      color="primary"
                      size="small"
                    >
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {data.selectedServices && data.selectedServices.length > 0 ? (
                <Box>
                  <Box
                    sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}
                  >
                    <Chip
                      label={`${data.selectedServices.length} servicios`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`${data.selectedServices.reduce(
                        (sum, s) => sum + s.totalQuantity,
                        0
                      )} unidades total`}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {Object.entries(servicesByCategory).map(
                    ([categoryName, services]) => (
                      <Accordion key={categoryName} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {categoryName} ({services.length} servicio
                            {services.length > 1 ? "s" : ""})
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Servicio
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Cantidad
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Instancias
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Info. Adicional
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {services.map((service) => (
                                  <TableRow key={service.serviceId} hover>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: "medium" }}
                                      >
                                        {service.serviceName}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {service.serviceDescription}
                                      </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                      <Chip
                                        label={service.totalQuantity}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      <Chip
                                        label={service.instances.length}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                      />
                                    </TableCell>

                                    <TableCell align="center">
                                      {service.instances.some(
                                        (inst) =>
                                          (inst.additionalData?.length || 0) > 0
                                      ) ? (
                                        <Tooltip title="Este servicio tiene información adicional configurada">
                                          <InfoOutlined
                                            color="primary"
                                            fontSize="small"
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          No
                                        </Typography>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          {/* Detalles de instancias con información adicional */}
                          {services.some((s) =>
                            s.instances.some(
                              (inst) => (inst.additionalData?.length || 0) > 0
                            )
                          ) && (
                            <Box sx={{ mt: 2 }}>
                              <Typography
                                variant="subtitle2"
                                gutterBottom
                                sx={{ fontWeight: "bold", mb: 2 }}
                              >
                                Información adicional configurada:
                              </Typography>

                              {services.map((service) => {
                                const instancesWithData =
                                  service.instances.filter(
                                    (inst) =>
                                      (inst.additionalData?.length || 0) > 0
                                  );

                                if (instancesWithData.length === 0) return null; // Obtener todos los campos únicos para las columnas
                                const allFieldIds = new Set<string>();

                                instancesWithData.forEach((instance) => {
                                  instance.additionalData?.forEach((data) => {
                                    allFieldIds.add(data.fieldId);
                                  });
                                });

                                const fieldIdsArray = Array.from(allFieldIds);

                                return (
                                  <Box key={service.serviceId} sx={{ mb: 3 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: "medium", mb: 1 }}
                                    >
                                      {service.serviceName}
                                    </Typography>

                                    <TableContainer
                                      component={Paper}
                                      variant="outlined"
                                    >
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow>
                                            <TableCell
                                              sx={{
                                                fontWeight: "bold",
                                                bgcolor: "grey.100",
                                              }}
                                            >
                                              Instancia
                                            </TableCell>
                                            <TableCell
                                              align="center"
                                              sx={{
                                                fontWeight: "bold",
                                                bgcolor: "grey.100",
                                              }}
                                            >
                                              Cantidad
                                            </TableCell>
                                            {fieldIdsArray.map((fieldId) => (
                                              <TableCell
                                                key={fieldId}
                                                sx={{
                                                  fontWeight: "bold",
                                                  bgcolor: "grey.100",
                                                }}
                                              >
                                                {getFieldLabel(
                                                  service.serviceId,
                                                  fieldId
                                                )}
                                              </TableCell>
                                            ))}
                                            <TableCell
                                              sx={{
                                                fontWeight: "bold",
                                                bgcolor: "grey.100",
                                              }}
                                            >
                                              Notas
                                            </TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {instancesWithData.map(
                                            (instance, instIndex) => (
                                              <TableRow
                                                key={instance.instanceId}
                                                hover
                                              >
                                                <TableCell
                                                  component="th"
                                                  scope="row"
                                                >
                                                  <Chip
                                                    label={`Capa ${
                                                      instIndex + 1
                                                    }`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                  />
                                                </TableCell>
                                                <TableCell align="center">
                                                  {instance.quantity}
                                                </TableCell>
                                                {fieldIdsArray.map(
                                                  (fieldId) => {
                                                    const fieldData =
                                                      instance.additionalData?.find(
                                                        (data) =>
                                                          data.fieldId ===
                                                          fieldId
                                                      );
                                                    return (
                                                      <TableCell key={fieldId}>
                                                        {fieldData
                                                          ? String(
                                                              fieldData.value
                                                            )
                                                          : "-"}
                                                      </TableCell>
                                                    );
                                                  }
                                                )}
                                                <TableCell>
                                                  {instance.notes || "-"}
                                                </TableCell>
                                              </TableRow>
                                            )
                                          )}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    )
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="error">
                  No se ha seleccionado ningún servicio
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid2>
        {/* Detalles del Proyecto */}
        <Grid2 size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <DescriptionOutlined color="primary" />
                  Detalles del Proyecto
                </Typography>
                {onEditStep && (
                  <Tooltip title="Editar detalles del proyecto">
                    <IconButton
                      onClick={() => onEditStep(2)}
                      color="primary"
                      size="small"
                    >
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <LocationOnOutlined fontSize="small" color="action" />
                      Ubicación del Proyecto
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {data.ubicacionProyecto || "No especificado"}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <DescriptionOutlined fontSize="small" color="action" />
                      Descripción del Proyecto
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        maxHeight: 200,
                        overflow: "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: "pre-wrap" }}
                      >
                        {data.descripcion || "No especificado"}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>
      {/* Información sobre el proceso */}
      <Paper
        elevation={1}
        sx={{ p: 3, mt: 3, bgcolor: "info.light", color: "info.contrastText" }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <CheckCircleOutlined />
          ¿Qué sigue después de enviar la solicitud?
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlined color="info" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Confirmación inmediata"
              secondary="Recibirá una confirmación por email con el número de su solicitud"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlined color="info" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Revisión técnica"
              secondary="Nuestro equipo revisará su solicitud y se pondrá en contacto en máximo 24 horas"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlined color="info" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Propuesta personalizada"
              secondary="Elaboraremos una propuesta técnica y económica ajustada a sus necesidades"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleOutlined color="info" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Seguimiento continuo"
              secondary="Mantendremos comunicación constante durante todo el proceso"
            />
          </ListItem>
        </List>
      </Paper>
      {/* Términos y condiciones */}
      <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: "grey.50" }}>
        <Typography variant="caption" color="text.secondary">
          Al enviar esta solicitud, acepta que INGEOCIMYC S.A.S. procese sus
          datos personales para los fines descritos en nuestra política de
          privacidad. La información proporcionada será utilizada únicamente
          para procesar su solicitud y brindar el servicio requerido.
        </Typography>
      </Paper>
    </Box>
  );
};
