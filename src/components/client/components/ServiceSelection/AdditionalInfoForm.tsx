import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { AdditionalInfo } from "../types";
import React, { useCallback } from "react";

interface AdditionalInfoFormProps {
  service: {
    additionalInfo?: AdditionalInfo[];
    code?: string;
    [key: string]: unknown;
  };
  itemAdditionalInfo: Record<string, string | number | boolean | string[]>;
  setItemAdditionalInfo: React.Dispatch<
    React.SetStateAction<Record<string, string | number | boolean | string[]>>
  >;
}

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  service,
  itemAdditionalInfo,
  setItemAdditionalInfo,
}): React.ReactElement => {
  const handleChange = useCallback(
    (field: string, value: string | number | boolean | string[]) => {
      setItemAdditionalInfo((prev) => ({ ...prev, [field]: value }));
    },
    [setItemAdditionalInfo]
  );

  const handleCheckboxChange = useCallback(
    (field: string, checked: boolean) => {
      handleChange(field, checked);
    },
    [handleChange]
  );

  const handleMultiSelectChange = useCallback(
    (field: string, value: string[]) => {
      handleChange(field, value);
    },
    [handleChange]
  );

  const handleDateChange = useCallback(
    (field: string, date: Dayjs | null) => {
      handleChange(field, date ? dayjs(date).format("DD-MM-YYYY") : "");
    },
    [handleChange]
  );

  const getDateValue = (
    value: string | number | boolean | string[] | undefined
  ): Dayjs | null => {
    if (typeof value === "string" && value) {
      const parsedDate = dayjs(value, "DD-MM-YYYY", true);
      return parsedDate.isValid() ? parsedDate : null;
    }    return null;
  }; 
  
  // Helper function to check if a field is valid for a specific service  
  const isValidField = useCallback(
    (serviceCode: string, fieldName: string): boolean => {
      // Define service-specific invalid fields
      const invalidFieldsByService: Record<string, string[]> = {
        // "EDS-1": ["areaPredio"], - Removed as this field is actually required
        // Add other service codes and their invalid fields here as needed
      };

      // Check if the field is invalid for this service
      if (
        invalidFieldsByService[serviceCode] &&
        invalidFieldsByService[serviceCode].includes(fieldName)
      ) {
        return false;
      }

      return true;
    },
    []
  );

  // Función para renderizar un campo específico por su nombre  
  const renderFieldByName = (fieldName: string): React.ReactElement | null => {
    const info = service.additionalInfo?.find(
      (item: AdditionalInfo) => item.field === fieldName
    );
    if (!info) return null;

    // Skip fields that are invalid for this service type
    if (
      service.code &&
      typeof service.code === "string" &&
      !isValidField(service.code, fieldName)
    ) {
      return null;
    }

    // Verificar campos específicos para Cilindro
    // Estos campos solo deben mostrarse cuando el tipo es "Cilindro"
    if (
      (fieldName === "resistenciaCompresion" ||
        fieldName === "tamanoCilindro") &&
      itemAdditionalInfo["tipoMuestra"] !== "Cilindro"
    ) {
      return null;
    }

    const showField =
      !info.dependsOnField ||
      (info.dependsOnField &&
        info.dependsOnValue !== undefined &&
        itemAdditionalInfo[info.dependsOnField] === info.dependsOnValue);

    if (!showField) return null;

    switch (info.type) {
      case "text":
      case "number":
        return (
          <TextField
            key={info.field}
            fullWidth
            label={info.label}
            value={itemAdditionalInfo[info.field] ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(
                info.field,
                info.type === "number"
                  ? parseFloat(e.target.value) || 0
                  : e.target.value
              )
            }
            margin="normal"
            type={info.type}
            required={info.required}
            aria-label={info.label}
          />
        );
      case "select":
        return (
          <FormControl
            fullWidth
            margin="normal"
            required={info.required}
            key={info.field}
          >
            <InputLabel id={`${info.field}-label`}>{info.label}</InputLabel>
            <Select
              labelId={`${info.field}-label`}
              value={itemAdditionalInfo[info.field] ?? ""}
              label={info.label}
              onChange={(e) =>
                handleChange(info.field, e.target.value as string)
              }
              aria-label={info.label}
            >
              {info.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "select-multiple":
        return (
          <FormControl
            fullWidth
            margin="normal"
            required={info.required}
            key={info.field}
          >
            <InputLabel id={`${info.field}-label`}>{info.label}</InputLabel>
            <Select
              labelId={`${info.field}-label`}
              multiple
              value={
                Array.isArray(itemAdditionalInfo[info.field])
                  ? (itemAdditionalInfo[info.field] as string[])
                  : typeof itemAdditionalInfo[info.field] === "string" &&
                    itemAdditionalInfo[info.field]
                  ? [String(itemAdditionalInfo[info.field])]
                  : []
              }
              label={info.label}
              onChange={(e) =>
                handleMultiSelectChange(info.field, e.target.value as string[])
              }
              renderValue={(selected: string[]) => selected.join(", ")}
              aria-label={info.label}
            >
              {info.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "checkbox":
        return (
          <FormControlLabel
            key={info.field}
            control={
              <Checkbox
                checked={!!itemAdditionalInfo[info.field]}
                onChange={(e) =>
                  handleCheckboxChange(info.field, e.target.checked)
                }
                aria-label={info.label}
              />
            }
            label={info.label}
          />
        );
      case "radio":
        return (
          <FormControl
            component="fieldset"
            fullWidth
            margin="normal"
            required={info.required}
            key={info.field}
          >
            <FormLabel component="legend">{info.label}</FormLabel>
            <RadioGroup
              aria-label={info.label}
              name={info.field}
              value={itemAdditionalInfo[info.field] ?? ""}
              onChange={(e) => handleChange(info.field, e.target.value)}
            >
              {info.options?.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      case "date":
        return (
          <FormControl fullWidth margin="normal" key={info.field}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={info.label}
                value={getDateValue(itemAdditionalInfo[info.field])}
                onChange={(date) => handleDateChange(info.field, date)}
                slotProps={{ textField: { "aria-label": info.label } }}
                format="DD-MM-YYYY"
              />
            </LocalizationProvider>
          </FormControl>
        );
      default:
        return null;
    }
  }; // Lista de campos ordenados según especificación
  // Definimos el orden basado en el tipo de muestra seleccionado
  const orderedFields = [
    "tipoMuestra",
    // Campos específicos para Cilindro
    ...(itemAdditionalInfo["tipoMuestra"] === "Cilindro"
      ? ["tamanoCilindro", "resistenciaCompresion"]
      : []),
    // Campos comunes para ambos tipos
    "elementoFundido",
    "resistenciaDiseno",
    "identificacionMuestra",
    "estructuraRealizada",
    "fechaFundida",
    "edadEnsayo",
  ];

  // Encontrar campos adicionales que no estén en la lista ordenada
  const additionalFields =
    service.additionalInfo
      ?.filter((info) => !orderedFields.includes(info.field))
      .map((info) => info.field) || [];

  return (
    <Box>
      {/* Renderizar campos en el orden especificado */}
      {orderedFields.map((fieldName) => renderFieldByName(fieldName))}

      {/* Renderizar cualquier campo adicional no incluido en el orden específico */}
      {additionalFields.map((fieldName) => renderFieldByName(fieldName))}
    </Box>
  );
};

export default AdditionalInfoForm;
