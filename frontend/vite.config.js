import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const port = Number(process.env.PORT || 4173)

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  preview: {
    host: true,
    port,
    allowedHosts: [
      'localhost',
      /\.up\.railway\.app$/,
      /\.railway\.app$/
    ]
  }
})
