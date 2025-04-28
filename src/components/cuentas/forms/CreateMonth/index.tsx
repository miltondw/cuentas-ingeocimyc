import React, { useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@api";
import { fetchMonthData, transformFormData } from "./form-create-month.api";
import { parseNumber, formatNumber } from "@utils/formatNumber";
import {
  validationSchema,
  FormData,
  defaultValues,
} from "./form-create-month.types";

const FormCreateMonth: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extras",
  });

  useEffect(() => {
    if (id) {
      fetchMonthData(id)
        .then((data) => {
          reset(data);
        })
        .catch((error) => console.error(error));
    } else {
      reset(defaultValues);
    }
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = transformFormData(data);
      const endpoint = id ? `/gastos-mes/${id}` : "/gastos-mes";
      await api[id ? "put" : "post"](endpoint, payload);
      navigate("/gastos");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Container sx={{ boxShadow: 3, p: 3, borderRadius: 2, my: 3 }}>
      <Typography variant="h3" gutterBottom color="primary">
        {id ? "Actualizar" : "Crear"} Gastos Mensuales
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <Controller
          name="mes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="MES"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.mes}
              helperText={errors.mes?.message}
            />
          )}
        />

        <Controller
          name="salarios"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="SALARIOS"
              type="text"
              fullWidth
              value={formatNumber(field.value)}
              onChange={(e) =>
                field.onChange(parseNumber(e.target.value) as any)
              }
              error={!!errors.salarios}
              helperText={errors.salarios?.message}
            />
          )}
        />

        <Controller
          name="luz"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="LUZ"
              type="text"
              fullWidth
              value={formatNumber(field.value)}
              onChange={(e) =>
                field.onChange(parseNumber(e.target.value) as any)
              }
              error={!!errors.luz}
              helperText={errors.luz?.message}
            />
          )}
        />

        <Controller
          name="agua"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="AGUA"
              type="text"
              fullWidth
              value={formatNumber(field.value)}
              onChange={(e) =>
                field.onChange(parseNumber(e.target.value) as any)
              }
              error={!!errors.agua}
              helperText={errors.agua?.message}
            />
          )}
        />

        <Controller
          name="arriendo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ARRIENDO"
              type="text"
              fullWidth
              value={formatNumber(field.value)}
              onChange={(e) =>
                field.onChange(parseNumber(e.target.value) as any)
              }
              error={!!errors.arriendo}
              helperText={errors.arriendo?.message}
            />
          )}
        />

        <Controller
          name="internet"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="INTERNET"
              type="text"
              fullWidth
              value={formatNumber(field.value)}
              onChange={(e) =>
                field.onChange(parseNumber(e.target.value) as any)
              }
              error={!!errors.internet}
              helperText={errors.internet?.message}
            />
          )}
        />

        <Controller
          name="salud"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="SALUD"
              type="text"
              fullWidth
              value={formatNumber(field.value)}
              onChange={(e) =>
                field.onChange(parseNumber(e.target.value) as any)
              }
              error={!!errors.salud}
              helperText={errors.salud?.message}
            />
          )}
        />

        {fields.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              gridColumn: "span 3",
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Controller
              name={`extras.${index}.field`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre del gasto"
                  fullWidth
                  error={!!errors.extras?.[index]?.field}
                  helperText={errors.extras?.[index]?.field?.message}
                />
              )}
            />
            <Controller
              name={`extras.${index}.value`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Monto"
                  fullWidth
                  value={formatNumber(field.value)}
                  onChange={(e) =>
                    field.onChange(parseNumber(e.target.value) as any)
                  }
                  error={!!errors.extras?.[index]?.value}
                  helperText={errors.extras?.[index]?.value?.message}
                />
              )}
            />
            <IconButton
              onClick={() => remove(index)}
              color="error"
              sx={{ height: "fit-content" }}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Box>
        ))}

        <Box sx={{ gridColumn: "span 3", display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() =>
              append({ id: Date.now().toString(), field: "", value: "" })
            }
          >
            Agregar gasto
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ ml: "auto" }}
          >
            {id ? "Actualizar" : "Guardar"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default FormCreateMonth;
