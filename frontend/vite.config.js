// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // ローカル開発
    port: 5173,
  },
  preview: {
    host: true,                   // Railway で 0.0.0.0 で待受
    port: Number(process.env.PORT) || 8080,
    allowedHosts: "all",          // Railway の *.up.railway.app を許可
  },
});
