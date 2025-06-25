import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminServicesApi } from "@/api/services/admin";
import type { Service } from "@/types/admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Button,
} from "@mui/material";
import { PageLoadingFallback } from "@/components/common/PageLoadingFallback";
import { showError } from "@/utils/notifications";

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminServicesApi
      .getById(Number(id))
      .then((data) => {
        setService(data.data);
        setError(null);
      })
      .catch(() => {
        setError("No se pudo cargar el servicio.");
        showError("No se pudo cargar el servicio.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoadingFallback message="Cargando servicio..." />;
  if (error)
    return (
      <Box maxWidth="sm" mx="auto" mt={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  if (!service)
    return (
      <Box maxWidth="sm" mx="auto" mt={4}>
        <Alert severity="warning">No se encontró el servicio.</Alert>
      </Box>
    );

  return (
    <Box maxWidth="md" mx="auto" mt={8}>
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" gutterBottom>
              Detalle del Servicio
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Chip label={`ID: ${service.id}`} color="default" />
            <Chip label={`Código: ${service.code}`} color="primary" />
            <Chip
              label={`Categoría: ${
                service.category?.name || service.categoryId
              }`}
              color="secondary"
            />
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Nombre
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {service.name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Creado: {service.created_at}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Actualizado: {service.updated_at}
          </Typography>
          {service.additionalFields && service.additionalFields.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Campos adicionales
              </Typography>
              <List dense>
                {service.additionalFields.map((field) => (
                  <ListItem key={field.id} disablePadding>
                    <ListItemText
                      primary={`${field.label || field.fieldName} (${
                        field.type
                      })`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ServiceDetailPage;
