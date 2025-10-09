import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";

import GlassCard from "./components/ui/GlassCard.jsx";
import ProgressBar from "./components/ui/ProgressBar.jsx";
import HistoryList from "./components/HistoryList.jsx";

// ローカル保存キー
const GOAL_KEY = "dnf_goal_monthly";
const DID_KEY = "dnf_device_id";

function getDeviceId() {
  let id = localStorage.getItem(DID_KEY);
  if (!id) {
    id = (crypto?.randomUUID?.() || String(Math.random()).slice(2)) + Date.now();
    localStorage.setItem(DID_KEY, id);
  }
  return id;
}

export default function App() {
  // 端末ID（表示用）
  const deviceId = useMemo(getDeviceId, []);

  // ルート & ダッシュボード
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });

  const [monthTotal, setMonthTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        await fetchAll();
      } catch (e) {
        // 画面上部にだけ通知
        setMsg("初期データ取得に失敗しました。");
      }
    })();
  }, []);

  async function fetchAll() {
    setMsg("");
    const [r, agg] = await Promise.allSettled([api.dailyRoute(), api.monthlyTotal()]);
    if (r.status === "fulfilled") {
      const v = Array.isArray(r.value) ? r.value : (r.value?.route || []);
      setRoute(v);
    }
    if (agg.status === "fulfilled") {
      setMonthTotal(Number(agg.value?.total || 0));
    }
  }

  // 実績保存後、合計と履歴を更新するために公開コールバックを子に渡す
  async function handleSaved() {
    try {
      const x = await api.monthlyTotal();
      setMonthTotal(Number(x?.total || 0));
      // 履歴側は各自マウント時に読み直す作りなので、ここでは何もしない
      // 必要ならカスタムイベントなどで通知してもOK
    } catch {
      // 無視（トースト不要）
    }
  }

  function changeGoal() {
    const v = window.prompt("月間目標金額（円）を入力してください。", String(monthlyGoal));
    if (!v) return;
    const n = Number(String(v).replace(/[^\d]/g, ""));
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
        <div className="text-xs text-neutral-500">端末ID: {deviceId.slice(0, 4)}</div>
      </header>

      {msg && (
        <div className="p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200 mb-4">
          {msg}
        </div>
      )}

      {/* スワイプデッキ（3枚） */}
      <SwipeDeck className="relative" initialIndex={0}>
        {/* 1枚目：Cockpit（ガラスUI）＋AI Routeデモ */}
        <GlassCard className="p-4">
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
          <ProgressBar value={progressPct} className="mb-4" />

          <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </GlassCard>

        {/* 2枚目：実績入力（保存後にCockpit合計を即反映） */}
        <GlassCard className="p-4">
          <RecordInputCard onSaved={handleSaved} />
        </GlassCard>

        {/* 3枚目：これまでの実績（折れ線の代替） */}
        <HistoryList />
      </SwipeDeck>

      <div className="text-center text-xs text-neutral-500 mt-2">
        ← スワイプ / ドラッグでカード切替 →
      </div>
    </div>
  );
}
