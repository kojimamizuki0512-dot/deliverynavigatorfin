import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Railway のドメイン変化でも落ちないように preview でホスト全面許可
export default defineConfig(() => {
  const port = Number(process.env.PORT || 8080);
  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port,          // ローカル用
      strictPort: false
    },
    preview: {
      host: "0.0.0.0",
      port,          // Railway が注入する $PORT を使う
      strictPort: false,
      allowedHosts: true // ★ これで「Blocked request」が出ない
    }
  };
});
