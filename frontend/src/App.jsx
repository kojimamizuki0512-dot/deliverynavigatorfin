import React, { useEffect, useMemo, useState } from "react";
import { api, setToken, getToken, clearToken } from "./api";
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
  const [me, setMe] = useState(null);    // {id, username, email}
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
        // トークンが無効なら消しておく（UIは未ログイン表示のまま）
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
      setRoute(Array.isArray(r) ? r : (r?.route || []));
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // ===== 認証（簡易UI） =====
  const [auth, setAuth] = useState({ username: "", password: "", email: "" });
  function setAuthField(k, v) { setAuth((s) => ({ ...s, [k]: v })); }

  async function onRegister(e) {
    e.preventDefault();
    setMsg("");
    try {
      await api.register(auth.username, auth.password, auth.email || undefined);
      const tk = await api.login(auth.username, auth.password);
      setToken(tk?.access || tk?.token);
      const m = await api.me();
      setMe(m);
      await fetchAll();
    } catch (err) {
      setMsg(err?.data?.detail || "登録/ログインに失敗しました。");
    }
  }

  async function onLogin(e) {
    e.preventDefault();
    setMsg("");
    try {
      const tk = await api.login(auth.username, auth.password);
      setToken(tk?.access || tk?.token);
      const m = await api.me();
      setMe(m);
      await fetchAll();
    } catch (err) {
      setMsg(err?.data?.detail || "ログインに失敗しました。");
    }
  }

  function onLogout() {
    clearToken();
    setMe(null);
    setRoute([]);
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
              <button onClick={fetchAll}
                className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">
                データを再取得
              </button>
              <button onClick={onLogout}
                className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">
                ログアウト
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {!me ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={onLogin} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="mb-3 text-lg font-semibold">ログイン</div>
            <label className="block mb-3 text-sm">
              <div className="mb-1">ユーザー名</div>
              <input
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                value={auth.username}
                onChange={(e) => setAuthField("username", e.target.value)}
                required />
            </label>
            <label className="block mb-4 text-sm">
              <div className="mb-1">パスワード</div>
              <input
                type="password"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                value={auth.password}
                onChange={(e) => setAuthField("password", e.target.value)}
                required />
            </label>
            <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">ログイン</button>
          </form>

          <form onSubmit={onRegister} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="mb-3 text-lg font-semibold">新規登録</div>
            <label className="block mb-3 text-sm">
              <div className="mb-1">ユーザー名</div>
              <input
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                value={auth.username}
                onChange={(e) => setAuthField("username", e.target.value)}
                required />
            </label>
            <label className="block mb-3 text-sm">
              <div className="mb-1">メール（任意）</div>
              <input
                type="email"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                value={auth.email}
                onChange={(e) => setAuthField("email", e.target.value)} />
            </label>
            <label className="block mb-4 text-sm">
              <div className="mb-1">パスワード（8文字以上）</div>
              <input
                type="password"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
                value={auth.password}
                onChange={(e) => setAuthField("password", e.target.value)}
                required />
            </label>
            <button className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500">登録してはじめる</button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {msg && <div className="p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200">{msg}</div>}

          <RouteCard route={route} />
          <RecordInputCard />
        </div>
      )}
    </div>
  );
}
