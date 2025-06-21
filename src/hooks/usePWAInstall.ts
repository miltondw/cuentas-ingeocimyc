import { useState, useEffect, useCallback, useMemo } from "react";

// Tipos para PWA
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallConfig {
  // Retraso antes de mostrar la primera sugerencia (en días)
  initialDelay: number;
  // Intervalo entre sugerencias (en días)
  reminderInterval: number;
  // Número máximo de veces que se puede mostrar la sugerencia
  maxReminders: number;
  // Mostrar solo en móviles
  mobileOnly: boolean;
}

const DEFAULT_CONFIG: PWAInstallConfig = {
  initialDelay: 3, // 3 días después de la primera visita
  reminderInterval: 7, // Cada 7 días
  maxReminders: 3, // Máximo 3 recordatorios
  mobileOnly: true,
};

const STORAGE_KEYS = {
  FIRST_VISIT: "pwa_first_visit",
  LAST_SHOWN: "pwa_last_shown",
  REMINDER_COUNT: "pwa_reminder_count",
  USER_DISMISSED: "pwa_user_dismissed",
  USER_INSTALLED: "pwa_user_installed",
};

export const usePWAInstall = (config: Partial<PWAInstallConfig> = {}) => {
  // Memoizar la configuración final para evitar cambios en dependencias
  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Verificar si la PWA ya está instalada
  const isInstalled = useCallback(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone ||
      document.referrer.startsWith("android-app://")
    );
  }, []);

  // Verificar si es móvil
  const isMobile = useCallback(() => {
    return /Mobi|Android/i.test(navigator.userAgent);
  }, []);

  // Verificar si se debe mostrar la sugerencia
  const shouldShowSuggestion = useCallback(() => {
    // No mostrar si ya está instalado
    if (isInstalled()) {
      return false;
    }

    // No mostrar en desktop si está configurado solo para móviles
    if (finalConfig.mobileOnly && !isMobile()) {
      return false;
    }

    // No mostrar si el usuario ya descartó permanentemente
    if (localStorage.getItem(STORAGE_KEYS.USER_DISMISSED) === "true") {
      return false;
    }

    // No mostrar si el usuario ya instaló
    if (localStorage.getItem(STORAGE_KEYS.USER_INSTALLED) === "true") {
      return false;
    }

    const now = Date.now();
    const firstVisit = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);

    // Si es la primera visita, guardar timestamp
    if (!firstVisit) {
      localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, now.toString());
      return false;
    }

    const firstVisitTime = parseInt(firstVisit);
    const daysSinceFirstVisit = (now - firstVisitTime) / (1000 * 60 * 60 * 24);

    // No mostrar si no ha pasado el retraso inicial
    if (daysSinceFirstVisit < finalConfig.initialDelay) {
      return false;
    }

    const lastShown = localStorage.getItem(STORAGE_KEYS.LAST_SHOWN);
    const reminderCount = parseInt(
      localStorage.getItem(STORAGE_KEYS.REMINDER_COUNT) || "0"
    );

    // No mostrar si se alcanzó el máximo de recordatorios
    if (reminderCount >= finalConfig.maxReminders) {
      return false;
    }

    // Si nunca se ha mostrado, mostrar ahora
    if (!lastShown) {
      return true;
    }

    const lastShownTime = parseInt(lastShown);
    const daysSinceLastShown = (now - lastShownTime) / (1000 * 60 * 60 * 24);

    // Mostrar si ha pasado el intervalo de recordatorio
    return daysSinceLastShown >= finalConfig.reminderInterval;
  }, [finalConfig, isInstalled, isMobile]);

  // Marcar que se mostró la sugerencia
  const markAsShown = useCallback(() => {
    const now = Date.now();
    const reminderCount = parseInt(
      localStorage.getItem(STORAGE_KEYS.REMINDER_COUNT) || "0"
    );

    localStorage.setItem(STORAGE_KEYS.LAST_SHOWN, now.toString());
    localStorage.setItem(
      STORAGE_KEYS.REMINDER_COUNT,
      (reminderCount + 1).toString()
    );
  }, []);

  // Manejar instalación
  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;

    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.info("Usuario aceptó la instalación de PWA");
        localStorage.setItem(STORAGE_KEYS.USER_INSTALLED, "true");
        setShowBanner(false);
      } else {
        console.info("Usuario rechazó la instalación de PWA");
      }
    } catch (error) {
      console.error("Error durante la instalación de PWA:", error);
    } finally {
      setIsInstalling(false);
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  // Manejar descarte
  const handleDismiss = useCallback((permanent = false) => {
    setShowBanner(false);

    if (permanent) {
      localStorage.setItem(STORAGE_KEYS.USER_DISMISSED, "true");
    }
  }, []);

  // Manejar "Recordar más tarde"
  const handleRemindLater = useCallback(() => {
    markAsShown();
    setShowBanner(false);
  }, [markAsShown]);

  // Configurar listeners de PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);

      // Verificar si se debe mostrar inmediatamente
      if (shouldShowSuggestion()) {
        markAsShown();
        setShowBanner(true);
      }
    };

    // Listener para cuando la app se instala
    const handleAppInstalled = () => {
      console.info("PWA fue instalada");
      localStorage.setItem(STORAGE_KEYS.USER_INSTALLED, "true");
      setShowBanner(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [shouldShowSuggestion, markAsShown]);

  // Verificar periódicamente si se debe mostrar
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (installPrompt && shouldShowSuggestion() && !showBanner) {
        markAsShown();
        setShowBanner(true);
      }
    }, 1000 * 60 * 60); // Verificar cada hora

    return () => clearInterval(checkInterval);
  }, [installPrompt, shouldShowSuggestion, showBanner, markAsShown]);

  return {
    // Estados
    showBanner,
    isInstalling,
    isInstalled: isInstalled(),
    canInstall: !!installPrompt,

    // Acciones
    install: handleInstall,
    dismiss: handleDismiss,
    remindLater: handleRemindLater,

    // Información
    config: finalConfig,
  };
};
