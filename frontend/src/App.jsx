// frontend/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

// ローカル保存キー
const GOAL_KEY = "dnf_goal_monthly";
const DID_KEY = "dnf_device_id";

function useDeviceId() {
  return useMemo(() => {
    let id = localStorage.getItem(DID_KEY);
    if (!id) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Math.random()).slice(2) + Date.now();
      localStorage.setItem(DID_KEY, id);
    }
    return id;
  }, []);
}

export default function App() {
  const deviceId = useDeviceId();

  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });
  const [monthTotal, setMonthTotal] = useState(0);

  // 初期ロード：ルートと月次合計を取得
  useEffect(() => {
    refreshAll();
  }, []);

  // レコード保存成功イベントを拾って月次合計のみ即更新
  useEffect(() => {
    async function onSaved() {
      try {
        const t = await api.monthlyTotal();
        // API 返却が { total: number } or number のどちらでも拾えるように
        const val = typeof t === "number" ? t : (t?.total ?? 0);
        setMonthTotal(val);
      } catch {
        // 取得失敗時は無視（UIは前の値を保持）
      }
    }
    window.addEventListener("dnf:record:saved", onSaved);
    return () => window.removeEventListener("dnf:record:saved", onSaved);
  }, []);

  async function refreshAll() {
    setMsg("");
    try {
      // ルート（デモ用）
      const r = await api.dailyRoute();
      setRoute(Array.isArray(r) ? r : (r?.route || []));

      // 月次合計
      const t = await api.monthlyTotal();
      const val = typeof t === "number" ? t : (t?.total ?? 0);
      setMonthTotal(val);
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  function changeGoal() {
    const v = window.prompt("月間目標金額（円）を入力してください。", String(monthlyGoal));
    if (!v) return;
    const n = Number(v.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    localStorage.setItem(GOAL_KEY, String(n));
    setMonthlyGoal(n);
  }

  const progressPct = Math.max(0, Math.min(100, Math.floor((monthTotal / monthlyGoal) * 100)));

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <header className="flex items-center justify-between mb-6">
        <div className="text-xl font-semibold">Delivery Navigator</div>
        <div className="text-xs text-neutral-400">
          端末ID: {String(deviceId).slice(0, 4)}
          <button
            onClick={refreshAll}
            className="ml-3 px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
          >
            データを再取得
          </button>
        </div>
      </header>

      {msg && (
        <div className="p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200 mb-4">
          {msg}
        </div>
      )}

      {/* スワイプデッキ */}
      <SwipeDeck className="relative" initialIndex={0}>
        {/* 1枚目：Cockpit + AI Route（デモ） */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-neutral-400">Cockpit Dashboard</div>
            <button
              onClick={changeGoal}
              className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10"
            >
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

          <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </section>

        {/* 2枚目：実績入力（保存で自動更新） */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
          <RecordInputCard />
        </section>

        {/* 3枚目：履歴グラフ */}
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
