// ==== API クライアント ====
// フロント -> バックエンドの呼び出しを一箇所に集約
// App.jsx からは { api, setToken, getToken } を import できます。

const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

// ---- Token helpers (App.jsxから使うのでexport) ----
export function getToken() {
  try { return localStorage.getItem("access") || ""; } catch { return ""; }
}
export function setToken(access, refresh) {
  try {
    if (access) localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
  } catch {}
}
export function clearToken() {
  try {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  } catch {}
}

// ---- 共通fetch ----
async function request(path, { method = "GET", headers = {}, body } = {}) {
  const h = { "Content-Type": "application/json", ...headers };
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { method, headers: h, body });
  if (!res.ok) {
    // エラー本文を拾ってメッセージ化
    let detail = "";
    try { detail = await res.text(); } catch {}
    throw new Error(`${res.status} ${res.statusText} :: ${detail}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ---- 認証API ----
async function register({ username, email, password }) {
  return request("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}
async function login({ username, password }) {
  const data = await request("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.access, data.refresh);
  return data;
}
async function me() { return request("/api/auth/me/"); }
function logout() { clearToken(); }

// ---- アプリデータAPI ----
function dailyRoute()              { return request("/api/daily-route/"); }
function dailySummary(goal = 12000){ return request(`/api/daily-summary/?goal=${goal}`); }
function heatmap()                 { return request("/api/heatmap-data/"); }
function weeklyForecast()          { return request("/api/weekly-forecast/"); }
function createRecord(payload)     { return request("/api/records/", { method: "POST", body: JSON.stringify(payload) }); }
function listRecords()             { return request("/api/records/"); }

// ---- export ----
export const auth = { register, login, me, logout };
export const data = { dailyRoute, dailySummary, heatmap, weeklyForecast, createRecord, listRecords };

// App.jsx が使う { api } も提供
export const api = {
  ...auth,
  ...data,
  request,
  BASE,
};

// default も付けておくと import api from "./api" にも対応できる
export default api;
