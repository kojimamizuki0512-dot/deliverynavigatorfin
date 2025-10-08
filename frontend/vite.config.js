import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const port = Number(process.env.PORT || 8080);
  return {
    plugins: [react()],
    server: { host: "0.0.0.0", port, strictPort: false },
    preview: {
      host: "0.0.0.0",
      port,
      strictPort: false,
      allowedHosts: true // ← Railway ドメインでもブロックしない
    }
  };
});
