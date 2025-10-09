import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";

// /api/monthly-total/ の返り値を数値に正規化（保険）
function numFrom(any) {
  if (typeof any === "number") return any;
  if (typeof any === "string") return Number(any) || 0;
  if (any && typeof any === "object") {
    for (const k of ["total", "sum", "amount", "value"]) {
      if (k in any) return Number(any[k]) || 0;
    }
  }
  return 0;
}

function useDeviceId() {
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

  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  // 月間目標（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });

  // 今月達成額
  const [monthTotal, setMonthTotal] = useState(0);

  // グラフを確実に更新させるためのキー（変わると SummaryCard をリマウント）
  const [refreshKey, setRefreshKey] = useState(0);

  // 初回読み込み
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    setMsg("");
    try {
      // ルート（デモ）
      const r = await api.dailyRoute();
      setRoute(Array.isArray(r) ? r : r?.route || []);

      // 今月合計（返り値の形が何でも拾う）
      const mtRaw = await api.monthlyTotal();
      setMonthTotal(numFrom(mtRaw));
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  // 保存成功時：再取得＋グラフをリマウント
  async function handleSaved() {
    await fetchAll();
    setRefreshKey((k) => k + 1);
  }

  // 目標金額の変更（ローカル保持）
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
        <div className="text-sm flex items-center gap-3">
          <span className="text-xs text-neutral-500">
            端末ID: {localStorage.getItem("dnf_device_id")?.slice(0, 4) || "-"}
          </span>
          <button
            onClick={fetchAll}
            className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">
            データを再取得
          </button>
        </div>
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
          <div className="text-2xl font-semibold mb-1">月間目標 ¥{monthlyGoal.toLocaleString()}</div>
          <div className="text-sm text-neutral-400 mb-2">
            今月の達成額：¥{monthTotal.toLocaleString()}（{progressPct}%）
          </div>
          <div className="h-2 w-full rounded bg-white/10 overflow-hidden mb-4">
            <div className="h-2 bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>

          {/* AI Route Suggestion（デモ） */}
          <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </section>

        {/* --- 2枚目：実績入力 --- */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
          {/* 保存に成功したら handleSaved() を呼んで UI を更新 */}
          <RecordInputCard onSaved={handleSaved} />
        </section>

        {/* --- 3枚目：履歴グラフ --- */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-0">
          {/* key を変えてリマウントさせることで必ず最新データを描画 */}
          <SummaryCard key={refreshKey} />
        </section>
      </SwipeDeck>

      <div className="text-center text-xs text-neutral-500 mt-2">← スワイプ / ドラッグでカード切替 →</div>
    </div>
  );
}
