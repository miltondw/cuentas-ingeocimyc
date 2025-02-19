import React, { useState } from "react";
import { TextField, Button, Typography, Container, CircularProgress } from "@mui/material";
import api from "./index";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Nuevo estado para el loading

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
   const response = await api.post("/auth/login", { email, password });
  // Guardar solo datos públicos en localStorage
  localStorage.setItem("userData", JSON.stringify(response.data.user));
  navigate("/proyectos");
    } catch (err) {
      console.error(err, "login error");
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container maxWidth="xs">
      <Typography variant="h5">Iniciar Sesión</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Correo electrónico"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          type="submit"
          disabled={loading} // Deshabilita el botón mientras se carga
        >
          {loading ? <CircularProgress size={24} /> : 'Iniciar sesión'}
        </Button>
      </form>
    </Container>
  );
};

export default Login;