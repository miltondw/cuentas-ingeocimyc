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
});
