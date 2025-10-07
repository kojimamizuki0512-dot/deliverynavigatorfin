// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Railway から渡されるポートを使う（ローカルは 4173 のまま）
const port = Number(process.env.PORT || 4173)

// ここを “文字列のホスト名” で許可するのがポイント
const allowed = [
  'localhost',
  '127.0.0.1',
  'rare-caring-production-e448.up.railway.app', // ← 公開URLをそのまま入れる
]

export default defineConfig({
  plugins: [react()],

  // 開発用（vite dev）。今回の原因ではないけど念のため同様に許可。
  server: {
    host: true,
    allowedHosts: allowed,
  },

  // 本番プレビュー（vite preview）— Railway ではこれが使われています
  preview: {
    host: true,
    port,
    allowedHosts: allowed,
  },
})
