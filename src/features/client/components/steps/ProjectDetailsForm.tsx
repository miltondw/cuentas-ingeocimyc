/**
 * Formulario de detalles del proyecto - Paso 3
 * @file ProjectDetailsForm.tsx
 */

import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  InputAdornment,
} from "@mui/material";
import { DescriptionOutlined, LocationOnOutlined } from "@mui/icons-material";
import type { InternalServiceRequestData } from "@/types/serviceRequests";

export interface ProjectDetailsFormProps {
  data: InternalServiceRequestData;
  errors: Partial<Record<keyof InternalServiceRequestData, string>>;
  onChange: (updates: Partial<InternalServiceRequestData>) => void;
}

/**
 * Componente del paso de detalles del proyecto
 */
export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  data,
  errors,
  onChange,
}) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Detalles del Proyecto
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Proporcione información detallada sobre su proyecto para que podamos
        brindarle el mejor servicio.
      </Typography>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Descripción del proyecto */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción del Proyecto"
              multiline
              rows={6}
              value={data.descripcion}
              onChange={(e) => onChange({ descripcion: e.target.value })}
              error={!!errors.descripcion}
              helperText={
                errors.descripcion ||
                "Describa detalladamente el proyecto, objetivos, alcance y cualquier requerimiento específico"
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <DescriptionOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: Proyecto de construcción de edificio residencial de 5 niveles. Se requiere estudio geotécnico completo del terreno para determinar la capacidad de carga del suelo y diseñar la cimentación adecuada. El terreno tiene aproximadamente 500 m² y se encuentra en zona sísmica. Se necesita entrega de resultados en un plazo máximo de 3 semanas..."
            />
          </Grid>

          {/* Ubicación del proyecto */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ubicación del Proyecto"
              multiline
              rows={3}
              value={data.ubicacionProyecto}
              onChange={(e) => onChange({ ubicacionProyecto: e.target.value })}
              error={!!errors.ubicacionProyecto}
              helperText={
                errors.ubicacionProyecto ||
                "Incluya dirección completa, ciudad, estado y cualquier referencia que facilite la ubicación"
              }
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1 }}
                  >
                    <LocationOnOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              placeholder="Ej: Av. Principal #123, Col. Centro, Ciudad de México, CDMX, CP 06000. Entre la calle Secundaria y Tercera. Referencia: frente al parque central"
            />
          </Grid>
        </Grid>

        {/* Consejos para completar el formulario */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Consejos para una mejor solicitud
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: "info.light", color: "info.contrastText" }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  📝 Descripción del Proyecto
                </Typography>
                <Typography variant="caption">
                  • Incluya el tipo de construcción o proyecto
                  <br />
                  • Mencione dimensiones aproximadas
                  <br />
                  • Especifique plazos de entrega
                  <br />• Detalle requerimientos técnicos específicos
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "success.light",
                  color: "success.contrastText",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  📍 Ubicación del Proyecto
                </Typography>
                <Typography variant="caption">
                  • Dirección completa y código postal
                  <br />
                  • Referencias visuales cercanas
                  <br />
                  • Condiciones de acceso al sitio
                  <br />• Características del terreno si las conoce
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Información adicional */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Nota:</strong> La información proporcionada nos ayudará a
            preparar una propuesta más precisa y ajustada a sus necesidades.
            Nuestro equipo técnico revisará los detalles y se pondrá en contacto
            con usted para cualquier aclaración adicional.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
