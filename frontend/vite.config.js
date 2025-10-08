import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    // Railway では $PORT をスクリプト側で渡すのでここは固定不要
    allowedHosts: true
  },
  build: {
    outDir: "dist"
  }
});
