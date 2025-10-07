const BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000').replace(/\/+$/,'')
async function jget(path){ const r=await fetch(`${BASE}${path}`); if(!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json() }

export const api = {
  dailyRoute: () => jget('/api/daily-route/'),
  dailySummary: (goal=12000) => jget(`/api/daily-summary/?goal=${goal}`),
  heatmap: () => jget('/api/heatmap-data/'),
  weekly: () => jget('/api/weekly-forecast/'),
}
