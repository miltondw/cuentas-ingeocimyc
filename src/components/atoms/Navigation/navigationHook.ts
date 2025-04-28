import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuConfig, MenuItemConfig } from "./menuConfig";
import { useAuth } from "@api/AuthContext";

export const useResponsiveAppBar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth(); // Asegura el tipo AuthContextType

  // Estados para manejar menús
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Crear estados dinámicos basados en la configuración
  const initialMenuState: Record<string, boolean> = menuConfig.menuItems.reduce(
    (acc: Record<string, boolean>, item) => {
      acc[item.key] = false;
      return acc;
    },
    {}
  );

  const [openSubMenuMobile, setOpenSubMenuMobile] = useState(initialMenuState);
  const [openSubMenuDesktop, setOpenSubMenuDesktop] =
    useState(initialMenuState);
  const [anchorSubMenuDesktop, setAnchorSubMenuDesktop] = useState<
    Record<string, null | HTMLElement>
  >(
    menuConfig.menuItems.reduce((acc: Record<string, null>, item) => {
      acc[item.key] = null;
      return acc;
    }, {} as Record<string, null>)
  );

  const generatePages = useCallback((): Record<string, MenuItemConfig[]> => {
    const result: Record<string, MenuItemConfig[]> = {};
    menuConfig.menuItems.forEach((item) => {
      const normalizedUserRole = user?.rol?.toLowerCase();
      const normalizedItemRoles = item.roles?.map((rol) => rol.toLowerCase());

      if (
        !item.roles ||
        (normalizedItemRoles &&
          normalizedItemRoles.includes(normalizedUserRole))
      ) {
        result[item.key] = [...item.items];
        if (item.adminItems && normalizedUserRole === "admin") {
          result[item.key].push(...item.adminItems);
        }
      }
    });
    return result;
  }, [user]);

  const [pages, setPages] = useState<Record<string, MenuItemConfig[]>>(
    generatePages()
  );

  useEffect(() => {
    setPages(generatePages());
  }, [user, generatePages]);

  // Móvil: Manejo de menús
  const handleOpenMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleToggleSubMenuMobile = useCallback((menu: string) => {
    setOpenSubMenuMobile((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  }, []);

  // Escritorio: Manejo de submenús
  const handleToggleSubMenuDesktop = useCallback(
    (menu: string) => (event: React.MouseEvent<HTMLElement>) => {
      setAnchorSubMenuDesktop((prev) => ({
        ...prev,
        [menu]: event.currentTarget,
      }));
      setOpenSubMenuDesktop((prev) => ({
        ...prev,
        [menu]: !prev[menu],
      }));
    },
    []
  );

  const handleCloseSubMenuDesktop = useCallback((menu: string) => {
    setOpenSubMenuDesktop((prev) => ({
      ...prev,
      [menu]: false,
    }));
  }, []);

  const handleCloseAll = useCallback(() => {
    setAnchorElNav(null);
    setOpenSubMenuMobile(initialMenuState);
    setOpenSubMenuDesktop(initialMenuState);
  }, [initialMenuState]);

  // Manejo de cierre de sesión
  const handleLogout = useCallback(async () => {
    setAnchorElUser(null);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [logout, navigate]);

  // Generar iniciales para avatar
  const getInitials = useCallback(() => {
    if (!user || !user.name) return "?";
    return user.name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [user]);

  return {
    anchorElNav,
    openSubMenuMobile,
    anchorElUser,
    openSubMenuDesktop,
    anchorSubMenuDesktop,
    pages,
    user,
    isAuthenticated,
    setAnchorElUser,
    handleOpenMobileMenu,
    handleToggleSubMenuMobile,
    handleToggleSubMenuDesktop,
    handleCloseSubMenuDesktop,
    handleCloseAll,
    handleLogout,
    getInitials,
    menuConfig,
  };
};
