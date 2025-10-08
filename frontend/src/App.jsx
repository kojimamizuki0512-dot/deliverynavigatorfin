import React, { useEffect, useMemo, useState } from "react";
import { api, getToken, clearToken } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";

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

  // ルート＆ダッシュボード用
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  // 月間目標（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000; // 初期値: 12万円
  });

  // 今月達成額（次の手順でAPI/集計に接続する。今は0のまま）
  const [monthTotal, setMonthTotal] = useState(0);

  // ===== 初期化（アラートは出さない） =====
  useEffect(() => {
    (async () => {
      try {
        if (getToken()) {
          const m = await api.me();
          setMe(m);
          await fetchAll();
        }
      } catch {
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
      // 次の手順で実績APIに接続し、今月合計を更新する
      setMonthTotal((prev) => prev);
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // ===== ログアウト（AuthGate の認証再評価を確実にするためリロード） =====
  function onLogout() {
    clearToken();
    window.location.reload();
  }

  // 目標金額の変更（ローカル保存）
  function changeGoal() {
    const v = window.prompt("月間目標金額（円）を入力してください。", String(monthlyGoal));
    if (!v) return;
    const n = Number(v.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    localStorage.setItem(GOAL_KEY, String(n));
    setMonthlyGoal(n);
  }

  // 達成率（%）
  const progressPct = Math.max(0, Math.min(100, Math.floor((monthTotal / monthlyGoal) * 100)));

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-neutral-300">読み込み中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <header className="flex items-center justify-between mb-6">
        <div className="text-xl font-semibold">Delivery Navigator</div>
        <div className="text-sm">
          {me ? (
            <div className="flex items-center gap-3">
              <span>ようこそ、{me.username} さん</span>
              <button
                onClick={fetchAll}
                className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">
                データを再取得
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">
                ログアウト
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* 未ログインの時は AuthGate 側が画面を持つので、ここは me が null の間のみ待機表示 */}
      {!me ? (
        <div className="text-neutral-300">認証を確認中…</div>
      ) : (
        <>
          {msg && (
            <div className="p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200 mb-4">
              {msg}
            </div>
          )}

          {/* ===== スワイプデッキ（3枚） ===== */}
          <SwipeDeck className="relative" initialIndex={0}>
            {/* --- 1枚目：Cockpit + AI Route（デモ） --- */}
            <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
              {/* Cockpit */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-neutral-400">Cockpit Dashboard</div>
                <button
                  onClick={changeGoal}
                  className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10">
                  目標を変更
                </button>
              </div>
              <div className="text-2xl font-semibold mb-1">
                月間目標 ¥{monthlyGoal.toLocaleString()}
              </div>
              <div className="text-sm text-neutral-400 mb-2">
                今月の達成額：¥{monthTotal.toLocaleString()}（{progressPct}%）
              </div>
              <div className="h-2 w-full rounded bg-white/10 overflow-hidden mb-4">
                <div
                  className="h-2 bg-emerald-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* AI Route Suggestion（デモ用に既存 RouteCard を内包） */}
              <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
              <RouteCard route={route} />
            </section>

            {/* --- 2枚目：実績入力 --- */}
            <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
              <RecordInputCard />
            </section>

            {/* --- 3枚目：履歴グラフ（プレースホルダー） --- */}
            <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
              <div className="text-sm text-neutral-400 mb-2">Summary（グラフ）</div>
              <div className="h-40 grid place-items-center text-neutral-400">
                グラフカードは次の手順で追加（Recharts導入）
              </div>
            </section>
          </SwipeDeck>
          <div className="text-center text-xs text-neutral-500 mt-2">
            ← スワイプ / ドラッグでカード切替 →
          </div>
        </>
      )}
    </div>
  );
}
