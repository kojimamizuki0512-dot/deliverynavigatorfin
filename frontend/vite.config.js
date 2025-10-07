// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const port = Number(process.env.PORT || 4173)

export default defineConfig({
  plugins: [react()],
  // 開発時はどこからでも叩けるように
  server: { host: true },
  // 本番プレビュー (vite preview)
  preview: {
    host: true,
    port,
    // ← ここがポイント
    allowedHosts: [
      'localhost',
      /\.up\.railway\.app$/,  // Railway の発行ドメイン全部許可
      /\.railway\.app$/       // 互換のため
    ]
  }
})
