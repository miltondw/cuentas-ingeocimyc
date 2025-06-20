/**
 * Componente de éxito después del envío - Paso 5
 * @file SuccessStep.tsx
 */

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from "@mui/material";
import {
  CheckCircleOutlined,
  EmailOutlined,
  PhoneOutlined,
  PictureAsPdfOutlined,
  RefreshOutlined,
  VisibilityOutlined,
  DownloadOutlined,
} from "@mui/icons-material";

import {
  useDownloadServiceRequestPDF,
  usePreviewServiceRequestPDF,
} from "../../hooks/useServiceRequests";
import { ServiceRequest } from "../../../../types/serviceRequests";

export interface SuccessStepProps {
  serviceRequest: ServiceRequest; // El objeto de la solicitud creada
  onNewRequest: () => void;
  onViewDetails: () => void;
}

/**
 * Componente del paso de éxito
 */
export const SuccessStep: React.FC<SuccessStepProps> = ({
  serviceRequest,
  onNewRequest,
  onViewDetails,
}) => {
  const { downloadPDF, isDownloading } = useDownloadServiceRequestPDF();
  const { previewPDF, isLoading: isPreviewLoading } =
    usePreviewServiceRequestPDF();
  const handleDownloadPDF = () => {
    if (serviceRequest?.id) {
      const clientName =
        serviceRequest.name || serviceRequest.nombre || "cliente";
      downloadPDF(
        serviceRequest.id,
        `solicitud-${serviceRequest.id}-${clientName.replace(/\s+/g, "-")}.pdf`
      );
    }
  };

  const handlePreviewPDF = () => {
    if (serviceRequest?.id) {
      previewPDF(serviceRequest.id);
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      {/* Icono de éxito */}
      <Box sx={{ mb: 4 }}>
        <CheckCircleOutlined
          sx={{
            fontSize: 80,
            color: "success.main",
            mb: 2,
          }}
        />
        <Typography variant="h4" gutterBottom color="success.main">
          ¡Solicitud Enviada Exitosamente!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Su solicitud ha sido recibida y está siendo procesada
        </Typography>
      </Box>

      {/* Información de la solicitud */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detalles de la Solicitud
              </Typography>
              <Divider sx={{ mb: 2 }} />{" "}
              <Box sx={{ textAlign: "left" }}>
                <Typography variant="body2" color="text.secondary">
                  Número de solicitud:
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  #{serviceRequest?.id || "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Cliente:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceRequest?.name || serviceRequest?.nombre || "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Proyecto:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceRequest?.nameProject ||
                    serviceRequest?.empresa ||
                    "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Ubicación:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceRequest?.location ||
                    serviceRequest?.ubicacionProyecto ||
                    "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Identificación:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceRequest?.identification || "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceRequest?.email || "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Teléfono:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {serviceRequest?.phone || serviceRequest?.telefono || "N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Fecha de solicitud:
                </Typography>
                <Typography variant="body1">
                  {serviceRequest?.created_at
                    ? new Date(serviceRequest.created_at).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : serviceRequest?.fechaSolicitud
                    ? new Date(
                        serviceRequest.fechaSolicitud
                      ).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximos Pasos
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List dense sx={{ textAlign: "left" }}>
                <ListItem>
                  <ListItemIcon>
                    <EmailOutlined color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Confirmación por email"
                    secondary="En los próximos minutos"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PhoneOutlined color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contacto de nuestro equipo"
                    secondary="Máximo en 24 horas"
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PictureAsPdfOutlined color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Propuesta técnica"
                    secondary="En 2-3 días hábiles"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Información importante */}
      <Alert severity="info" sx={{ mb: 4, textAlign: "left" }}>
        <Typography variant="subtitle2" gutterBottom>
          Información importante:
        </Typography>
        <Typography variant="body2">
          • Hemos enviado una confirmación a su email:
          <strong>{serviceRequest?.email}</strong>
          <br />• Conserve el número de solicitud
          <strong>#{serviceRequest?.id}</strong> para futuras referencias
          <br />• Nuestro equipo se pondrá en contacto con usted al teléfono:
          <strong>{serviceRequest?.phone || serviceRequest?.telefono}</strong>
          <br />• Si tiene alguna pregunta urgente, puede contactarnos
          directamente
        </Typography>
      </Alert>

      {/* Acciones disponibles */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Acciones Disponibles
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<VisibilityOutlined />}
              onClick={handlePreviewPDF}
              disabled={isPreviewLoading}
            >
              {isPreviewLoading ? "Cargando..." : "Previsualizar PDF"}
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? "Descargando..." : "Descargar PDF"}
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="outlined"
              startIcon={<VisibilityOutlined />}
              onClick={onViewDetails}
            >
              Ver Detalles
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              startIcon={<RefreshOutlined />}
              onClick={onNewRequest}
              color="primary"
            >
              Nueva Solicitud
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Información de contacto */}
      <Paper variant="outlined" sx={{ p: 3, bgcolor: "grey.50" }}>
        <Typography variant="h6" gutterBottom>
          ¿Necesita ayuda?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Si tiene alguna pregunta o necesita asistencia inmediata, no dude en
          contactarnos:
        </Typography>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2">
            📧 Email:{" "}
            <Box
              component="a"
              href="mailto:coordinador@ingeocimyc.com.co"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                  color: "primary.dark",
                },
              }}
            >
              coordinador@ingeocimyc.com.co
            </Box>
          </Typography>
          <Typography variant="body2">
            📞 WhatsApp:{" "}
            <Box
              component="a"
              href="https://wa.me/573013517044"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                  color: "primary.dark",
                },
              }}
            >
              +57 301 351 7044
            </Box>
          </Typography>
          <Typography variant="body2">
            🕒 <strong>Horario de atención:</strong>
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            • Lunes a Viernes: 8:00 AM - 12:00 PM
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            • Lunes a Viernes: 2:00 PM - 6:00 PM
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            • Sábados: 8:00 AM - 12:00 PM
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
