import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerSW } from "virtual:pwa-register";

// Registrar service worker con actualizaciones periódicas
const updateSW = registerSW({
  onNeedRefresh() {
    // Cuando hay una nueva versión disponible
    if (confirm("Nueva versión disponible. ¿Recargar para actualizar?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.info("La aplicación está lista para uso sin conexión");
  },
  onRegistered(r) {
    console.info("Service worker registrado correctamente");

    // Verificar actualizaciones cada hora si la aplicación permanece abierta
    if (import.meta.env.PROD && r) {
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error("Error al registrar service worker:", error);
  },
});

// Montar la aplicación en el DOM
const container = document.getElementById("root") as HTMLElement;
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
