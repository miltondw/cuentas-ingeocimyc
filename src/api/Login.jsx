import { useState } from "react";
import { TextField, Button, Typography, Container } from "@mui/material";
import api from "./index";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/proyectos");
    } catch (err) {
      console.error(err, "login error");
      setError("Credenciales incorrectas");
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
        <Button variant="contained" color="primary" fullWidth type="submit">
          Iniciar sesión
        </Button>
      </form>
    </Container>
  );
};

export default Login;
