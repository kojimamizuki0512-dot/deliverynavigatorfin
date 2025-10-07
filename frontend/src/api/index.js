// フロントエンドから叩くAPIクライアント（Vite環境変数を使用）
const ENV_BASE = (import.meta.env?.VITE_API_BASE || "").replace(/\/+$/, "");

// フォールバック（もし環境変数が空なら、バックエンドの既定URLを使う）
// 必ず末尾スラなし。各エンドポイントで /xxx/ を付ける。
const BASE = ENV_BASE || "https://deliverynavigatorfin-production.up.railway.app/api";

async function http(path, opts = {}) {
  const token = localStorage.getItem("access");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (!res.ok) {
    // 可能ならエラーボディも返す
    let detail = "";
    try {
      const t = await res.text();
      detail = t;
    } catch {
      /* noop */
    }
    throw new Error(`HTTP ${res.status} at ${path}${detail ? `: ${detail}` : ""}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  // 認証
  register: (payload) =>
    http("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    http("/auth/login/", { method: "POST", body: JSON.stringify(payload) }),
  me: () => http("/auth/me/"),

  // ダミーデータ（バックエンドの API に合わせる）
  dailyRoute: () => http("/daily-route/"),
  dailySummary: (goal = 12000) => http(`/daily-summary/?goal=${goal}`),
  heatmap: () => http("/heatmap-data/"),
  weekly: () => http("/weekly-forecast/"),
};

export { BASE as API_BASE };
