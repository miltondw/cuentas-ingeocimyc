import { useState, FormEvent } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Lock, Email, Visibility, VisibilityOff } from "@mui/icons-material";

interface LoginResponse {
  success: boolean;
  status?: number;
  error?: {
    message?: string;
    waitMinutes?: number;
    remainingAttempts?: number;
  };
}

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setRemainingAttempts(null);

    try {
      const result: LoginResponse = await login(email, password);

      if (result.success) {
        navigate("/lab/proyectos");
      } else {
        handleLoginError(result);
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setError(
        "No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (result: LoginResponse) => {
    if (result.status === 429) {
      const waitMinutes = result.error?.waitMinutes ?? 15;
      setError(
        `Cuenta temporalmente bloqueada. Intente nuevamente en ${waitMinutes} minutos.`
      );
    } else if (result.status === 401 && result.error?.remainingAttempts) {
      setRemainingAttempts(result.error.remainingAttempts);
      setError("Credenciales incorrectas. Por favor verifique sus datos.");
    } else {
      setError(
        result.error?.message ||
          "Error al iniciar sesión. Por favor intente nuevamente."
      );
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <Lock />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Inicio de Sesión
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, alignItems: "center" }}
            variant="filled"
          >
            {error}
          </Alert>
        )}

        {remainingAttempts !== null && (
          <Alert
            severity="warning"
            sx={{ mb: 2, alignItems: "center" }}
            variant="filled"
          >
            Intentos restantes: {remainingAttempts}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            autoComplete="email"
          />

          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            autoComplete="current-password"
          />

          <Button
            variant="contained"
            fullWidth
            type="submit"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            size="large"
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
