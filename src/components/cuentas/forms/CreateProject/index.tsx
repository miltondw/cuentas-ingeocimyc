import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/api";
import {
  ProjectFormData,
  validationSchema,
  defaultValues,
} from "./form-create-project.types";
import { formatNumber, parseNumber } from "@utils/formatNumber";
import {
  fetchProjectData,
  transformProjectData,
} from "./form-create-project.api";

const FormCreateProject: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    fields: extrasFields,
    append: extrasAppend,
    remove: extrasRemove,
  } = useFieldArray({
    control,
    name: "gastos.extras",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchProjectData(id)
        .then((data: ProjectFormData) => {
          reset(data);
        })
        .catch((error: unknown) => {
          console.error("Error fetching project:", error);
          setError("Error al cargar el proyecto");
        });
    } else {
      reset(defaultValues);
    }
  }, [id, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const payload = transformProjectData(data);
      const endpoint = id ? `/projects/${id}` : "/projects";
      await api[id ? "put" : "post"](endpoint, payload);
      navigate(-1);
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setError(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al enviar el formulario"
      );
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: "2rem auto" }}>
      <Typography variant="h4" gutterBottom>
        {id ? "Actualizar Proyecto" : "Crear Proyecto"}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={2}>
          {/* Campos del proyecto */}
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="fecha"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Fecha"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fecha}
                  helperText={errors.fecha?.message}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="solicitante"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Solicitante"
                  fullWidth
                  error={!!errors.solicitante}
                  helperText={errors.solicitante?.message}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="nombre_proyecto"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre del Proyecto"
                  fullWidth
                  error={!!errors.nombre_proyecto}
                  helperText={errors.nombre_proyecto?.message}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="obrero"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Obrero"
                  fullWidth
                  error={!!errors.obrero}
                  helperText={errors.obrero?.message}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="metodo_de_pago"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Método de Pago"
                  fullWidth
                  error={!!errors.metodo_de_pago}
                  helperText={errors.metodo_de_pago?.message}
                >
                  <MenuItem value="">Otro</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                </TextField>
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="costo_servicio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Costo del Servicio"
                  fullWidth
                  type="text"
                  value={formatNumber(field.value) || ""}
                  onChange={(e) => field.onChange(parseNumber(e.target.value))}
                  error={!!errors.costo_servicio}
                  helperText={errors.costo_servicio?.message}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <Controller
              name="abono"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Abono"
                  fullWidth
                  type="text"
                  value={formatNumber(field.value) || ""}
                  onChange={(e) => field.onChange(parseNumber(e.target.value))}
                  error={!!errors.abono}
                  helperText={errors.abono?.message}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <Controller
              name="retencionIva"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="¿Aplica Facturación?"
                />
              )}
            />
          </Grid2>
          {control._formValues.retencionIva && (
            <>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="factura"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Factura"
                      fullWidth
                      error={!!errors.factura}
                      helperText={errors.factura?.message}
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="valor_retencion"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor Retención"
                      fullWidth
                      type="text"
                      value={formatNumber(field.value) || ""}
                      onChange={(e) =>
                        field.onChange(parseNumber(e.target.value))
                      }
                      error={!!errors.valor_retencion}
                      helperText={errors.valor_retencion?.message}
                    />
                  )}
                />
              </Grid2>
            </>
          )}
        </Grid2>

        {/* Campos de gastos */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Gastos
        </Typography>
        <Grid2
          container
          spacing={2}
          sx={{ mb: 2, border: "1px solid #ccc", p: 2, borderRadius: 1 }}
        >
          {" "}
          {(
            [
              "camioneta",
              "campo",
              "obreros",
              "comidas",
              "otros",
              "peajes",
              "combustible",
              "hospedaje",
            ] as const
          ).map((field) => (
            <Grid2 size={{ xs: 12, sm: 3 }} key={field}>
              <Controller
                name={`gastos.${field}`}
                control={control}
                render={({ field: gastoField }) => (
                  <TextField
                    {...gastoField}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    fullWidth
                    type="text"
                    value={formatNumber(gastoField.value as number) || ""}
                    onChange={(e) =>
                      gastoField.onChange(parseNumber(e.target.value))
                    }
                    error={!!errors.gastos?.[field]}
                    helperText={errors.gastos?.[field]?.message}
                  />
                )}
              />
            </Grid2>
          ))}
          {extrasFields.map((extra, index) => (
            <Grid2 container spacing={1} key={extra.id} sx={{ mb: 1 }}>
              <Grid2 size={{ xs: 5 }}>
                <Controller
                  name={`gastos.extras.${index}.field`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre del Campo"
                      fullWidth
                      error={!!errors.gastos?.extras?.[index]?.field}
                      helperText={
                        errors.gastos?.extras?.[index]?.field?.message
                      }
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={{ xs: 5 }}>
                <Controller
                  name={`gastos.extras.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Valor"
                      fullWidth
                      type="text"
                      value={formatNumber(field.value) || ""}
                      onChange={(e) =>
                        field.onChange(parseNumber(e.target.value))
                      }
                      error={!!errors.gastos?.extras?.[index]?.value}
                      helperText={
                        errors.gastos?.extras?.[index]?.value?.message
                      }
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <IconButton onClick={() => extrasRemove(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid2>
            </Grid2>
          ))}
          <Grid2 size={{ xs: 12 }}>
            {" "}
            <Button
              variant="outlined"
              onClick={() =>
                extrasAppend({
                  id: Date.now().toString(),
                  field: "",
                  value: 0,
                })
              }
            >
              Agregar campo extra
            </Button>
          </Grid2>
        </Grid2>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {id ? "Actualizar Proyecto" : "Crear Proyecto"}
        </Button>
      </form>
    </Paper>
  );
};

export default FormCreateProject;
