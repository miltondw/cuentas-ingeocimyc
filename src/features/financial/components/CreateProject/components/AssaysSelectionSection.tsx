import React from "react";
import {
  Grid2,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
} from "@mui/material";
import { AssaysByCategory, AssayFormItem } from "../types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface AssaysSelectionProps {
  assaysByCategory: AssaysByCategory[];
  selectedAssays: AssayFormItem[];
  loading: boolean;
  onAddAssay: (assay: AssayFormItem) => void;
  onRemoveAssay: (id: number) => void;
  disabled?: boolean;
}

/**
 * Componente para la selección de ensayos del proyecto con checkboxes
 */
export const AssaysSelectionSection: React.FC<AssaysSelectionProps> = ({
  assaysByCategory,
  selectedAssays,
  loading,
  onAddAssay,
  onRemoveAssay,
  disabled = false,
}) => {
  // Función para verificar si un ensayo está seleccionado usando useCallback para mejorar rendimiento
  const isAssaySelected = React.useCallback(
    (assayId: number) => {
      return selectedAssays.some((assay) => assay.id === assayId);
    },
    [selectedAssays]
  );

  // Manejador para el cambio en el checkbox usando React.useCallback para prevenir renders innecesarios
  const handleAssayToggle = React.useCallback(
    (
      assay: { id: number; code: string; name: string },
      category: { id: number; name: string }
    ) => {
      // Verificamos si el ensayo ya está seleccionado
      const isSelected = selectedAssays.some((item) => item.id === assay.id);

      if (isSelected) {
        // Si ya está seleccionado, lo removemos
        console.info(`Removiendo ensayo: ${assay.name} (ID: ${assay.id})`);
        onRemoveAssay(assay.id);
      } else {
        // Si no está seleccionado, lo añadimos
        console.info(`Añadiendo ensayo: ${assay.name} (ID: ${assay.id})`);
        onAddAssay({
          id: assay.id,
          code: assay.code,
          name: assay.name,
          categoryId: category.id,
          categoryName: category.name,
        });
      }
    },
    [selectedAssays, onAddAssay, onRemoveAssay]
  );

  return (
    <>
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Ensayos del Proyecto
        </Typography>
      </Grid2>

      {!disabled && (
        <Grid2 size={{ xs: 12 }}>
          {assaysByCategory.map((categoryGroup) => (
            <Accordion key={categoryGroup.category.id} defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{categoryGroup.category.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl component="fieldset" fullWidth>
                  <FormGroup>
                    {categoryGroup.ensayos.map((assay) => (
                      <FormControlLabel
                        key={assay.id}
                        control={
                          <Checkbox
                            checked={isAssaySelected(assay.id)}
                            onChange={() => {
                              console.info(
                                `Checkbox cambió: ${assay.name} (ID: ${assay.id})`
                              );
                              handleAssayToggle(assay, categoryGroup.category);
                            }}
                            disabled={loading || disabled}
                            key={`checkbox-${assay.id}`}
                          />
                        }
                        label={`${assay.code} - ${assay.name}`}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid2>
      )}

      <Grid2 size={{ xs: 12 }}>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Ensayos Seleccionados
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!loading && selectedAssays.length === 0 && (
            <Card>
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No hay ensayos seleccionados
                </Typography>
              </CardContent>
            </Card>
          )}

          <Stack
            spacing={1}
            direction="row"
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1 }}
          >
            {selectedAssays.length > 0 ? (
              selectedAssays.map((assay) => (
                <Chip
                  key={`selected-${assay.id}`}
                  label={`${
                    assay.categoryName ? `${assay.categoryName}: ` : ""
                  }${assay.name}`}
                  onDelete={
                    !disabled
                      ? () => {
                          console.info(
                            `Eliminando chip: ${assay.name} (ID: ${assay.id})`
                          );
                          onRemoveAssay(assay.id);
                        }
                      : undefined
                  }
                  color="primary"
                  sx={{ mb: 1 }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay ensayos seleccionados
              </Typography>
            )}
          </Stack>
        </Box>
      </Grid2>
    </>
  );
};
