// frontend/src/api/index.js
const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, ""); // 末尾スラ無し
const API = `${BASE}/api`;

const LS_ACCESS = "dn_access";
const LS_REFRESH = "dn_refresh";

export function getAccessToken() {
  return localStorage.getItem(LS_ACCESS);
}
export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(LS_ACCESS, access);
  if (refresh) localStorage.setItem(LS_REFRESH, refresh);
}
export function clearTokens() {
  localStorage.removeItem(LS_ACCESS);
  localStorage.removeItem(LS_REFRESH);
}

async function request(path, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  const tk = getAccessToken();
  if (tk) headers.set("Authorization", `Bearer ${tk}`);

  const res = await fetch(`${API}${path}`, { ...opts, headers, credentials: "omit" });
  if (res.status === 401) {
    // 認証切れはフロントでログインに戻す
    const err = new Error("AUTH");
    err.code = "AUTH";
    throw err;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  // JSON以外（/root 等の文字列OK）にも優しく
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ---- Auth ----
export async function register({ username, password, email = "" }) {
  const body = JSON.stringify({ username, password, email });
  const r = await request(`/auth/register/`, { method: "POST", body });
  // r = { access, refresh, ... }
  setTokens(r);
  return r;
}
export async function login({ username, password }) {
  const body = JSON.stringify({ username, password });
  const r = await request(`/auth/login/`, { method: "POST", body });
  setTokens(r);
  return r;
}
export async function me() {
  return request(`/auth/me/`, { method: "GET" });
}

// ---- Dummy business APIs (auth 必須) ----
export async function dailyRoute() {
  return request(`/daily-route/`);
}
export async function dailySummary(goal = 12000) {
  return request(`/daily-summary/?goal=${encodeURIComponent(goal)}`);
}
export async function heatmapData() {
  return request(`/heatmap-data/`);
}
export async function weeklyForecast() {
  return request(`/weekly-forecast/`);
}

// ---- Records（ユーザー個別データ）----
export async function listRecords() {
  return request(`/records/`);
}
export async function createRecord(payload) {
  return request(`/records/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// フロント単体デモ用フォールバック（ネットワークや401時）
export function demoDailyRoute() {
  const now = new Date();
  const times = [0, 30, 60, 90, 120, 150].map((m) => {
    const d = new Date(now.getTime() + m * 60000);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  });
  return [
    { time: times[0], title: "Stay in Dogenzaka cluster", icon: "pin" },
    { time: times[1], title: "Reposition to Ebisu", icon: "car" },
    { time: times[2], title: "Peak around station", icon: "bolt" },
    { time: times[3], title: "Wait near hotspot", icon: "clock" },
    { time: times[4], title: "Shift to East Gate", icon: "route" },
    { time: times[5], title: "Peak around station", icon: "bolt" },
  ];
}
export function demoSummary(goal = 12000) {
  return {
    progress: 0.68,
    earned: 10168,
    hourly: 2324,
    workHours: 4.2,
    goal,
    predicted: 13889,
  };
}
export function demoHeat() {
  // ダミー座標
  return [{ x: 0.6, y: 0.4, weight: 0.9 }];
}
