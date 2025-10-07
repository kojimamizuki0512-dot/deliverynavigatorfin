// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const port = Number(process.env.PORT || 4173)

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  preview: {
    host: true,
    port,
    // ← Railway で発行された “そのままの” ドメインを列挙
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'rare-caring-production-e448.up.railway.app', // ← あなたのフロントURL
    ],
  },
})
