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
import { formatNumber, parseNumber } from "@/utils/formatNumber";
import { PaymentMethod } from "@/types/typesProject/projectTypes";

interface FinancialInfoProps {
  obrero: string;
  costoServicio: number;
  abono: number;
  factura: string;
  valorRetencion: number;
  metodoDePago: string;
  onFieldChange: (field: string, value: string | number) => void;
  disabled?: boolean;
  estado?: string; // Opcional para manejar el estado si es necesario
}

// Opciones para métodos de pago según la documentación del backend
const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "credito", label: "Crédito" },
];

/**
 * Componente para la sección de información financiera del proyecto
 */
export const FinancialInfoSection: React.FC<FinancialInfoProps> = ({
  obrero,
  costoServicio,
  abono,
  factura,
  valorRetencion,
  metodoDePago,
  onFieldChange,
  disabled = false,
}) => {
  return (
    <>
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Información Financiera
        </Typography>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Obrero Asignado"
          value={obrero}
          onChange={(e) => onFieldChange("obrero", e.target.value)}
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Costo del Servicio"
          value={formatNumber(costoServicio)}
          onChange={(e) => {
            const numericValue = parseNumber(e.target.value);
            onFieldChange("costoServicio", Number(numericValue) || 0);
          }}
          required
          placeholder="0"
          helperText="Formato colombiano (ej: 1,000,000)"
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Abono"
          value={formatNumber(abono)}
          onChange={(e) => {
            const numericValue = parseNumber(e.target.value);
            onFieldChange("abono", Number(numericValue) || 0);
          }}
          placeholder="0"
          helperText="Formato colombiano (ej: 500,000)"
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Valor Retención (%)"
          value={formatNumber(valorRetencion)}
          onChange={(e) => {
            const numericValue = parseNumber(e.target.value);
            onFieldChange("valorRetencion", Number(numericValue) || 0);
          }}
          placeholder="0"
          helperText="Porcentaje de retención (ej: 4)"
          disabled={disabled}
        />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Método de Pago</InputLabel>
          <Select
            value={metodoDePago}
            label="Método de Pago"
            onChange={(e) => onFieldChange("metodoDePago", e.target.value)}
            disabled={disabled}
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method.value} value={method.value}>
                {method.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Número de Factura"
          value={factura}
          onChange={(e) => onFieldChange("factura", e.target.value)}
          disabled={disabled}
        />
      </Grid2>
    </>
  );
};
