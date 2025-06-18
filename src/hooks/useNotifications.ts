/**
 * Hook simple para notificaciones
 * Temporalmente usa alert, pero puede ser reemplazado con una librería de toast/snackbar
 */
import { useCallback } from "react";

export interface NotificationOptions {
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  duration?: number;
}

export const useNotifications = () => {
  const showNotification = useCallback((options: NotificationOptions) => {
    // Temporalmente usar alert, idealmente usar una librería como react-hot-toast
    const icon =
      options.severity === "success"
        ? "✅"
        : options.severity === "error"
        ? "❌"
        : options.severity === "warning"
        ? "⚠️"
        : "ℹ️";

    alert(`${icon} ${options.message}`);
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      showNotification({ message, severity: "success" });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string) => {
      showNotification({ message, severity: "error" });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string) => {
      showNotification({ message, severity: "warning" });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string) => {
      showNotification({ message, severity: "info" });
    },
    [showNotification]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
