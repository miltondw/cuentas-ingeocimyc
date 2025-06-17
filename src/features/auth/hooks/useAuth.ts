import { useContext } from "react";
import { AuthContext } from "@/features/auth/context";

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Proporciona todas las funcionalidades relacionadas con la autenticación del usuario
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
};
