// API クライアント（トークン付与＆401ハンドリング）
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function getToken() {
  return localStorage.getItem("access_token") || "";
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resp = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (resp.status === 401) {
    // 未ログイン→呼び出し側でログインUIを出す
    throw new Error("UNAUTHORIZED");
  }
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `HTTP ${resp.status}`);
  }
  const ct = resp.headers.get("content-type") || "";
  return ct.includes("application/json") ? resp.json() : resp.text();
}

export const api = {
  register: (payload) =>
    request("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login/", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/me/"),
  dailyRoute: () => request("/daily-route/"),
  dailySummary: (goal = 12000) => request(`/daily-summary/?goal=${goal}`),
  heatmap: () => request("/heatmap-data/"),
  weeklyForecast: () => request("/weekly-forecast/"),
  records: {
    list: () => request("/records/"),
    create: (payload) => request("/records/", { method: "POST", body: JSON.stringify(payload) }),
  },
};
