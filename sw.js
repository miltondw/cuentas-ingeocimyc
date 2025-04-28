// sw.js
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";

precacheAndRoute(self.__WB_MANIFEST);

// Cachear imágenes con CacheFirst
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
  })
);

// Cachear CSS y JavaScript con StaleWhileRevalidate
registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "script",
  new StaleWhileRevalidate({
    cacheName: "static-resources",
  })
);

// Cachear datos de la API con NetworkFirst y BackgroundSync
registerRoute(
  ({ url }) => url.pathname.startsWith("/src/api/"),
  new NetworkFirst({
    cacheName: "api-data",
    plugins: [
      new BackgroundSyncPlugin("api-sync-queue", {
        maxRetentionTime: 24 * 60, // 24 horas
      }),
    ],
  })
);

self.addEventListener("sync", (event) => {
  if (event.tag === "api-sync-queue") {
    event.waitUntil(
      // Aquí iría la lógica para reenviar las peticiones fallidas
      console.log("Sincronizando datos encolados...")
    );
  }
});
