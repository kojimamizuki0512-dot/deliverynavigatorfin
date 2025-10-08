// frontend/src/api/index.js
// Vite の環境変数から API ベース URL を取得（末尾スラッシュや /api の有無を吸収）
const raw = (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
export const API_BASE = raw.endsWith("/api") ? raw : `${raw}/api`;

// ---- Token utils (App.jsx が import する想定) ----
const TOKEN_KEY = "dn.token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

// ---- 共通 fetch ----
async function request(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");

  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    // JWT を使っているので cookie は不要
    credentials: "omit",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : await res.text();

  // 未ログインは「エラーではあるが例外にしない」で返す（初期化を止めない）
  if (res.status === 401) {
    return { ok: false, status: 401, data: body };
  }

  if (!res.ok) {
    const msg =
      (body && body.detail) ||
      (typeof body === "string" ? body : "Request failed");
    const err = new Error(msg);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  return { ok: true, status: res.status, data: body };
}

// ---- API surface ----
export const api = {
  health() {
    return request("/healthz/");
  },
  me() {
    return request("/auth/me/");
  },
  register({ username, email, password }) {
    return request("/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },
  async login({ username, password }) {
    const r = await request("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (r.ok && r.data?.access) setToken(r.data.access);
    return r;
  },
  dailyRoute() {
    return request("/daily-route/");
  },
  dailySummary(goal = 12000) {
    return request(`/daily-summary/?goal=${encodeURIComponent(goal)}`);
  },
  heatmap() {
    return request("/heatmap-data/");
  },
  weeklyForecast() {
    return request("/weekly-forecast/");
  },
};
