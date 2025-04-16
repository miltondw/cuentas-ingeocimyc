import { useState } from "react";
import { TextField, Button, Typography, Container, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setRemainingAttempts(null);

    try {
      const result = await login(email, password);
      console.log("Resultado del login:", result);
      if (result.success) {
        navigate("/lab/proyectos");
      } else {
        // Manejar diferentes tipos de errores
        if (result.status === 429) {
          const waitMinutes = result.error.waitMinutes || 15;
          setError(`Cuenta temporalmente bloqueada. Intente nuevamente en ${waitMinutes} minutos.`);
        } else if (result.status === 401 && result.error.remainingAttempts) {
          setRemainingAttempts(result.error.remainingAttempts);
          setError("Credenciales incorrectas");
        } else {
          setError(result.error.message || "Error al iniciar sesión");
        }
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Error al conectar con el servidor. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" gutterBottom>Iniciar Sesión</Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

      {remainingAttempts !== null && (
        <Alert severity="warning" sx={{ my: 2 }}>
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
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          variant="contained"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </Container>
  );
};

export default Login;