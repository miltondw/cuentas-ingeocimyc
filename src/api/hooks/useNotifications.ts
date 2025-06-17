/**
 * Servicio de notificaciones para mejorar la experiencia del usuario
 * Integra diferentes tipos de notificaciones y gestión de estado
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

export interface UseNotificationsOptions {
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface UseNotificationsResult {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  showSuccess: (message: string, options?: Partial<Notification>) => string;
  showError: (message: string, options?: Partial<Notification>) => string;
  showWarning: (message: string, options?: Partial<Notification>) => string;
  showInfo: (message: string, options?: Partial<Notification>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
}

let notificationCounter = 0;

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
  const {
    maxNotifications = 5,
    defaultDuration = 5000,
  } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  // Generar ID único para notificaciones
  const generateId = useCallback(() => {
    return `notification-${++notificationCounter}-${Date.now()}`;
  }, []);

  // Función para remover notificación
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Limpiar timeout si existe
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  // Función para mostrar notificación
  const showNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = generateId();
    const duration = notificationData.duration ?? defaultDuration;
    
    const notification: Notification = {
      ...notificationData,
      id,
      createdAt: new Date(),
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      
      // Limitar número máximo de notificaciones
      if (newNotifications.length > maxNotifications) {
        const removed = newNotifications.slice(maxNotifications);
        removed.forEach(n => {
          const timeout = timeoutsRef.current.get(n.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(n.id);
          }
        });
        return newNotifications.slice(0, maxNotifications);
      }
      
      return newNotifications;
    });    // Configurar auto-remove si no es persistente
    if (!notification.persistent && duration > 0) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, duration) as unknown as number;
      
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, [generateId, defaultDuration, maxNotifications, removeNotification]);

  // Funciones de conveniencia para diferentes tipos
  const showSuccess = useCallback((message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'success',
      message,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'error',
      message,
      duration: 0, // Los errores son persistentes por defecto
      persistent: true,
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'warning',
      message,
      duration: 7000, // Warnings duran más tiempo
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, options?: Partial<Notification>) => {
    return showNotification({
      type: 'info',
      message,
      ...options,
    });
  }, [showNotification]);
  // Función para limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    // Limpiar todos los timeouts
    const timeouts = timeoutsRef.current;
    timeouts.forEach(timeout => clearTimeout(timeout));
    timeouts.clear();
    
    setNotifications([]);
  }, []);

  // Función para actualizar notificación existente
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);
  // Limpiar timeouts al desmontar
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
    updateNotification,
  };
}

// Hook para notificaciones específicas de API
export function useApiNotifications() {
  const notifications = useNotifications({
    maxNotifications: 3,
    defaultDuration: 4000,
  });

  const notifyApiSuccess = useCallback((operation: string, details?: string) => {
    return notifications.showSuccess(
      `${operation} completado exitosamente${details ? `: ${details}` : ''}`,
      { title: 'Operación Exitosa' }
    );
  }, [notifications]);

  const notifyApiError = useCallback((operation: string, error: string | Error) => {
    const errorMessage = error instanceof Error ? error.message : error;
    return notifications.showError(
      `Error en ${operation}: ${errorMessage}`,
      { 
        title: 'Error de Operación',
        actions: [
          {
            label: 'Reintentar',
            action: () => {
              // Esta función será sobrescrita por el componente que use el hook
              console.log('Reintentando operación...');
            },
            variant: 'outlined',
            color: 'primary',
          }
        ]
      }
    );
  }, [notifications]);

  const notifyNetworkError = useCallback(() => {
    return notifications.showWarning(
      'Sin conexión a internet. Los cambios se guardarán cuando se restablezca la conexión.',
      { 
        title: 'Conexión Perdida',
        persistent: true,
        actions: [
          {
            label: 'Verificar',
            action: () => {
              if (navigator.onLine) {
                notifications.showSuccess('Conexión restablecida');
              }
            },
            variant: 'outlined',
            color: 'primary',
          }
        ]
      }
    );
  }, [notifications]);

  const notifyDataSaved = useCallback((itemType: string) => {
    return notifications.showSuccess(
      `${itemType} guardado correctamente`,
      { duration: 2000 }
    );
  }, [notifications]);

  const notifyDataDeleted = useCallback((itemType: string) => {
    return notifications.showSuccess(
      `${itemType} eliminado correctamente`,
      { duration: 2000 }
    );
  }, [notifications]);

  return {
    ...notifications,
    notifyApiSuccess,
    notifyApiError,
    notifyNetworkError,
    notifyDataSaved,
    notifyDataDeleted,
  };
}

export default useNotifications;
