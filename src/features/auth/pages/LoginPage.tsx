import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

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
  const { showError } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      const result = await login({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        // Redirigir según el rol (esta lógica ahora está en Auth Redirect)
        navigate("/");
      } else {
        // Mostrar mensaje de error específico o genérico
        showError(
          result.error?.message ||
            "Error al iniciar sesión. Verifica tus credenciales."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Error inesperado. Inténtalo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: { xs: "100%", sm: 350, p: 2 }, mx: "auto" }}>
      {/* Header minimalista */}
      <Box sx={{ textAlign: "center" }}>
        <img
          src="/public/logo-ingeocimyc.svg"
          alt="Logo Ingeocimyc"
          width={125}
          height={125}
        />
      </Box>

      {/* Formulario */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ width: "100%" }}
      >
        <TextField
          margin="normal"
          fullWidth
          id="email"
          label="Email"
          autoComplete="email"
          autoFocus
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isSubmitting}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: "#34495e", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "#3498db",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2980b9",
              },
            },
          }}
        />

        <TextField
          margin="normal"
          fullWidth
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={isSubmitting}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: "#34495e", fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={isSubmitting}
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "#3498db",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2980b9",
              },
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        ></Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <LoginIcon />
            )
          }
          sx={{
            mt: 1,
            mb: 3,
            height: { xs: 48, sm: 52 },
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #2980b9 0%, #21618c 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
            },
            "&:disabled": {
              background: "#bdc3c7",
              color: "white",
            },
            transition: "all 0.2s ease",
          }}
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
