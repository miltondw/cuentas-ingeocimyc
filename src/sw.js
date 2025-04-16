import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, Route } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";

// Cachear los recursos generados por Vite
precacheAndRoute(self.__WB_MANIFEST);

// Configurar sincronización en segundo plano para las solicitudes a la API
const apiRoute = new Route(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin("api-sync-queue", {
        maxRetentionTime: 24 * 60, // Retener por 24 horas
      }),
    ],
  })
);

registerRoute(apiRoute);

// Escuchar eventos de sincronización
self.addEventListener("sync", (event) => {
  if (event.tag === "api-sync-queue") {
    console.log("Sincronizando datos encolados...");
  }
});
