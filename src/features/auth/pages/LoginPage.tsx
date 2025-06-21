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
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
  Paper,
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: {
          xs: "white", // Fondo blanco en móviles para simplicidad
          sm: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)", // Gradiente en desktop
        },
        p: { xs: 0, sm: 2 },
      }}
    >
      {/* Contenedor simplificado - solo Paper en móviles */}
      <Box
        sx={{
          width: { xs: "100%", sm: "100%", md: "480px" }, // Ancho completo en móviles
          maxWidth: { xs: "none", sm: "480px" }, // Sin límite en móviles
          height: { xs: "100vh", sm: "auto" },
          display: "flex",
          alignItems: "center",
          p: { xs: 0, sm: 0 },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: { xs: 0, sm: 3 },
            background: {
              xs: "white", // Fondo simple en móviles
              sm: "rgba(255, 255, 255, 0.98)",
            },
            backdropFilter: { xs: "none", sm: "blur(10px)" },
            border: { xs: "none", sm: "1px solid rgba(255, 255, 255, 0.2)" },
            boxShadow: { xs: "none", sm: "0 8px 32px rgba(0, 0, 0, 0.12)" }, // Shadow personalizada para móviles
            width: "100%",
            minHeight: { xs: "100vh", sm: "auto" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "none", sm: "400px" },
              p: { xs: 2.5, sm: 4 }, // Menos padding en móviles
            }}
          >
            {/* Header minimalista */}
            <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: "#2c3e50",
                  mb: { xs: 0.5, sm: 1 },
                  fontSize: { xs: "1.75rem", sm: "2rem" },
                }}
              >
                Bienvenido
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                }}
              >
                Ingresa para continuar
              </Typography>
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
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register("rememberMe")}
                      disabled={isSubmitting}
                      size="small"
                      sx={{
                        color: "#34495e",
                        "&.Mui-checked": {
                          color: "#2980b9",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Recordarme
                    </Typography>
                  }
                />
                <Link
                  href="#"
                  variant="body2"
                  sx={{
                    color: "#3498db",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

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
                  background:
                    "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #2980b9 0%, #21618c 100%)",
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

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  ¿No tienes cuenta?
                </Typography>
                <Link
                  href="/register"
                  variant="body2"
                  sx={{
                    color: "#27ae60",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Crear cuenta
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
