// frontend/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

import GlassCard from "./components/ui/GlassCard.jsx";
import ProgressBar from "./components/ui/ProgressBar.jsx";

const GOAL_KEY = "dnf_goal_monthly";

function useDeviceId() {
  return useMemo(() => {
    const k = "dnf_device_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = (crypto?.randomUUID?.() || String(Math.random()).slice(2));
      localStorage.setItem(k, id);
    }
    return id;
  }, []);
}

export default function App() {
  useDeviceId();

  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });
  const [monthTotal, setMonthTotal] = useState(0);

  // 初期ロード
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setMsg("");
      const [r, m] = await Promise.all([
        api.dailyRoute(),
        api.monthlyTotal(),
      ]);
      setRoute(Array.isArray(r) ? r : (r?.route || []));
      setMonthTotal(Number(m?.total || 0));
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // 実績新規作成 → 即座に合計と履歴も再取得
  async function onCreatedRecord() {
    try {
      const m = await api.monthlyTotal();
      setMonthTotal(Number(m?.total || 0));
      // SummaryCard 側は内部 fetch を expose していなければ
      // 全体再取得で OK（負荷小）
      fetchRecordsForSummary?.();
    } catch {}
  }

  function changeGoal() {
    const v = window.prompt("月間目標金額（円）を入力してください。", String(monthlyGoal));
    if (!v) return;
    const n = Number(String(v).replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    localStorage.setItem(GOAL_KEY, String(n));
    setMonthlyGoal(n);
  }

  const pct = Math.max(0, Math.min(100, Math.floor((monthTotal / monthlyGoal) * 100)));

  // SummaryCard へ再読込を依頼するための ref（既存の SummaryCard が未対応なら無視されます）
  let fetchRecordsForSummary = null;
  const bindSummaryReload = (fn) => { fetchRecordsForSummary = fn; };

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
      {/* ==== ヘッダー ==== */}
      <header className="mb-6 text-center">
        <div className="text-2xl md:text-3xl font-semibold tracking-wide">Delivery Navigator</div>
      </header>

      {msg && (
        <div className="glass p-3 mb-4 text-amber-200" style={{ background: "rgba(120, 53, 15, .45)" }}>
          {msg}
        </div>
      )}

      {/* ==== スワイプデッキ ==== */}
      <SwipeDeck className="relative" initialIndex={0}>

        {/* --- 1枚目：Cockpit（上段） --- */}
        <section className="space-y-4">
          {/* Cockpit Dashboard */}
          <GlassCard className="bg-grid-green">
            <div className="kicker mb-1">Cockpit Dashboard</div>
            <div className="mb-3">
              <ProgressBar percent={pct} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-base md:text-lg font-semibold">
                ¥{monthTotal.toLocaleString()} <span className="text-[12px] md:text-sm text-white/60">/ ¥{monthlyGoal.toLocaleString()}</span>
              </div>
              <button onClick={changeGoal}
                      className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10">
                目標を変更
              </button>
            </div>
          </GlassCard>

          {/* AI Route Suggestion（写真の“緑ぽわ”カード） */}
          <GlassCard className="bg-grid-green">
            <div className="text-[1.05rem] md:text-lg font-semibold mb-3">AI Route Suggestion</div>
            {/* 既存のダミールートをここに入れる */}
            <RouteCard route={route} />
          </GlassCard>
        </section>

        {/* --- 2枚目：実績入力 --- */}
        <section>
          <GlassCard className="bg-grid-green">
            <div className="text-[1.05rem] md:text-lg font-semibold mb-3">実績を記録</div>
            {/* RecordInputCard は保存時に onSaved を呼ぶようになっている想定 */}
            <RecordInputCard onSaved={onCreatedRecord} />
          </GlassCard>
        </section>

        {/* --- 3枚目：履歴（折れ線は撤去済→リスト/要約） --- */}
        <section>
          <GlassCard className="bg-grid-green p-0">
            <SummaryCard onBindReload={bindSummaryReload} />
          </GlassCard>
        </section>
      </SwipeDeck>

      <div className="text-center text-xs text-white/50 mt-2">← スワイプ / ドラッグでカード切替 →</div>
    </div>
  );
}
