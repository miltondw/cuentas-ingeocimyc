import React, { useEffect } from "react";
import { TextField, Grid2, Typography, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useServiceRequest } from "../ServiceRequestContext";

interface FormData {
  name: string;
  nameProject: string;
  location: string;
  identification: string;
  phone: string;
  email: string;
  description: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required("El nombre es requerido"),
  nameProject: Yup.string().required("El nombre del proyecto es requerido"),
  location: Yup.string().required("La localización es requerida"),
  identification: Yup.string().required("La identificación es requerida"),
  phone: Yup.string().required("El teléfono es requerido"),
  email: Yup.string()
    .email("Correo electrónico no válido")
    .required("El correo electrónico es requerido"),
  description: Yup.string().required("La descripción es requerida"),
});

const InitialInfoForm: React.FC = () => {
  const { state, setFormData, setFormValidity } = useServiceRequest();
  const { formData } = state;

  const {
    register,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: formData,
    mode: "onChange",
  });

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      setFormData(value as FormData);
      setFormValidity(isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData, setFormValidity, isValid]);

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Información Inicial del Cliente
      </Typography>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nombre"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            aria-invalid={!!errors.name}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nombre del Proyecto"
            {...register("nameProject")}
            error={!!errors.nameProject}
            helperText={errors.nameProject?.message}
            aria-invalid={!!errors.nameProject}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Ubicación"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
            aria-invalid={!!errors.location}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Identificación"
            {...register("identification")}
            error={!!errors.identification}
            helperText={errors.identification?.message}
            aria-invalid={!!errors.identification}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Teléfono"
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            aria-invalid={!!errors.phone}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            aria-invalid={!!errors.email}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Descripción del Proyecto"
            multiline
            rows={4}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
            aria-invalid={!!errors.description}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default InitialInfoForm;
