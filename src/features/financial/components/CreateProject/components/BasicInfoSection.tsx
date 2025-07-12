import React from "react";
import {
  Grid2,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ProjectStatus } from "@/types/projects"; // Importando desde el archivo correcto
import { useAuth } from "@/features/auth/hooks/useAuth";

interface BasicInfoProps {
  nombreProyecto: string;
  solicitante: string;
  identificacion: string;
  fecha: string;
  estado: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

/**
 * Componente para la sección de información básica del proyecto
 */
export const BasicInfoSection: React.FC<BasicInfoProps> = ({
  nombreProyecto,
  solicitante,
  identificacion,
  fecha,
  estado,
  onFieldChange,
  disabled = false,
}) => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  return (
    <>
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          Información del Proyecto
        </Typography>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Nombre del Proyecto"
          value={nombreProyecto}
          onChange={(e) => onFieldChange("nombreProyecto", e.target.value)}
          required
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Solicitante/Cliente"
          value={solicitante}
          onChange={(e) => onFieldChange("solicitante", e.target.value)}
          required
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Identificación"
          value={identificacion}
          onChange={(e) => onFieldChange("identificacion", e.target.value)}
          required
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          type="date"
          label="Fecha del Proyecto"
          value={fecha}
          onChange={(e) => onFieldChange("fecha", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          required
          disabled={disabled}
        />
      </Grid2>

      {isAdmin && (
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Estado del Proyecto</InputLabel>
            <Select
              value={estado}
              label="Estado del Proyecto"
              onChange={(e) => onFieldChange("estado", e.target.value)}
              disabled={disabled}
            >
              <MenuItem value={ProjectStatus.ACTIVO}>Activo</MenuItem>
              <MenuItem value={ProjectStatus.PAUSADO}>Pausado</MenuItem>
              <MenuItem value={ProjectStatus.COMPLETADO}>Completado</MenuItem>
              <MenuItem value={ProjectStatus.CANCELADO}>Cancelado</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
      )}
    </>
  );
};
