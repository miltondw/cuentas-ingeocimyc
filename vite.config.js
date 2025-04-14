import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const prod = false;

export default defineConfig({
  plugins: [react()],
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
  build: {
    outDir: "dist", // Directorio de salida para los archivos construidos
    sourcemap: false, // Desactiva los sourcemaps en producción
    minify: "terser", // Minifica el código para producción
    terserOptions: {
      compress: {
        drop_console: true, // Elimina los console.log en producción
      },
    },
  },
});
