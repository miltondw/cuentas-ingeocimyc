// components/ApiquesDeSuelos/BasicInfoForm.tsx
import React from "react";
import { TextField, Grid2, FormControlLabel, Checkbox } from "@mui/material";
import { ApiqueFormData } from "./apiqueTypes";

interface BasicInfoFormProps {
  formData: ApiqueFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile: boolean;
}

const BasicInfoForm = ({ formData, handleChange }: BasicInfoFormProps) => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Número de Apique"
          name="apique"
          value={formData.apique || ""}
          onChange={handleChange}
          fullWidth
          required
          aria-label="Número de apique (requerido)"
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Fecha"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Grid2>      <Grid2 size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Profundidad Total (m)"
          name="depth"
          value={formData.depth || ""}
          disabled
          fullWidth
          helperText="Se calcula automáticamente basado en las capas"
        />
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Profundidad a la que se tomó (m)"
          name="depth_tomo"
          type="number"
          value={formData.depth_tomo}
          onChange={handleChange}
          fullWidth
          inputProps={{ step: "0.01", min: 0 }}
        />
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.cbr_unaltered}
              onChange={handleChange}
              name="cbr_unaltered"
            />
          }
          label="CBR Inalterado"
          color="secondary"
        />
      </Grid2>
      {formData.cbr_unaltered && (
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Molde"
            type="number"
            name="molde"
            value={formData.molde || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid2>
      )}
    </Grid2>
  );
};

export default BasicInfoForm;
