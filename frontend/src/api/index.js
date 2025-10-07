const API_BASE = import.meta.env.VITE_API_BASE;

// ゲストID（端末固有）をローカルに保持
function getGuestId() {
  let id = localStorage.getItem("dn_guest_id");
  if (!id) {
    if (crypto?.randomUUID) {
      id = crypto.randomUUID();
    } else {
      // 簡易UUID
      id = "gid-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    localStorage.setItem("dn_guest_id", id);
  }
  return id;
}

function headers(json = true) {
  const h = {
    "X-Guest-Id": getGuestId(),
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function http(url, opts = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...opts,
    headers: { ...(opts.headers || {}), ...headers(opts.json !== false) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ===== ゲスト =====
export const guest = {
  init: (nickname = "") =>
    http(`/api/guest/init/`, { method: "POST", body: JSON.stringify({ nickname }) }),
  profile: () => http(`/api/guest/profile/`),
};

// ===== 記録 =====
export const records = {
  list: () => http(`/api/records/`),
  create: (payload) => http(`/api/records/`, { method: "POST", body: JSON.stringify(payload) }),
};

// ===== 既存ダミーAPI =====
export const dailyRoute = () => http(`/api/daily-route/`);
export const dailySummary = (goal) => http(`/api/daily-summary/?goal=${goal}`);
export const heatmapData = () => http(`/api/heatmap-data/`);
export const weeklyForecast = () => http(`/api/weekly-forecast/`);
