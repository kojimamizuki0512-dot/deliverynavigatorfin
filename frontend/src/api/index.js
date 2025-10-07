const API_BASE = import.meta.env.VITE_API_BASE;

function getAccessToken() {
  return localStorage.getItem("accessToken");
}
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}
function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
}
export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function request(path, opts = {}, retry = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 401 && retry && getRefreshToken()) {
    // try refresh
    const r = await fetch(`${API_BASE}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: getRefreshToken() }),
    });
    if (r.ok) {
      const data = await r.json();
      setTokens({ access: data.access });
      return request(path, opts, false);
    } else {
      clearTokens();
    }
  }
  return res;
}

export const api = {
  // auth
  async register({ email, password, name }) {
    const res = await request(`/api/auth/register/`, {
      method: "POST",
      body: JSON.stringify({ email, password, first_name: name }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async login({ emailOrUsername, password }) {
    const res = await request(`/api/auth/login/`, {
      method: "POST",
      body: JSON.stringify({ username: emailOrUsername, password }),
    }, false);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setTokens({ access: data.access, refresh: data.refresh });
    return data;
  },
  async me() {
    const res = await request(`/api/auth/me/`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // data
  async dailyRoute() {
    const r = await request(`/api/daily-route/`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async dailySummary(goal = 12000) {
    const r = await request(`/api/daily-summary/?goal=${goal}`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async heatmapData() {
    const r = await request(`/api/heatmap-data/`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async weeklyForecast() {
    const r = await request(`/api/weekly-forecast/`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
};
