// frontend/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx"; // 履歴一覧カード

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";
const DID_KEY = "dnf_device_id";

function useDeviceId() {
  // 端末ごと識別（サーバーへ X-Device-Id として付与される）
  return useMemo(() => {
    let id = localStorage.getItem(DID_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || String(Math.random()).slice(2);
      localStorage.setItem(DID_KEY, id);
    }
    return id;
  }, []);
}

export default function App() {
  const deviceId = useDeviceId();

  // 画面用ステート
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [route, setRoute] = useState([]);

  // ダッシュボード表示
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000; // 初期 12万円
  });
  const [monthTotal, setMonthTotal] = useState(0);

  // 履歴一覧（旧グラフの代わり）
  const [records, setRecords] = useState([]);

  // 初回ロード
  useEffect(() => {
    (async () => {
      try {
        await fetchAll();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // まとめて取得
  async function fetchAll() {
    setMsg("");
    try {
      // ルート（ダミー）
      const r = await api.dailyRoute();
      setRoute(Array.isArray(r) ? r : r?.route || []);

      // 実績一覧
      const rec = await api.records();
      setRecords(Array.isArray(rec) ? rec : []);

      // 月間合計
      const mt = await api.monthlyTotal();
      setMonthTotal(Number(mt?.total || 0));
    } catch (e) {
      setMsg("データ取得に失敗しました。");
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

  const progressPct = Math.max(
    0,
    Math.min(100, Math.floor((monthTotal / monthlyGoal) * 100))
  );

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
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>端末ID: {deviceId.slice(0, 4)}</span>
          <button
            onClick={fetchAll}
            className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
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

      {/* スワイプデッキ（3枚構成はそのまま） */}
      <SwipeDeck className="relative" initialIndex={0}>
        {/* 1枚目：Cockpit */}
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

          {/* AI Route Suggestion（デモ） */}
          <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </section>

        {/* 2枚目：実績入力（保存成功 → 自動で fetchAll） */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
          <RecordInputCard onSaved={fetchAll} />
        </section>

        {/* 3枚目：履歴一覧（旧：グラフ） */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-0">
          <SummaryCard records={records} />
        </section>
      </SwipeDeck>

      <div className="text-center text-xs text-neutral-500 mt-2">
        ← スワイプ / ドラッグでカード切替 →
      </div>
    </div>
  );
}
