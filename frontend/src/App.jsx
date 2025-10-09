// frontend/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";                     // ← getToken/clearToken は使わない構成
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";

function useDeviceId() {
  // 端末ごとの識別子（バックエンドは X-Device-Id を見て紐付け）
  return useMemo(() => {
    const k = "dnf_device_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = (crypto.randomUUID?.() || String(Math.random()).slice(2)) + Date.now();
      localStorage.setItem(k, id);
    }
    return id.slice(0, 4); // 表示用に短縮（例: 58ad）
  }, []);
}

export default function App() {
  const deviceShort = useDeviceId();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // ルート（デモ）
  const [route, setRoute] = useState([]);

  // 目標金額（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000; // 初期値: 12万円
  });

  // 今月達成額（APIから取得）
  const [monthTotal, setMonthTotal] = useState(0);

  // ===== 初期データ取得 =====
  useEffect(() => {
    (async () => {
      try {
        await fetchAll();
      } catch {
        // 画面上でメッセージは出すので握りつぶし
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchAll() {
    setMsg("");
    try {
      // ルート（デモ）
      const r = await api.dailyRoute();
      setRoute(Array.isArray(r) ? r : (r?.route || []));

      // ★ 今月合計（/api/monthly-total/）を反映
      const mt = await api.monthlyTotal(); // 期待形: { total_yen: number }
      const total = typeof mt === "number" ? mt : (mt?.total_yen ?? 0);
      setMonthTotal(Number(total) || 0);
    } catch (e) {
      setMsg("データ取得に失敗しました。");
      console.error(e);
    }
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
        <div className="text-xs text-neutral-400">端末ID: {deviceShort}</div>
        <button
          onClick={fetchAll}
          className="text-sm px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">
          データを再取得
        </button>
      </header>

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
          {/* 保存後は RecordInputCard 内で「保存しました」と出し、
              画面上部の「データを再取得」ボタンで手動更新 or
              自動更新させたい場合は props で fetchAll を渡して呼ぶ運用もOK */}
          <RecordInputCard />
        </section>

        {/* --- 3枚目：履歴グラフ（Recharts） --- */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-0">
          <SummaryCard />
        </section>
      </SwipeDeck>

      <div className="text-center text-xs text-neutral-500 mt-2">
        ← スワイプ / ドラッグでカード切替 →
      </div>
    </div>
  );
}
