/**
 * Utilidades para notificaciones - Sin necesidad de hooks
 * @file utils/notifications.ts
 */

export interface NotificationOptions {
  message: string;
  severity?: "success" | "error" | "warning" | "info";
}

/**
 * Función utilitaria para mostrar notificaciones desde cualquier lugar
 * No requiere hooks, puede usarse en servicios, funciones utilitarias, etc.
 */
export const showNotification = (options: NotificationOptions) => {
  const event = new CustomEvent("app:notification", {
    detail: {
      message: options.message,
      severity: options.severity || "info",
    },
  });
  window.dispatchEvent(event);
};

/**
 * Funciones de conveniencia para tipos específicos de notificación
 */
export const showSuccess = (message: string) => {
  showNotification({ message, severity: "success" });
};

export const showError = (message: string) => {
  showNotification({ message, severity: "error" });
};

export const showWarning = (message: string) => {
  showNotification({ message, severity: "warning" });
};

export const showInfo = (message: string) => {
  showNotification({ message, severity: "info" });
};

/**
 * Función para mostrar notificaciones de loading
 */
export const showLoading = () => {
  const event = new CustomEvent("app:loading:start");
  window.dispatchEvent(event);
};

export const hideLoading = () => {
  const event = new CustomEvent("app:loading:end");
  window.dispatchEvent(event);
};
