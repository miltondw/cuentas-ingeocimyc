import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
   base: '/',
  server: {
    open: true,
  },
/*  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/localhost.pem')),
    },
    host: 'localhost', // Asegúrate de que el servidor escuche en localhost
    port: 5173,        // Asegúrate de que el puerto sea 5173
  },*/
});