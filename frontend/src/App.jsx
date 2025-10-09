// frontend/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

const GOAL_KEY = "dnf_goal_monthly";

// 数値化のヘルパ（文字列・オブジェクトでも拾う）
function toNumber(any) {
  if (typeof any === "number" && Number.isFinite(any)) return any;
  if (typeof any === "string") {
    const n = Number(any.replace?.(/[^\d.-]/g, "") ?? any);
    return Number.isFinite(n) ? n : 0;
  }
  if (any && typeof any === "object") {
    // よくあるキー名 + 最初に見つかった数値
    for (const k of ["total", "sum", "amount", "value", "monthly_total"]) {
      if (k in any) return toNumber(any[k]);
    }
    for (const v of Object.values(any)) {
      const n = toNumber(v);
      if (n) return n;
    }
  }
  return 0;
}

// レコード配列から「今月の売上合計」を前端で計算
function calcThisMonthTotal(records) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
  let sum = 0;
  for (const r of Array.isArray(records) ? records : []) {
    // 日付フィールドの候補
    const d =
      r.date || r.work_date || r.working_date || r.created_at || r.created || "";
    if (typeof d === "string" && d.startsWith(ym)) {
      // 金額フィールドの候補
      const amt =
        r.amount_yen ??
        r.sales ??
        r.sale ??
        r.revenue ??
        r.amount ??
        r.price ??
        0;
      sum += toNumber(amt);
    }
  }
  return sum;
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

  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });

  const [monthTotal, setMonthTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // まとめて取得して state 反映
  async function fetchAll() {
    setLoading(true);
    setMsg("");
    try {
      // ルート（デモ）
      const r = await api.dailyRoute();
      setRoute(Array.isArray(r) ? r : r?.route || []);

      // サーバ合計
      const mtRaw = await api.monthlyTotal().catch(() => 0);
      let mt = toNumber(mtRaw);

      // フォールバック：records から今月合計を自前集計
      const recs = await api.records().catch(() => []);
      const fallback = calcThisMonthTotal(recs);

      // どちらか大きい方を採用（0 を弾く狙い）
      setMonthTotal(Math.max(mt, fallback));
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  // 保存成功時：自前で最新化（合計/グラフ両方）
  async function handleSaved() {
    try {
      // 保存直後は最新レコードを直接読む -> 合計を即計算
      const recs = await api.records();
      const sum = calcThisMonthTotal(recs);
      setMonthTotal(sum);

      // 念のためサーバ合計でも更新（片方がゼロでも上で反映済み）
      api.monthlyTotal().then((mtRaw) => {
        const mt = toNumber(mtRaw);
        if (mt && mt !== sum) setMonthTotal(Math.max(mt, sum));
      }).catch(() => {});

      // グラフはリマウントで確実に更新
      setRefreshKey((k) => k + 1);
    } catch {
      // 失敗時は全量再取得
      await fetchAll();
      setRefreshKey((k) => k + 1);
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

      <SwipeDeck className="relative" initialIndex={0}>
        {/* 1枚目：Cockpit */}
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
            <div className="h-2 bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="text-sm text-neutral-400 mb-2">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </section>

        {/* 2枚目：実績入力（成功時に handleSaved 呼び出し） */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
          <RecordInputCard onSaved={handleSaved} />
        </section>

        {/* 3枚目：履歴グラフ（リマウントで最新化） */}
        <section className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-0">
          <SummaryCard key={refreshKey} />
        </section>
      </SwipeDeck>

      <div className="text-center text-xs text-neutral-500 mt-2">← スワイプ / ドラッグでカード切替 →</div>
    </div>
  );
}
