// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const prod = false;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      strategies: "generateSW",
      includeAssets: ["favicon.ico", "logo-ingeocimyc.svg", "icons/*.png"],
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
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api-cuentas-zlut\.onrender\.com\/api\/.*/i,
            handler: "NetworkOnly",
            options: {
              backgroundSync: {
                name: "api-sync-queue",
                options: {
                  maxRetentionTime: 24 * 60,
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
