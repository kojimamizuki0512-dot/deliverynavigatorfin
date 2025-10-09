import React, { useEffect, useMemo, useState } from "react";
import { api, clearToken } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SwipeDeck from "./components/SwipeDeck.jsx";
import HistoryList from "./components/HistoryList.jsx";
import GlassCard from "./components/ui/GlassCard.jsx";
import ProgressBar from "./components/ui/ProgressBar.jsx";

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

// 当月合計のフェールセーフ集計（/api/records/ のリストから同じ年月の合計を計算）
function calcMonthTotalFrom(records) {
  if (!Array.isArray(records)) return 0;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-11
  let sum = 0;
  for (const r of records) {
    const d = r.created_at ? new Date(r.created_at) : null;
    if (!d || !Number.isFinite(r.value)) continue;
    if (d.getFullYear() === y && d.getMonth() === m) {
      sum += Number(r.value) || 0;
    }
  }
  return sum;
}

export default function App() {
  const deviceId = useDeviceId();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // ルート＆ダッシュボード用
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  // 月間目標（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });

  // 今月達成額
  const [monthTotal, setMonthTotal] = useState(0);

  // ===== 初期化 =====
  useEffect(() => {
    (async () => {
      try {
        const m = await api.me();
        setMe(m);
        await fetchAll(); // ルート & 月次合計（フェールセーフ付き）
      } catch {
        clearToken(); // 念のため
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchAll() {
    setMsg("");
    try {
      const [r, mt, recs] = await Promise.all([
        api.dailyRoute(),
        api.monthlyTotal().catch(() => ({ total: 0 })), // 失敗時 0
        api.records().catch(() => []), // フェールセーフ用
      ]);

      setRoute(Array.isArray(r) ? r : r?.route || []);
      let total = Number(mt?.total || 0);
      // サーバ側が 0 を返しても、レコードがあるならクライアント集計で補う
      if (total === 0 && Array.isArray(recs) && recs.length > 0) {
        total = calcMonthTotalFrom(recs);
      }
      setMonthTotal(total);
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // 保存成功時：楽観的に合計を加算 → 正値でサーバ確認して補正
  async function handleRecordSaved(rec) {
    const add = Number(rec?.value || 0);
    if (add) setMonthTotal((prev) => prev + add); // 即時反映

    try {
      const mt = await api.monthlyTotal();
      let total = Number(mt?.total || 0);
      if (total === 0) {
        // 念のためフェールセーフ
        const recs = await api.records().catch(() => []);
        total = calcMonthTotalFrom(recs);
      }
      setMonthTotal(total);
    } catch {
      // 通信失敗時は楽観値のままにしておく
    }
  }

  // ログアウト（キャッシュクリア）
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
      <div className="grid min-h-screen place-items-center">
        <div className="text-neutral-300">読み込み中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6">
      {/* ヘッダー */}
      <header className="mb-6 grid grid-cols-3 items-center">
        <div className="text-xl font-semibold">Delivery Navigator</div>
        <div className="text-center text-xs text-neutral-500">端末ID: {String(deviceId).slice(0, 4)}</div>
        <div className="text-right text-sm">
          {me ? (
            <div className="inline-flex items-center gap-3">
              <button
                onClick={fetchAll}
                className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
              >
                再取得
              </button>
              <button
                onClick={onLogout}
                className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
              >
                ログアウト
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {msg && (
        <div className="mb-4 rounded-lg border border-amber-800 bg-amber-900/40 p-3 text-amber-200">
          {msg}
        </div>
      )}

      {/* ===== スワイプデッキ（3枚） ===== */}
      <SwipeDeck className="relative" initialIndex={0}>
        {/* --- 1枚目：Cockpit + AI Route（デモ） --- */}
        <GlassCard
          title="Cockpit Dashboard"
          toolbar={
            <button
              onClick={changeGoal}
              className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
            >
              目標を変更
            </button>
          }
          className="bg-white/[0.03]"
        >
          <div className="mb-1 text-2xl font-semibold">
            月間目標 ¥{monthlyGoal.toLocaleString()}
          </div>
          <div className="mb-2 text-sm text-neutral-400">
            今月の達成額：¥{monthTotal.toLocaleString()}（{progressPct}%）
          </div>
          <ProgressBar value={progressPct} className="mb-4" height="h-2" />

          <div className="mb-2 text-sm text-neutral-400">AI Route Suggestion（デモ）</div>
          <RouteCard route={route} />
        </GlassCard>

        {/* --- 2枚目：実績入力（保存→合計＆履歴に即時反映） --- */}
        <GlassCard title="実績を記録">
          <RecordInputCard onSaved={handleRecordSaved} />
          <p className="mt-2 text-right text-[11px] text-neutral-500">
            保存すると自動でダッシュボードと履歴に反映されます
          </p>
        </GlassCard>

        {/* --- 3枚目：履歴リスト --- */}
        <GlassCard title="これまでの実績（直近10件）" className="p-0">
          <HistoryList />
        </GlassCard>
      </SwipeDeck>

      <div className="mt-2 text-center text-xs text-neutral-500">
        ← スワイプ / ドラッグでカード切替 →
      </div>
    </div>
  );
}
