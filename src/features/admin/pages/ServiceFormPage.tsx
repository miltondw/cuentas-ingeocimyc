import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  useAdminCategories,
  useAdminService,
  useCreateCompleteService,
  useUpdateService,
  useCreateServiceField,
  useUpdateServiceField,
  useDeleteServiceField,
} from "@/api/hooks/useAdminServices";
import type { ServiceFormData } from "@/types/admin";
import { FIELD_TYPE_OPTIONS } from "@/types/admin";

const ServiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [expandedField, setExpandedField] = useState<string | false>(false);

  // Hooks de datos
  const { data: categoriesResponse } = useAdminCategories();
  const { data: serviceResponse } = useAdminService(id ? parseInt(id) : 0);
  const createMutation = useCreateCompleteService();
  const updateMutation = useUpdateService();
  const createFieldMutation = useCreateServiceField();
  const updateFieldMutation = useUpdateServiceField();
  const deleteFieldMutation = useDeleteServiceField();
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];
  const service = serviceResponse?.data;

  // Form handling
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: {
      categoryId: 0,
      code: "",
      name: "",
      additionalFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalFields",
  });

  const watchedFields = watch("additionalFields");

  // Cargar datos del servicio para edición
  useEffect(() => {
    if (isEditing && service) {
      reset({
        categoryId: service.categoryId,
        code: service.code,
        name: service.name,
        additionalFields:
          service.additionalFields?.map(
            (
              field: {
                fieldName: string;
                type: string;
                required: boolean;
                options?: string[];
                dependsOnField?: string;
                dependsOnValue?: string;
                label?: string;
                displayOrder?: number;
                id?: number;
              },
              index: number
            ) => ({
              fieldName: field.fieldName,
              type: field.type,
              required: field.required,
              options: field.options || [],
              dependsOnField: field.dependsOnField || "",
              dependsOnValue: field.dependsOnValue || "",
              label: field.label || "",
              displayOrder: field.displayOrder ?? index,
            })
          ) || [],
      });
    }
  }, [isEditing, service, reset]);

  const handleAddField = () => {
    const newOrder = fields.length;
    append({
      fieldName: "",
      type: "text",
      required: false,
      options: [],
      dependsOnField: "",
      dependsOnValue: "",
      label: "",
      displayOrder: newOrder,
    });
    setExpandedField(`field-${fields.length}`);
  };
  const handleSaveService = async (data: ServiceFormData) => {
    try {
      // Procesar campos adicionales con el orden correcto
      const processedFields = data.additionalFields.map((field, index) => ({
        ...field,
        displayOrder: index,
        options:
          field.type === "select"
            ? field.options.filter((opt) => opt.trim())
            : undefined,
        dependsOnField: field.dependsOnField || undefined,
        dependsOnValue: field.dependsOnValue || undefined,
      }));

      if (isEditing && service) {
        // 1. Actualizar información básica del servicio
        await updateMutation.mutateAsync({
          id: service.id,
          data: {
            categoryId: data.categoryId,
            code: data.code,
            name: data.name,
          },
        });

        // 2. Manejar campos adicionales
        const currentFields = service.additionalFields || [];
        const newFields = processedFields;

        // Eliminar campos que ya no están en el formulario
        for (const currentField of currentFields) {
          const stillExists = newFields.find(
            (newField) =>
              newField.fieldName ===
              (currentField as { fieldName: string }).fieldName
          );
          if (!stillExists && currentField.id) {
            await deleteFieldMutation.mutateAsync(currentField.id);
          }
        }

        // Crear o actualizar campos
        for (const newField of newFields) {
          const existingField = currentFields.find(
            (current: { fieldName: string; id?: number }) =>
              current.fieldName === newField.fieldName
          );

          if (existingField && existingField.id) {
            // Actualizar campo existente
            await updateFieldMutation.mutateAsync({
              fieldId: existingField.id,
              data: {
                fieldName: newField.fieldName,
                type: newField.type,
                required: newField.required,
                label: newField.label,
                displayOrder: newField.displayOrder,
                options: newField.options,
                dependsOnField: newField.dependsOnField,
                dependsOnValue: newField.dependsOnValue,
              },
            });
          } else {
            // Crear nuevo campo
            await createFieldMutation.mutateAsync({
              serviceId: service.id,
              data: {
                fieldName: newField.fieldName,
                type: newField.type,
                required: newField.required,
                label: newField.label,
                displayOrder: newField.displayOrder,
                options: newField.options,
                dependsOnField: newField.dependsOnField,
                dependsOnValue: newField.dependsOnValue,
              },
            });
          }
        }
      } else {
        // Crear servicio nuevo con campos adicionales
        await createMutation.mutateAsync({
          ...data,
          additionalFields: processedFields,
        });
      }
      navigate("/admin/services");
    } catch (_error) {
      // El error ya se maneja en el hook
    }
  };

  const handleFieldExpansion =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedField(isExpanded ? panel : false);
    };

  const getAvailableParentFields = (currentIndex: number) => {
    return (
      watchedFields
        ?.slice(0, currentIndex)
        .filter((field) => field.fieldName && field.type === "select")
        .map((field) => ({
          value: field.fieldName,
          label: field.label || field.fieldName,
        })) || []
    );
  };

  const getParentFieldOptions = (parentFieldName: string) => {
    const parentField = watchedFields?.find(
      (field) => field.fieldName === parentFieldName
    );
    return parentField?.options || [];
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate("/admin/services")} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {isEditing
            ? "Modifica la información del servicio"
            : "Crea un nuevo servicio con campos adicionales personalizados"}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(handleSaveService)}>
        {/* Información Básica */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información Básica
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.categoryId}>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      {...field}
                      label="Categoría"
                      value={field.value || ""}
                    >
                      {categories.map(
                        (category: {
                          id: number;
                          name: string;
                          code: string;
                        }) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name} ({category.code})
                          </MenuItem>
                        )
                      )}
                    </Select>
                    {errors.categoryId && (
                      <Typography variant="caption" color="error">
                        {errors.categoryId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              <TextField
                {...register("code")}
                label="Código"
                placeholder="ej: EMC-1"
                error={!!errors.code}
                helperText={errors.code?.message}
                fullWidth
                slotProps={{
                  input: { style: { textTransform: "uppercase" } },
                  inputLabel: { shrink: true },
                }}
              />
              <TextField
                {...register("name")}
                label="Nombre del Servicio"
                placeholder="ej: Ensayo de muestras de concreto"
                error={!!errors.name}
                helperText={errors.name?.message}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Campos Adicionales */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                Campos Adicionales ({fields.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddField}
              >
                Agregar Campo
              </Button>
            </Box>

            {fields.length === 0 ? (
              <Alert severity="info">
                No hay campos adicionales. Los campos adicionales permiten
                personalizar la información que se solicita para este servicio.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {fields.map((field, index) => {
                  const panelId = `field-${index}`;
                  const fieldType = watchedFields?.[index]?.type;

                  return (
                    <Accordion
                      key={field.id}
                      expanded={expandedField === panelId}
                      onChange={handleFieldExpansion(panelId)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ backgroundColor: "grey.50" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <DragIcon sx={{ color: "grey.400" }} />
                          <Typography>
                            {watchedFields?.[index]?.label ||
                              `Campo ${index + 1}`}
                          </Typography>
                          <Chip
                            label={
                              FIELD_TYPE_OPTIONS.find(
                                (opt) => opt.value === fieldType
                              )?.label || fieldType
                            }
                            size="small"
                            color="primary"
                          />
                          {watchedFields?.[index]?.required && (
                            <Chip
                              label="Requerido"
                              size="small"
                              color="secondary"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                              {...register(
                                `additionalFields.${index}.fieldName`
                              )}
                              label="Nombre del Campo"
                              placeholder="ej: tipoMuestra"
                              error={
                                !!errors.additionalFields?.[index]?.fieldName
                              }
                              helperText={
                                errors.additionalFields?.[index]?.fieldName
                                  ?.message
                              }
                              fullWidth
                            />
                            <TextField
                              {...register(`additionalFields.${index}.label`)}
                              label="Etiqueta"
                              placeholder="ej: Tipo de muestra"
                              error={!!errors.additionalFields?.[index]?.label}
                              helperText={
                                errors.additionalFields?.[index]?.label?.message
                              }
                              fullWidth
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            <Controller
                              name={`additionalFields.${index}.type`}
                              control={control}
                              render={({ field }) => (
                                <FormControl sx={{ minWidth: 200 }}>
                                  <InputLabel>Tipo de Campo</InputLabel>
                                  <Select {...field} label="Tipo de Campo">
                                    {FIELD_TYPE_OPTIONS.map((option) => (
                                      <MenuItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            />
                            <FormControlLabel
                              control={
                                <Controller
                                  name={`additionalFields.${index}.required`}
                                  control={control}
                                  render={({ field }) => (
                                    <Checkbox
                                      {...field}
                                      checked={field.value}
                                    />
                                  )}
                                />
                              }
                              label="Campo requerido"
                            />
                            <IconButton
                              onClick={() => remove(index)}
                              color="error"
                              sx={{ ml: "auto" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>

                          {/* Opciones para select */}
                          {fieldType === "select" && (
                            <Controller
                              name={`additionalFields.${index}.options`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  label="Opciones (separadas por comas)"
                                  placeholder="ej: Cilindro, Viga"
                                  value={field.value?.join(", ") || ""}
                                  onChange={(e) => {
                                    const options = e.target.value
                                      .split(",")
                                      .map((opt) => opt.trim())
                                      .filter((opt) => opt.length > 0);
                                    field.onChange(options);
                                  }}
                                  fullWidth
                                  multiline
                                  rows={2}
                                />
                              )}
                            />
                          )}

                          {/* Dependencias */}
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Controller
                              name={`additionalFields.${index}.dependsOnField`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth>
                                  <InputLabel>Depende del campo</InputLabel>
                                  <Select {...field} label="Depende del campo">
                                    <MenuItem value="">Ninguno</MenuItem>
                                    {getAvailableParentFields(index).map(
                                      (option) => (
                                        <MenuItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </MenuItem>
                                      )
                                    )}
                                  </Select>
                                </FormControl>
                              )}
                            />
                            {watchedFields?.[index]?.dependsOnField && (
                              <Controller
                                name={`additionalFields.${index}.dependsOnValue`}
                                control={control}
                                render={({ field }) => (
                                  <FormControl fullWidth>
                                    <InputLabel>Valor requerido</InputLabel>
                                    <Select {...field} label="Valor requerido">
                                      {getParentFieldOptions(
                                        watchedFields[index].dependsOnField
                                      ).map((option) => (
                                        <MenuItem key={option} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                )}
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/admin/services")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              createFieldMutation.isPending ||
              updateFieldMutation.isPending ||
              deleteFieldMutation.isPending
            }
          >
            {isEditing ? "Actualizar Servicio" : "Crear Servicio"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default ServiceFormPage;
