import { Outlet } from "react-router-dom";
import { Container, Box, Paper } from "@mui/material";

/**
 * Layout para páginas de autenticación (login, registro, etc)
 * Presenta un diseño minimalista centrado
 */
const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
