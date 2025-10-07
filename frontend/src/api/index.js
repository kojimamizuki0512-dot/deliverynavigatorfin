const BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "") || "";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Auth ---
export async function register({ email, password }) {
  const res = await fetch(`${BASE}/api/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "register failed");
  }
  return res.json();
}

export async function login({ identifier, password }) {
  const res = await fetch(`${BASE}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function me(token) {
  const res = await fetch(`${BASE}/api/auth/me/`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Data (fallback to /public when not authed) ---
export async function dailyRoute(token) {
  const path = token ? "/api/daily-route/" : "/api/public/daily-route/";
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function dailySummary(goal, token) {
  const path = token ? "/api/daily-summary/" : "/api/public/daily-summary/";
  const res = await fetch(`${BASE}${path}?goal=${goal}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function heatmapData(token) {
  const path = token ? "/api/heatmap-data/" : "/api/public/heatmap-data/";
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
