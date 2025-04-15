import { createTheme } from "@mui/material/styles";

// Colores sugeridos (reemplázalos con los HEX de tu logo)
const primaryColor = "#0a95a5"; // Verde corporativo
const secondaryColor = "#bcf270"; // Naranja/accent
const textColor = "#333333"; // Gris oscuro

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: secondaryColor,
    },
    text: {
      primary: textColor,
    },
    background: {
      default: "#F5F5F5", // Fondo claro
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: textColor,
        },
      },
    },
  },
});

export default theme;
