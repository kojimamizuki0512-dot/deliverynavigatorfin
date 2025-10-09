// ===== API ラッパ =====

// 環境変数（Railway Frontend Variables に VITE_API_BASE を設定）
const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
const FALLBACK_BASE = "";
export const API_BASE = (ENV_BASE || FALLBACK_BASE) || "";

// Token の保管（当面は未使用）
const KEY = "dnf_token";
export function getToken() { return localStorage.getItem(KEY) || ""; }
export function setToken(t) { if (t) localStorage.setItem(KEY, t); }
export function clearToken() { localStorage.removeItem(KEY); }

// 端末ID（匿名ユーザー識別）
const DID_KEY = "dnf_device_id";
function getDeviceId() {
  let id = localStorage.getItem(DID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || String(Math.random()).slice(2);
    localStorage.setItem(DID_KEY, id);
  }
  return id;
}

// 共通 fetch（Cookie/資格情報は送らない）
async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/api/${path}`}`;

  const headers = new Headers(opts.headers || {});
  headers.set("X-Device-Id", getDeviceId()); // ★匿名IDを常に送付
  if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const { credentials, ...rest } = opts; // 念のため除去（Cookie送らない）
  const res = await fetch(url, { ...rest, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    try { err.data = JSON.parse(text); } catch { err.data = { detail: text || "error" }; }
    throw err;
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  // ヘルス
  healthz: () => apiFetch("/api/healthz/"),

  // 認証系（当面使わないが残す）
  register: (username, password, email) =>
    apiFetch("/api/auth/register/", { method: "POST", body: JSON.stringify({ username, password, email }) }),
  login: (username, password) =>
    apiFetch("/api/auth/login/", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => apiFetch("/api/auth/me/"),

  // データ取得（匿名OK）
  dailyRoute: () => apiFetch("/api/daily-route/"),
  dailySummary: (goal = 12000) => apiFetch(`/api/daily-summary/?goal=${goal}`),
  weeklyForecast: () => apiFetch("/api/weekly-forecast/"),
  monthlyTotal: () => apiFetch("/api/monthly-total/"),

  // 実績
  listRecords: () => apiFetch("/api/records/"),
  createRecord: (payload) => apiFetch("/api/records/", { method: "POST", body: JSON.stringify(payload) }),
};
