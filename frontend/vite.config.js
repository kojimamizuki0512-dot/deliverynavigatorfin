// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // ローカル開発用
    port: 5173,
  },
  preview: {
    host: true,                              // Railway で 0.0.0.0 で待受
    port: Number(process.env.PORT) || 8080,  // Railway のPORTを使う
    strictPort: true,
    // ★ここが修正ポイント：Vite 5.4 では "all" ではなく true か配列を使う
    allowedHosts: true, // すべて許可（必要なら配列版: ['.up.railway.app'] でもOK）
  },
});
