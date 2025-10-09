// ===== API ラッパ（匿名運用対応） =====

// 環境変数（Railway の Frontend Variables に VITE_API_BASE を入れておく）
// 例: https://deliverynavigatorfin-production.up.railway.app
const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");

// 未設定時の最後のフォールバック（同一オリジン想定）
const FALLBACK_BASE = "";

// 最終決定
export const API_BASE = (ENV_BASE || FALLBACK_BASE) || "";

// ---- Token（将来のために残すが匿名では未使用） ----
const KEY_TOKEN = "dnf_token";
export function getToken() { return localStorage.getItem(KEY_TOKEN) || ""; }
export function setToken(t) { if (t) localStorage.setItem(KEY_TOKEN, t); }
export function clearToken() { localStorage.removeItem(KEY_TOKEN); }

// ---- デバイスID（匿名ユーザー識別用） ----
const KEY_DEVICE = "dnf_device_id";
function randomId() {
  return "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
export function getDeviceId() {
  let id = localStorage.getItem(KEY_DEVICE);
  if (!id) {
    id = randomId();
    localStorage.setItem(KEY_DEVICE, id);
  }
  return id;
}

// ---- 共通 fetch ----
// path は '/api/xxx' の絶対 or 'xxx' の相対（相対は /api/xxx に付け替え）
// 匿名運用では Cookie を使わないので credentials は 'omit'
async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/api/${path}`}`;

  const headers = new Headers(opts.headers || {});
  const tk = getToken();
  if (tk) headers.set("Authorization", `Bearer ${tk}`);

  // 匿名識別用ヘッダー
  headers.set("X-Device-Id", getDeviceId());

  if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    method: opts.method || "GET",
    body: opts.body,
    headers,
    // 重要：匿名モードでは Cookie を送らない
    credentials: "omit",
  });

  if (!res.ok) {
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
  // 任意（疎通確認に使う）
  healthz: () => apiFetch("/api/healthz/"),

  // ダッシュボード系（バックは匿名ヘッダー X-Device-Id を見てユーザー紐付け）
  dailyRoute: () => apiFetch("/api/daily-route/"),
  dailySummary: (goal = 120000) => apiFetch(`/api/daily-summary/?goal=${goal}`),

  // 実績
  createRecord: (payload) =>
    apiFetch("/api/records/", { method: "POST", body: JSON.stringify(payload) }),

  // 月間合計（グラフ/カードで利用）
  monthlyTotal: () => apiFetch("/api/monthly-total/"),
};
