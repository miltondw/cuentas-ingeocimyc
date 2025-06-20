import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ClientServiceRequestForm } from "../components/ClientServiceRequestForm";
import type { ServiceRequest } from "@/types/serviceRequests";

/**
 * Página de formulario de solicitud para clientes
 * Usa el componente ClientServiceRequestForm migrado desde components/client
 */
const ClientRequestFormPage = () => {
  const navigate = useNavigate();

  const handleSuccess = useCallback((serviceRequest: ServiceRequest) => {
    // Aquí podrías redirigir a una página de detalles o dashboard
    // navigate(`/solicitud/${serviceRequest.id}`);
  }, []);

  const handleCancel = useCallback(() => {
    // Redirigir al dashboard o página anterior
    navigate(-1);
  }, [navigate]);

  return (
    <ClientServiceRequestForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default ClientRequestFormPage;
