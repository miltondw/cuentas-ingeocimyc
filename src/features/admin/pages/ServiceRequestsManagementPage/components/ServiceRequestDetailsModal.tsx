import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  Grid2,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  alpha,
} from "@mui/material";
import type {
  AdminServiceRequest,
  AdditionalField,
  AdditionalValue,
} from "../types";
import { formatDate } from "@/utils/formatters/dateFormatter";

interface ServiceRequestDetailsModalProps {
  open: boolean;
  onClose: () => void;
  request: AdminServiceRequest | null;
  onEdit?: (id: number) => void;
}

// Utilidad para agrupar y formatear valores adicionales (idéntico al original)
function formatAdditionalValue(
  value: AdditionalValue,
  additionalFields: AdditionalField[]
) {
  const fieldIdMatch = value.fieldName.match(/field_(\d+)$/);
  if (!fieldIdMatch) {
    return {
      label: value.fieldName,
      value: value.fieldValue,
      formattedValue: value.fieldValue,
    };
  }
  const fieldId = parseInt(fieldIdMatch[1], 10);
  const field = additionalFields.find((f) => f.id === fieldId);
  if (!field) {
    return {
      label: value.fieldName,
      value: value.fieldValue,
      formattedValue: value.fieldValue,
    };
  }
  let formattedValue = value.fieldValue;
  if (field.type === "date" && value.fieldValue) {
    try {
      formattedValue = formatDate(value.fieldValue);
    } catch {
      formattedValue = value.fieldValue;
    }
  }
  return {
    label: field.label || field.fieldName,
    value: value.fieldValue,
    formattedValue,
    type: field.type,
    required: field.required,
  };
}

function groupAdditionalValuesByInstance(
  additionalValues: AdditionalValue[],
  additionalFields: AdditionalField[]
) {
  const instances = new Map<
    string,
    Array<{
      label: string;
      value: string;
      formattedValue: string;
      type?: string;
      required?: boolean;
    }>
  >();
  additionalValues.forEach((value) => {
    const instanceMatch = value.fieldName.match(/instance_(\d+)_/);
    const instanceKey = instanceMatch
      ? `Instancia ${instanceMatch[1]}`
      : "General";
    if (!instances.has(instanceKey)) {
      instances.set(instanceKey, []);
    }
    const formattedValue = formatAdditionalValue(value, additionalFields);
    const instanceArray = instances.get(instanceKey);
    if (instanceArray) {
      instanceArray.push(formattedValue);
    }
  });
  return instances;
}

const ServiceRequestDetailsModal: React.FC<ServiceRequestDetailsModalProps> = ({
  open,
  onClose,
  request,
  onEdit,
}) => {
  const theme = useTheme();
  if (!request) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip label="Solicitud" color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="700">
                Detalles de Solicitud #{request.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Información completa de la solicitud
              </Typography>
            </Box>
          </Box>
          {onEdit && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onEdit(request.id)}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Editar
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mt: 1 }}>
          <Grid2 container spacing={4}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  fontWeight="600"
                >
                  Información del Cliente
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      NOMBRE COMPLETO
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {request.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      IDENTIFICACIÓN
                    </Typography>
                    <Typography variant="body1">
                      {request.identification}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      EMAIL
                    </Typography>
                    <Typography variant="body1">{request.email}</Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      TELÉFONO
                    </Typography>
                    <Typography variant="body1">{request.phone}</Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    ></Typography>
                    <Typography variant="body1">
                      <a
                        href={request.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "underline",
                          color: "#008380",
                          fontWeight: "bold",
                        }}
                      >
                        ARCHIVOS ADJUNTOS
                      </a>
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  fontWeight="600"
                >
                  Información del Proyecto
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      PROYECTO
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {request.nameProject}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      UBICACIÓN
                    </Typography>
                    <Typography variant="body1">{request.location}</Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      ESTADO ACTUAL
                    </Typography>
                    <Chip
                      label={request.status}
                      color="primary"
                      size="small"
                      sx={{ mt: 0.5, fontWeight: 600, borderRadius: 2 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="600"
                    >
                      FECHA DE SOLICITUD
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(request.created_at)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  color="info.main"
                  fontWeight="600"
                >
                  Descripción del Proyecto
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {request.description}
                </Typography>
              </Paper>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                color="primary"
                fontWeight="600"
              >
                Servicios Solicitados ({request.selectedServices?.length || 0})
              </Typography>
              <Stack spacing={2}>
                {request.selectedServices?.map((service, index) => (
                  <Paper
                    key={service.id}
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: "grey.200",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: theme.palette.primary.main,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {service.service.code} - {service.service?.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Categoría: {service.service.category?.name}
                        </Typography>
                        <Typography variant="body1">
                          Cantidad: <strong>{service.quantity}</strong>
                        </Typography>
                      </Box>
                    </Box>
                    {service.additionalValues?.length > 0 && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          gutterBottom
                        >
                          Información adicional:
                        </Typography>
                        {(() => {
                          const groupedValues = groupAdditionalValuesByInstance(
                            service.additionalValues,
                            service.service.additionalFields || []
                          );
                          const additionalFieldNames = (
                            service.service.additionalFields || []
                          ).map((f) => f.label);
                          const rows = Array.from(groupedValues.values()).map(
                            (values) => {
                              const valueMap: Record<string, string> = {};
                              values.forEach((v) => {
                                valueMap[v.label] = v.formattedValue;
                              });
                              return valueMap;
                            }
                          );
                          if (
                            rows.length === 0 ||
                            additionalFieldNames.length === 0
                          ) {
                            return (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                No hay información adicional para mostrar.
                              </Typography>
                            );
                          }
                          return (
                            <Box sx={{ overflowX: "auto", mt: 1 }}>
                              <Table
                                size="small"
                                sx={{
                                  minWidth: 400,
                                  backgroundColor: "white",
                                  borderRadius: 1,
                                }}
                              >
                                <TableHead>
                                  <TableRow>
                                    {additionalFieldNames.map((label) => (
                                      <TableCell
                                        key={label}
                                        sx={{
                                          fontWeight: 700,
                                          backgroundColor: "grey.100",
                                          borderRight: "1px solid",
                                          borderColor: "grey.200",
                                        }}
                                      >
                                        {label}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                      {additionalFieldNames.map((label) => (
                                        <TableCell
                                          key={label}
                                          sx={{
                                            borderRight: "1px solid",
                                            borderColor: "grey.200",
                                          }}
                                        >
                                          {row[label] ?? "-"}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          );
                        })()}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Grid2>
          </Grid2>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cerrar
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onEdit(request.id)}
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 600,
              ml: 2,
            }}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ServiceRequestDetailsModal;
