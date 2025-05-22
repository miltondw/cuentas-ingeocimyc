import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const prod = false;

  return {
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
          globPatterns: ["**/*.{js,css,html}"], // Elimina los tipos de archivos que no están presentes
          runtimeCaching: [
            {
              urlPattern:
                /^https:\/\/api-cuentas-zlut\.onrender\.com\/api\/.*/i,
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
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@api": resolve(__dirname, "src/api"),
        "@components": resolve(__dirname, "src/components"),
        "@utils": resolve(__dirname, "src/utils"),
        "@assets": resolve(__dirname, "src/assets"),
      },
    },
  };
});
