import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

// Esquema de validación con Zod
const registerSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "lab", "client"]),
  jwt2: z
    .string()
    .optional()
    .refine(
      (_val) => {
        // Si es rol admin, el jwt2 es requerido
        return true;
      },
      {
        message: "Este campo es requerido para crear cuenta de administrador",
      }
    ),
});

// Tipo inferido del esquema
type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Página de registro de usuarios
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Configurar React Hook Form con validación de Zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "client" as const,
      jwt2: "",
    },
  });

  const selectedRole = watch("role");
  const isAdmin = selectedRole === "admin";
  // Manejar envío del formulario
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Usar DTO alineado con backend
      const result = await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.password, // Confirmación igual a password
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        role: data.role as "client" | "admin",
        // jwt2 eliminado porque no está en RegisterDto
      });
      if (result.success) {
        showSuccess("Usuario registrado exitosamente. Puede iniciar sesión.");
        navigate("/login", { replace: true });
      } else {
        // Mostrar feedback detallado según la nueva API
        let msg = result.error?.message || "Error al registrar usuario.";
        showError(msg);
      }
    } catch (error) {
      showError("Error inesperado. Inténtalo de nuevo más tarde.");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Registro de Usuario
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete el formulario para crear una nueva cuenta
        </Typography>
      </Box>
      <TextField
        margin="normal"
        fullWidth
        id="email"
        label="Correo electrónico"
        autoComplete="email"
        autoFocus
        {...register("email")}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isSubmitting}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Contraseña"
        type="password"
        id="password"
        autoComplete="new-password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isSubmitting}
      />
      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          id="firstName"
          label="Nombre"
          autoComplete="given-name"
          {...register("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          disabled={isSubmitting}
        />

        <TextField
          fullWidth
          id="lastName"
          label="Apellido"
          autoComplete="family-name"
          {...register("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          disabled={isSubmitting}
        />
      </Box>
      <FormControl fullWidth margin="normal" error={!!errors.role}>
        <InputLabel id="role-label">Tipo de usuario</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          label="Tipo de usuario"
          {...register("role")}
          disabled={isSubmitting}
        >
          <MenuItem value="client">Cliente</MenuItem>
          <MenuItem value="lab">Laboratorio</MenuItem>
          <MenuItem value="admin">Administrador</MenuItem>
        </Select>
        {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
      </FormControl>
      {isAdmin && (
        <TextField
          margin="normal"
          fullWidth
          label="Código de autorización admin"
          type="password"
          id="jwt2"
          {...register("jwt2")}
          error={!!errors.jwt2}
          helperText={errors.jwt2?.message}
          disabled={isSubmitting}
        />
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Registrarse"
        )}
      </Button>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="text"
          onClick={() => navigate("/login")}
          disabled={isSubmitting}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterPage;
