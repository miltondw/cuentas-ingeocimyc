/**
 * Hook para notificaciones usando el sistema centralizado de MainLayout
 * Utiliza eventos personalizados para mostrar notificaciones tipo Snackbar
 */
import { useCallback } from "react";

export interface NotificationOptions {
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  duration?: number;
}

// Función utilitaria para disparar eventos de notificación
const dispatchNotification = (options: NotificationOptions) => {
  const event = new CustomEvent("app:notification", {
    detail: {
      message: options.message,
      severity: options.severity || "info",
    },
  });
  window.dispatchEvent(event);
};

export const useNotifications = () => {
  const showNotification = useCallback((options: NotificationOptions) => {
    dispatchNotification(options);
  }, []);

  const showSuccess = useCallback((message: string) => {
    dispatchNotification({ message, severity: "success" });
  }, []);

  const showError = useCallback((message: string) => {
    dispatchNotification({ message, severity: "error" });
  }, []);

  const showWarning = useCallback((message: string) => {
    dispatchNotification({ message, severity: "warning" });
  }, []);

  const showInfo = useCallback((message: string) => {
    dispatchNotification({ message, severity: "info" });
  }, []);

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
