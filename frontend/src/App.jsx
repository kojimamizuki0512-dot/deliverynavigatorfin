import React, { useEffect, useMemo, useState } from "react";
import { api, getToken, clearToken } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";

function useDeviceId() {
  // 端末ごと識別したい時に使う（いまは未使用）
  return useMemo(() => {
    const k = "dnf_device_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = crypto.randomUUID?.() || String(Math.random()).slice(2);
      localStorage.setItem(k, id);
    }
    return id;
  }, []);
}

export default function App() {
  useDeviceId();
  const [me, setMe] = useState(null); // {id, username, email}
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  // ===== 初期化（アラートは出さない） =====
  useEffect(() => {
    (async () => {
      try {
        // 既存トークンで /me を見てログインを引き継ぐ
        if (getToken()) {
          const m = await api.me();
          setMe(m);
          await fetchAll();
        }
      } catch {
        // トークンが無効なら消しておく（AuthGate が未ログイン画面を出す）
        clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchAll() {
    setMsg("");
    try {
      const r = await api.dailyRoute();
      setRoute(Array.isArray(r) ? r : r?.route || []);
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // ===== ログアウト（AuthGate の認証再評価を確実にするためリロード） =====
  function onLogout() {
    clearToken();
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-neutral-300">読み込み中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div className="text-xl font-semibold">Delivery Navigator</div>
        <div className="text-sm">
          {me ? (
            <div className="flex items-center gap-3">
              <span>ようこそ、{me.username} さん</span>
              <button
                onClick={fetchAll}
                className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
              >
                データを再取得
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
              >
                ログアウト
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* AuthGate が未ログイン時は App を表示しないため、ここでは me が null の間のみ待機表示 */}
      {!me ? (
        <div className="text-neutral-300">認証を確認中…</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {msg && (
            <div className="p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200">
              {msg}
            </div>
          )}

          <RouteCard route={route} />
          <RecordInputCard />
        </div>
      )}
    </div>
  );
}
