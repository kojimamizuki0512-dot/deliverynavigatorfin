// ===== API ラッパ =====

// 環境変数（Railway の Frontend Variables に VITE_API_BASE を入れておく）
// 例: https://deliverynavigatorfin-production.up.railway.app
const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");

// どうしても未設定だった時の最後のフォールバック（同一オリジン想定）
const FALLBACK_BASE = "";

// 最終決定
export const API_BASE = (ENV_BASE || FALLBACK_BASE) || "";

// Token の保管（localStorage に保存してページ遷移でも維持）
const KEY = "dnf_token";

export function getToken() {
  return localStorage.getItem(KEY) || "";
}
export function setToken(t) {
  if (t) localStorage.setItem(KEY, t);
}
export function clearToken() {
  localStorage.removeItem(KEY);
}

// 共通 fetch（エラーは呼び出し側でハンドリング）
// path は '/api/xxx' の “絶対” or 'xxx' の “相対”（相対は /api/xxx に直す）
async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/api/${path}`}`;

  const headers = new Headers(opts.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  // ★ 重要：Cookie を送らない（CORS で * を許可していてもブロックされないように）
  //   既定は "same-origin" なので、明示せず送らない運用にする。
  const { credentials, ...rest } = opts;

  const res = await fetch(url, { ...rest, headers });
  if (!res.ok) {
    // 401 は呼び出し側でログアウト誘導
    const text = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    try {
      err.data = JSON.parse(text);
    } catch {
      err.data = { detail: text || "error" };
    }
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  // ヘルスチェック（UI では黙って使う。アラートは出さない）
  healthz: () => apiFetch("/api/healthz/"),

  // 認証
  register: (username, password, email) =>
    apiFetch("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, password, email })
    }),
  login: (username, password) =>
    apiFetch("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password })
    }),
  me: () => apiFetch("/api/auth/me/"),

  // データ取得（ダミーAPI）
  dailyRoute: () => apiFetch("/api/daily-route/"),
  dailySummary: (goal = 12000) => apiFetch(`/api/daily-summary/?goal=${goal}`),

  // 実績保存（バックが未実装でも UI 側でローカル保存にフォールバック）
  createRecord: (payload) =>
    apiFetch("/api/records/", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};
