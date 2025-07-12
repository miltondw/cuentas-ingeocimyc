import React from "react";
import { Grid2, TextField, Typography } from "@mui/material";
import { formatNumber, parseNumber } from "@/utils/formatNumber";

interface ExpensesProps {
  expenses: {
    camioneta: number;
    campo: number;
    obreros: number;
    comidas: number;
    otros: number;
    peajes: number;
    combustible: number;
    hospedaje: number;
  };
  onFieldChange: (field: string, value: number) => void;
  disabled?: boolean;
}

// Lista de campos de gastos con sus labels
const expenseFields = [
  { key: "camioneta", label: "Camioneta" },
  { key: "campo", label: "Campo" },
  { key: "obreros", label: "Obreros" },
  { key: "comidas", label: "Comidas" },
  { key: "otros", label: "Otros" },
  { key: "peajes", label: "Peajes" },
  { key: "combustible", label: "Combustible" },
  { key: "hospedaje", label: "Hospedaje" },
];

/**
 * Componente para la sección de gastos del proyecto
 */
export const ExpensesSection: React.FC<ExpensesProps> = ({
  expenses,
  onFieldChange,
  disabled = false,
}) => {
  return (
    <>
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Gastos del Proyecto
        </Typography>
      </Grid2>

      {expenseFields.map((field) => (
        <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={field.key}>
          <TextField
            fullWidth
            label={field.label}
            value={formatNumber(expenses[field.key as keyof typeof expenses])}
            onChange={(e) => {
              const numericValue = parseNumber(e.target.value);
              onFieldChange(field.key, Number(numericValue) || 0);
            }}
            placeholder="0"
            helperText="Formato colombiano (ej: 100,000)"
            disabled={disabled}
          />
        </Grid2>
      ))}
    </>
  );
};
