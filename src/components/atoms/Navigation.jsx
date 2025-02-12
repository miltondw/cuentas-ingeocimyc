import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";

// Definimos los grupos de rutas
const createPages = [
  { title: "Proyecto", link: "crear-proyecto" },
  { title: "Gasto del Mes", link: "crear-gasto-mes" },
];
const tablePages = [
  { title: "Proyectos", link: "proyectos" },
  { title: "Utilidades", link: "utilidades" },
  { title: "Gastos", link: "gastos" },
];

const settings = ["perfil", "cerrar sesión"];

function ResponsiveAppBar() {
  // Estados para el menú mobile principal y para los menús anidados mobile
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElMobileCrear, setAnchorElMobileCrear] = React.useState(null);
  const [anchorElMobileTablas, setAnchorElMobileTablas] = React.useState(null);

  // Estados para los menús desktop (crear y tablas)
  const [anchorElCrear, setAnchorElCrear] = React.useState(null);
  const [anchorElTablas, setAnchorElTablas] = React.useState(null);

  const [anchorElUser, setAnchorElUser] = React.useState(null);

  // Handlers para menú mobile principal
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Handlers para menú mobile "Crear"
  const handleOpenMobileCrear = (event) => {
    setAnchorElMobileCrear(event.currentTarget);
    // Cerrar el menú principal para no solapar
    setAnchorElNav(null);
  };
  const handleCloseMobileCrear = () => {
    setAnchorElMobileCrear(null);
  };

  // Handlers para menú mobile "Tablas"
  const handleOpenMobileTablas = (event) => {
    setAnchorElMobileTablas(event.currentTarget);
    setAnchorElNav(null);
  };
  const handleCloseMobileTablas = () => {
    setAnchorElMobileTablas(null);
  };

  // Handlers para menú desktop "Crear"
  const handleOpenCrear = (event) => {
    setAnchorElCrear(event.currentTarget);
  };
  const handleCloseCrear = () => {
    setAnchorElCrear(null);
  };

  // Handlers para menú desktop "Tablas"
  const handleOpenTablas = (event) => {
    setAnchorElTablas(event.currentTarget);
  };
  const handleCloseTablas = () => {
    setAnchorElTablas(null);
  };

  // Handlers para menú de usuario (avatar)
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "roboto",
                fontWeight: 700,
                color: "#fff",
                alignItems: "center",
              }}
            >
              <img
                src="/logo-ingeocimyc.svg"
                alt="logo ingeocimyc"
                width="90px"
              />
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.8rem",
                }}
              >
                INGEOCIMYC{" "}
                <span style={{ fontSize: "0.55rem" }}>
                  LABORATORIO DE GEOTECNIA Y CONCRETOS
                </span>
              </span>
            </Typography>
          </Link>

          {/* Menú mobile */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu mobile"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar-mobile"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {/* Opción "Crear" en mobile */}
              <MenuItem onClick={handleOpenMobileCrear}>
                <Typography textAlign="center">Crear</Typography>
              </MenuItem>
              <Menu
                id="menu-mobile-crear"
                anchorEl={anchorElMobileCrear}
                open={Boolean(anchorElMobileCrear)}
                onClose={handleCloseMobileCrear}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                {createPages.map((page) => (
                  <MenuItem
                    key={page.link}
                    onClick={handleCloseMobileCrear}
                    component={Link}
                    to={`/${page.link}`}
                  >
                    {page.title}
                  </MenuItem>
                ))}
              </Menu>

              {/* Opción "Tablas" en mobile */}
              <MenuItem onClick={handleOpenMobileTablas}>
                <Typography textAlign="center">Tablas</Typography>
              </MenuItem>
              <Menu
                id="menu-mobile-tablas"
                anchorEl={anchorElMobileTablas}
                open={Boolean(anchorElMobileTablas)}
                onClose={handleCloseMobileTablas}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                {tablePages.map((page) => (
                  <MenuItem
                    key={page.link}
                    onClick={handleCloseMobileTablas}
                    component={Link}
                    to={`/${page.link}`}
                  >
                    {page.title}
                  </MenuItem>
                ))}
              </Menu>
            </Menu>
          </Box>

          {/* Menú desktop */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
              mr: 2,
            }}
          >
            {/* Menú desplegable "Crear" */}
            <Button
              onClick={handleOpenCrear}
              sx={{ my: 2, color: "#fff", display: "block", mr: 2 }}
            >
              Crear
            </Button>
            <Menu
              id="menu-crear-desktop"
              anchorEl={anchorElCrear}
              open={Boolean(anchorElCrear)}
              onClose={handleCloseCrear}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {createPages.map((page) => (
                <MenuItem
                  key={page.link}
                  onClick={handleCloseCrear}
                  component={Link}
                  to={`/${page.link}`}
                >
                  {page.title}
                </MenuItem>
              ))}
            </Menu>

            {/* Menú desplegable "Tablas" */}
            <Button
              onClick={handleOpenTablas}
              sx={{ my: 2, color: "#fff", display: "block" }}
            >
              Tablas
            </Button>
            <Menu
              id="menu-tablas-desktop"
              anchorEl={anchorElTablas}
              open={Boolean(anchorElTablas)}
              onClose={handleCloseTablas}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {tablePages.map((page) => (
                <MenuItem
                  key={page.link}
                  onClick={handleCloseTablas}
                  component={Link}
                  to={`/${page.link}`}
                >
                  {page.title}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Menú de usuario */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar-user"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
