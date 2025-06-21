/**
 * Formulario de información del cliente - Paso 1
 * @file ClientInfoForm.tsx
 */

import React from "react";
import {
  Box,
  Grid2,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  BusinessOutlined,
  AssignmentOutlined,
  FingerprintOutlined,
} from "@mui/icons-material";
import type { InternalServiceRequestData } from "@/types/serviceRequests";

export interface ClientInfoFormProps {
  data: InternalServiceRequestData;
  errors: Partial<Record<keyof InternalServiceRequestData, string>>;
  onChange: (updates: Partial<InternalServiceRequestData>) => void;
}

/**
 * Componente del paso de información del cliente
 */
export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Información del Cliente
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Por favor proporcione sus datos de contacto para procesar su solicitud.
      </Typography>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Grid2 container spacing={3}>
          {/* Nombre completo */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nombre Completo"
              value={data.nombre}
              onChange={(e) => onChange({ nombre: e.target.value })}
              error={!!errors.nombre}
              helperText={errors.nombre}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: Eider Lopez"
            />
          </Grid2>
          {/* Email */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: coordinador@ingeocimyc.com.CO"
            />
          </Grid2>
          {/* Teléfono */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Teléfono"
              value={data.telefono}
              onChange={(e) => onChange({ telefono: e.target.value })}
              error={!!errors.telefono}
              helperText={
                errors.telefono || "Incluya código de país si es internacional"
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: 301 351 7044"
            />
          </Grid2>
          {/* Empresa */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Empresa/Organización"
              value={data.empresa}
              onChange={(e) => onChange({ empresa: e.target.value })}
              error={!!errors.empresa}
              helperText={errors.empresa}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: INGEOCIMYC"
            />
          </Grid2>
          {/* Identificación */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Identificación/NIT"
              value={data.identification}
              onChange={(e) => onChange({ identification: e.target.value })}
              error={!!errors.identification}
              helperText={errors.identification}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FingerprintOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: 12345678-9"
            />
          </Grid2>
          {/* Nombre del Proyecto */}
          <Grid2 size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              value={data.nameProject}
              onChange={(e) => onChange({ nameProject: e.target.value })}
              error={!!errors.nameProject}
              helperText={errors.nameProject}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: Construcción Edificio Central"
            />
          </Grid2>
        </Grid2>

        {/* Información adicional */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Información importante:</strong> Todos los campos son
            obligatorios. Sus datos se utilizarán únicamente para procesar su
            solicitud y mantener comunicación sobre el proyecto.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
