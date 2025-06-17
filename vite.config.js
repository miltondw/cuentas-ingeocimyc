import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const prod = mode === "production";

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
        manifest: {
          name: "Cuentas Ingeocimyc",
          short_name: "Ingeocimyc",
          description: "Sistema de gestión para Ingeocimyc",
          theme_color: "#ffffff",
          background_color: "#ffffff",
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
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern:
                /^https:\/\/api-cuentas-zlut\.onrender\.com\/api\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semana
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(js|css|json)$/,
              handler: "StaleWhileRevalidate",
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@api": resolve(__dirname, "./src/services/api"),
        "@components": resolve(__dirname, "./src/components"),
        "@features": resolve(__dirname, "./src/features"),
        "@hooks": resolve(__dirname, "./src/hooks"),
        "@lib": resolve(__dirname, "./src/lib"),
        "@services": resolve(__dirname, "./src/services"),
        "@stores": resolve(__dirname, "./src/stores"),
        "@types": resolve(__dirname, "./src/types"),
        "@utils": resolve(__dirname, "./src/utils"),
        "@assets": resolve(__dirname, "./src/assets"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: process.env.NODE_ENV !== "production",
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "mui-vendor": [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled",
            ],
            "data-vendor": ["@tanstack/react-query", "axios"],
          },
        },
      },
    },
    server: {
      port: 5173,
    },
  };
});
