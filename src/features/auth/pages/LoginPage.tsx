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
  Checkbox,
  FormControlLabel,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Esquema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  rememberMe: z.boolean(),
});

// Tipo inferido del esquema
type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Página de inicio de sesión
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Configurar React Hook Form con validación de Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false as const,
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (result.success) {
        // Redirigir según el rol (esta lógica ahora está en Auth Redirect)
        navigate("/");
      } else {
        // Mostrar mensaje de error específico o genérico
        setErrorMessage(
          result.error?.message ||
            "Error al iniciar sesión. Verifica tus credenciales."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Error inesperado. Inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Iniciar sesión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ingrese sus credenciales para acceder al sistema
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

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
        autoComplete="current-password"
        {...register("password")}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isSubmitting}
      />

      <FormControlLabel
        control={
          <Checkbox
            color="primary"
            {...register("rememberMe")}
            disabled={isSubmitting}
          />
        }
        label="Recordarme"
      />

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
          "Iniciar sesión"
        )}
      </Button>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Link href="/register" variant="body2">
          ¿No tienes cuenta? Regístrate
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
