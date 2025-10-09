 // ===== API ラッパ =====
 const ENV_BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, "");
 const FALLBACK_BASE = "";
 export const API_BASE = (ENV_BASE || FALLBACK_BASE) || "";

-// Token 管理（今回は未使用化）
+// Token 管理（今回は未使用化）
 const KEY = "dnf_token";
 export function getToken() { return localStorage.getItem(KEY) || ""; }
 export function setToken(t) { if (t) localStorage.setItem(KEY, t); }
 export function clearToken() { localStorage.removeItem(KEY); }

+// ★ 端末ID（匿名ユーザー識別用）— 既存の App のフックに依存せずAPI層でも確実化
+const DID_KEY = "dnf_device_id";
+function getDeviceId() {
+  let id = localStorage.getItem(DID_KEY);
+  if (!id) {
+    id = (crypto.randomUUID?.() || String(Math.random()).slice(2));
+    localStorage.setItem(DID_KEY, id);
+  }
+  return id;
+}
+
 // 共通 fetch
 async function apiFetch(path, opts = {}) {
   const url = path.startsWith("http")
     ? path
     : `${API_BASE}${path.startsWith("/") ? path : `/api/${path}`}`;

   const headers = new Headers(opts.headers || {});
-  const token = getToken();
-  if (token) headers.set("Authorization", `Bearer ${token}`);
+  // ★ 匿名運用：Authorizationは付けない
+  // ★ 代わりに X-Device-Id を常に送る
+  headers.set("X-Device-Id", getDeviceId());
   if (!headers.has("Content-Type") && opts.body && !(opts.body instanceof FormData)) {
     headers.set("Content-Type", "application/json");
   }

-  const res = await fetch(url, { ...opts, headers, credentials: "include" });
+  // ★ クロスオリジンでもクッキー不要
+  const res = await fetch(url, { ...opts, headers });
   if (!res.ok) {
     const text = await res.text().catch(() => "");
     const err = new Error(`HTTP ${res.status}`);
     err.status = res.status;
     try { err.data = JSON.parse(text); } catch { err.data = { detail: text || "error" }; }
     throw err;
   }
   const ct = res.headers.get("content-type") || "";
   return ct.includes("application/json") ? res.json() : res.text();
 }

 export const api = {
-  // 認証（当面未使用）
-  register: (username, password, email) =>
-    apiFetch("/api/auth/register/", { method: "POST", body: JSON.stringify({ username, password, email }) }),
-  login: (username, password) =>
-    apiFetch("/api/auth/login/", { method: "POST", body: JSON.stringify({ username, password }) }),
-  me: () => apiFetch("/api/auth/me/"),
+  // 認証系は当面使わない（残しても呼ばない）
 
   // データ取得
   dailyRoute:    () => apiFetch("/api/daily-route/"),
   dailySummary:  (goal = 12000) => apiFetch(`/api/daily-summary/?goal=${goal}`),
 
   // 実績
   createRecord: (payload) =>
     apiFetch("/api/records/", { method: "POST", body: JSON.stringify(payload) }),
+  listRecords: () => apiFetch("/api/records/"),
+  monthlyTotal: () => apiFetch("/api/monthly-total/"),
 };
