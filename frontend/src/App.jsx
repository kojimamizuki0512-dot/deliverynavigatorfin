// frontend/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";

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

// 今月かどうか判定
function isInThisMonth(isoDate) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (isNaN(d)) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// /api/monthly-total/ の応答が number でも {total} でも取れるように吸収
function pickMonthlyTotal(v) {
  if (typeof v === "number") return v;
  if (v && typeof v.total === "number") return v.total;
  if (v && typeof v.sum === "number") return v.sum;
  return 0;
}

export default function App() {
  const deviceId = useDeviceId();

  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  // 月間目標（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });

  // 今月達成額
  const [monthTotal, setMonthTotal] = useState(0);

  // グラフを確実に描き直すためのキー（増えるたびに SummaryCard を再マウント）
  const [refreshKey, setRefreshKey] = useState(0);

  // ===== 初期ロード =====
  useEffect(() => {
    (async () => {
      try {
        await fetchAll();
      } catch {
        // 画面上は静かに
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchAll() {
    setMsg("");
    try {
      // ルート（デモ：空でもOK）
      const r = await api.dailyRoute().catch(() => []);
      setRoute(Array.isArray(r) ? r : (r?.route || []));

      // 今月合計
      const mt = await api.monthlyTotal().catch(() => 0);
      setMonthTotal(pickMonthlyTotal(mt));
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // ===== 保存成功時に呼ばれる（RecordInputCard から） =====
  async function handleSaved(created) {
    // 1) 楽観更新：今月分なら即時に足す（体感を良くする）
    const inc =
      Number(created?.amount_yen ?? created?.amount ?? created?.sales ?? 0) || 0;
    if (inc > 0 && isInThisMonth(created?.date)) {
      setMonthTotal((prev) => prev + inc);
    }

    // 2) グラフを強制リマウントして再取得
    setRefreshKey((k) => k + 1);

    // 3) サーバーの正値で上書き（失敗しても無視）
    try {
      const mt = await api.monthlyTotal();
      setMonthTotal(pickMonthlyTotal(mt));
    } catch {}
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
        <div className="text-xs text-neutral-400">端末ID: {deviceId.slice(0, 4)}</div>
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
        {/* --- 1枚目：Cockpit --- */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
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

          <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </section>

        {/* --- 2枚目：実績入力 --- */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
          {/* 保存成功時に handleSaved を呼ぶ */}
          <RecordInputCard onSaved={handleSaved} />
        </section>

        {/* --- 3枚目：履歴グラフ（再マウントで再取得） --- */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-0">
          <SummaryCard key={refreshKey} />
        </section>
      </SwipeDeck>

      <div className="text-center text-xs text-neutral-500 mt-2">
        ← スワイプ / ドラッグでカード切替 →
      </div>
    </div>
  );
}
