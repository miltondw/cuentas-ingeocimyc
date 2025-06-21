/**
 * Utilidades para formatear fechas
 * @file dateFormatter.ts
 */

/**
 * Formatea una fecha para mostrar en formato local español
 * @param dateString - String de fecha en formato ISO
 * @returns Fecha formateada
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formatea una fecha con hora en formato local español
 * @param dateString - String de fecha en formato ISO
 * @returns Fecha y hora formateada
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea una fecha de forma relativa (hace X días, etc.)
 * @param dateString - String de fecha en formato ISO
 * @returns Fecha en formato relativo
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Hoy";
  } else if (diffInDays === 1) {
    return "Ayer";
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months > 1 ? "es" : ""}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Hace ${years} año${years > 1 ? "s" : ""}`;
  }
}
