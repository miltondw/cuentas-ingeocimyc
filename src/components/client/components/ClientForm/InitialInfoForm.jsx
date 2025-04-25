import { useCallback } from 'react';
import { TextField, Grid2, Typography, FormControl, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useServiceRequest } from '../ServiceRequestContext';

const InitialInfoForm = () => {
  const { state, setFormData } = useServiceRequest();
  const { formData } = state;

  // --- Esquema de Validación Yup ---
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("El nombre es requerido"),
    nameProject: Yup.string().required("El nombre del proyecto es requerido"),
    location: Yup.string().required("La localización es requerida"),
    identification: Yup.string().required("La identificación es requerida"),
    phone: Yup.string().required("El teléfono es requerido"),
    email: Yup.string().email("Correo electrónico no válido").required("El correo electrónico es requerido"),
    description: Yup.string().required("La descripción es requerida"),
  });


  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: formData,
    mode: 'onChange',
  });


  const onSubmit = useCallback((data) => {
    console.log("Form submitted, updating context with data:", data);
    setFormData(data);
  }, [setFormData]);

  return (
    // handleSubmit valida y luego llama a nuestro onSubmit si todo está OK
    <FormControl component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" gutterBottom>
        Información Inicial
      </Typography>
      <Grid2 container spacing={2}>
        {/* Campos del formulario (sin cambios aquí) */}
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nombre"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nombre del Proyecto"
            {...register("nameProject")}
            error={!!errors.nameProject}
            helperText={errors.nameProject?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Ubicación"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Identificación"
            {...register("identification")}
            error={!!errors.identification}
            helperText={errors.identification?.message}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Teléfono"
            {...register("phone")}
            error={!!errors.phone}
            helperText={errors.phone?.message}
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
          />
        </Grid2>
        <Grid2 size={{ xs: 12 }} >
          <TextField
            fullWidth
            label="Descripción del Proyecto"
            multiline
            rows={4}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Grid2>
      </Grid2>
      {/* Botón oculto para permitir el envío externo */}
      <Button color="primary" type="submit" aria-hidden="true" variant="contained" sx={{ width: "50%", margin: "1rem auto", }}  >Guardar</Button>
    </FormControl>
  );
};

export default InitialInfoForm;
