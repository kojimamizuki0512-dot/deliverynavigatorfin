import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Railway のホスト拒否を無効化（Vite 5）
export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: parseInt(process.env.PORT || '8080', 10),
    allowedHosts: true // ← これで rare-caring-*.up.railway.app が拒否されない
  },
  server: {
    host: true,
    allowedHosts: true
  }
});
