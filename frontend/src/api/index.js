const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, ""); // 終端スラ無し

let _token = localStorage.getItem("token") || "";

export function setToken(t) {
  _token = t || "";
  if (_token) localStorage.setItem("token", _token);
  else localStorage.removeItem("token");
}

export function getToken() {
  return _token;
}

async function req(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: "omit"
  });

  // 401は呼び出し側で扱いやすいように明示
  if (res.status === 401) {
    throw new Error("AUTH_401");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP_${res.status}:${text.slice(0,200)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

// ---- Auth ----
export async function apiRegister({ username = "", email = "", password }) {
  return req("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password })
  });
}

export async function apiLogin({ username, password }) {
  const data = await req("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  setToken(data.access);
  return data;
}

export async function apiMe() {
  return req("/api/auth/me/");
}

// ---- Data ----
export async function apiDailyRoute() {
  return req("/api/daily-route/");
}

export async function apiDailySummary(goal = 12000) {
  const q = new URLSearchParams({ goal: String(goal) });
  return req(`/api/daily-summary/?${q}`);
}

export async function apiHeatmap() {
  return req("/api/heatmap-data/");
}

export async function apiWeeklyForecast() {
  return req("/api/weekly-forecast/");
}
