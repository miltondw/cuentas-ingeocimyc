import React from "react";
import {
  Grid2,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatNumber, parseNumber } from "@/utils/formatNumber";
import { ExtraField } from "../types";
import AddIcon from "@mui/icons-material/Add";

interface ExtraFieldsProps {
  extraFields: ExtraField[];
  onAddField: () => void;
  onUpdateField: (id: string, updates: Partial<ExtraField>) => void;
  onRemoveField: (id: string) => void;
  disabled?: boolean;
}

/**
 * Componente para la sección de campos extra del proyecto
 */
export const ExtraFieldsSection: React.FC<ExtraFieldsProps> = ({
  extraFields,
  onAddField,
  onUpdateField,
  onRemoveField,
  disabled = false,
}) => {
  return (
    <>
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Campos Extras
        </Typography>
      </Grid2>

      {extraFields.map((field) => (
        <Grid2 size={{ xs: 12 }} key={field.id}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 8 }}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={field.description}
                    onChange={(e) =>
                      onUpdateField(field.id, { description: e.target.value })
                    }
                    disabled={disabled}
                  />
                </Grid2>
                <Grid2 size={{ xs: 4 }}>
                  <TextField
                    fullWidth
                    label="Valor"
                    value={formatNumber(field.value)}
                    onChange={(e) => {
                      const numericValue = parseNumber(e.target.value);
                      onUpdateField(field.id, {
                        value: Number(numericValue) || 0,
                      });
                    }}
                    placeholder="0"
                    helperText="Formato colombiano"
                    disabled={disabled}
                  />
                </Grid2>
                {!disabled && (
                  <Grid2 size={{ xs: 12 }}>
                    <IconButton
                      color="error"
                      onClick={() => onRemoveField(field.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid2>
                )}
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
      ))}

      {!disabled && (
        <Grid2 size={{ xs: 12 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddField}
            sx={{ mt: 1 }}
          >
            Agregar Campo Extra
          </Button>
        </Grid2>
      )}
    </>
  );
};
