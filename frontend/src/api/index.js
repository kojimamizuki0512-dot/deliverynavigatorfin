// API 基底URL（末尾スラッシュなしで保持）
const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

// トークン管理（ローカルストレージ）
export function getToken() {
  return localStorage.getItem("token") || "";
}
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function request(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    // Cookie を使わないが将来拡張に備えて
    credentials: "include"
  });

  // 200 以外は例外化（フロントで静かに扱う）
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  // JSON でないレスポンスにも耐性
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const api = {
  register({ username, email, password }) {
    return request("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });
  },
  login({ username, password }) {
    return request("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password })
    }).then((d) => {
      if (d?.access) setToken(d.access);
      return d;
    });
  },
  me() {
    return request("/api/auth/me/");
  },
  dailyRoute() {
    return request("/api/daily-route/");
  },
  dailySummary(goal = 12000) {
    return request(`/api/daily-summary/?goal=${goal}`);
  },
  heatmap() {
    return request("/api/heatmap-data/");
  },
  weekly() {
    return request("/api/weekly-forecast/");
  }
};

export { API_BASE };
