// ===== API ラッパ（匿名端末IDヘッダー版） =====

// Railway の Frontend Variables に VITE_API_BASE を設定
// 例: https://deliverynavigatorfin-production.up.railway.app
const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
export const API_BASE = ENV_BASE || "";

const DID_KEY = "dnf_device_id";
function getDeviceId() {
  let id = localStorage.getItem(DID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Math.random()).slice(2) + Date.now();
    localStorage.setItem(DID_KEY, id);
  }
  return id;
}

// 旧トークン系との互換（現在は未使用だが、import されてもビルドが通るように残す）
const TOKEN_ACCESS = "access_token";
const TOKEN_REFRESH = "refresh_token";
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_ACCESS);
  } catch {
    return null;
  }
}
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_ACCESS);
    localStorage.removeItem(TOKEN_REFRESH);
  } catch {}
}

// 共通 fetch
// - path は '/api/xxx' か 'xxx'（相対なら /api/xxx へ）
// - 認証Cookie等は使わないので credentials は "omit"
// - 端末識別ヘッダー X-Device-Id を毎回付与
async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/api/${path}`}`;

  const headers = new Headers(opts.headers || {});
  headers.set("X-Device-Id", getDeviceId());

  if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...opts, headers, credentials: "omit" });

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
  // ダミー：AI ルート（デモ用）
  dailyRoute: async () => {
    return [];
  },

  // ヘルス（使わなくてもOK）
  healthz: () => apiFetch("/api/healthz/"),

  // 実績
  createRecord: (payload) =>
    apiFetch("/api/records/", { method: "POST", body: JSON.stringify(payload) }),
  records: () => apiFetch("/api/records/"),

  // 集計
  monthlyTotal: () => apiFetch("/api/monthly-total/"),
};
