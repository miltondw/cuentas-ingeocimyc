import { useContext } from "react";
import { ServiceRequestContext } from "../contexts/ServiceRequestContext";
import { ServiceRequestContextType } from "../ServiceRequestContext";

/**
 * Hook para usar el contexto de solicitudes de servicio
 * Debe ser usado dentro de un ServiceRequestProvider
 */
export const useServiceRequest = (): ServiceRequestContextType => {
  const context = useContext(ServiceRequestContext);
  if (!context) {
    throw new Error(
      "useServiceRequest must be used within a ServiceRequestProvider"
    );
  }
  return context;
};
