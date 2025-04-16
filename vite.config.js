import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const prod = false;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      srcDir: "src",
      filename: "sw.js",
      strategies: "injectManifest",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // Habilita el Service Worker en desarrollo
      },
      includeAssets: ["favicon.ico", "logo-ingeocimyc.svg"],
      manifest: {
        name: "Cuentas Ingeocimyc",
        short_name: "Ingeocimyc",
        description: "Gestión de proyectos y cuentas para Ingeocimyc",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/logo-ingeocimyc.svg",
            sizes: "192x192",
            type: "image/svg",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api-cuentas-zlut\.onrender\.com\/api\/.*/i,
            handler: "NetworkOnly", // Las solicitudes a la API no se cachean directamente
            options: {
              backgroundSync: {
                name: "api-sync-queue",
                options: {
                  maxRetentionTime: 24 * 60, // Retener solicitudes en cola por 24 horas
                },
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: prod
          ? "http://localhost:5050"
          : "https://api-cuentas-zlut.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
