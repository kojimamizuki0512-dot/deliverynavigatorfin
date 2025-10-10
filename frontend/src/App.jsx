import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import GlassCard from "./components/ui/GlassCard.jsx";
import Icon from "./components/ui/Icon.jsx";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import SummaryCard from "./components/SummaryCard.jsx";

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";

function useDeviceId() {
  // 端末ごと識別（匿名ユーザー割り当て用）
  return useMemo(() => {
    const k = "dnf_device_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = (crypto.randomUUID?.() || String(Math.random()).slice(2)) + Date.now();
      localStorage.setItem(k, id);
    }
    return id;
  }, []);
}

export default function App() {
  useDeviceId();

  // 匿名でも /auth/me は返る（X-Device-Idでゲスト割当て）
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // 画面切替（ボトムタブ）：ai | record | history
  const [tab, setTab] = useState("ai");

  // ルート＆メッセージ
  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  // 月間目標（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000; // 初期値: 12万円
  });

  // 今月達成額（バックから取得）
  const [monthTotal, setMonthTotal] = useState(0);

  // 履歴をリフレッシュするためのキー（保存後に +1 して再取得トリガに使う）
  const [refreshSeq, setRefreshSeq] = useState(0);

  // ===== 初期化 =====
  useEffect(() => {
    (async () => {
      try {
        const m = await api.me?.().catch(() => null);
        if (m) setMe(m);
        await fetchAll();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function fetchAll() {
    setMsg("");
    try {
      const r = await api.dailyRoute?.();
      if (Array.isArray(r)) setRoute(r);
      else if (r?.route) setRoute(r.route);

      // 今月合計
      const mt = await api.monthlyTotal?.();
      if (mt && typeof mt.total === "number") setMonthTotal(mt.total);
    } catch (e) {
      setMsg("データ取得に失敗しました。");
    }
  }

  // 目標金額の変更（ローカル保存）
  function changeGoal() {
    const v = window.prompt("月間目標金額（円）を入力してください。", String(monthlyGoal));
    if (!v) return;
    const n = Number(String(v).replace(/[^\d]/g, ""));
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
    <div className="min-h-screen max-w-5xl mx-auto px-4 pt-6 pb-28">
      {/* ヘッダー */}
      <header className="mb-5">
        <div className="text-center">
          <div className="text-[15px] text-emerald-100/70">Cockpit</div>
          <h1 className="h1 bg-gradient-to-r from-[#E6FFF4] to-[#7CF5C8] bg-clip-text text-transparent">
            Delivery Navigator
          </h1>
        </div>
      </header>

      {/* ===== トップの薄いKPIカード＋ピル型プログレス ===== */}
      <section className="px-1 sm:px-2 mb-6">
        <GlassCard className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] text-emerald-100/70">今月の達成額</div>
              <div
                className="mt-0.5 tabular-nums font-extrabold text-emerald-300
                           text-[28px] sm:text-[32px]"
                style={{ letterSpacing: "-0.01em" }}
              >
                ¥{monthTotal.toLocaleString()}
              </div>
              <div className="mt-1 text-[13px] text-emerald-100/60">
                目標 ¥{monthlyGoal.toLocaleString()}
              </div>
            </div>

            <button
              onClick={changeGoal}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            >
              目標を変更
            </button>
          </div>

          {/* ピル型プログレス */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[12px] text-emerald-100/70">
              <span>達成率</span>
              <span className="tabular-nums">{progressPct}%</span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-white/8 ring-1 ring-white/10 overflow-hidden">
              <div
                className="h-3 rounded-full badge-emerald"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ===== コンテンツ：タブで1画面だけ表示 ===== */}
      {msg && (
        <div className="p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200 mb-4">
          {msg}
        </div>
      )}

      {tab === "ai" && (
        <div className="grid grid-cols-1 gap-6">
          <RouteCard route={route} />
        </div>
      )}

      {tab === "record" && (
        <div className="grid grid-cols-1 gap-6">
          <RecordInputCard
            onSaved={async () => {
              // 保存→KPI更新 & 履歴更新トリガ
              try {
                const mt = await api.monthlyTotal?.();
                if (mt && typeof mt.total === "number") setMonthTotal(mt.total);
              } catch {}
              setRefreshSeq((s) => s + 1);
            }}
          />
        </div>
      )}

      {tab === "history" && (
        <div className="grid grid-cols-1 gap-6">
          {/* key でマウントし直し → 保存直後に最新を取得させる */}
          <SummaryCard key={refreshSeq} />
        </div>
      )}

      {/* ===== ボトム・タブバー（固定） ===== */}
      <nav className="fixed left-0 right-0 bottom-4">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-around rounded-2xl
                          backdrop-blur-xl bg-black/30 ring-1 ring-white/10
                          shadow-[0_8px_30px_rgba(0,0,0,0.35)] px-3 py-2">
            {/* AI提案 */}
            <button
              onClick={() => setTab("ai")}
              className={[
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition",
                tab === "ai" ? "bg-white/8 ring-1 ring-emerald-400/30 text-emerald-300" : "text-emerald-100/70"
              ].join(" ")}
            >
              <Icon name="compass" size={24} className="mb-0.5" />
              <span className="text-[11px]">AI提案</span>
            </button>

            {/* 実績を記録 */}
            <button
              onClick={() => setTab("record")}
              className={[
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition",
                tab === "record" ? "bg-white/8 ring-1 ring-emerald-400/30 text-emerald-300" : "text-emerald-100/70"
              ].join(" ")}
            >
              <Icon name="bolt" size={24} className="mb-0.5" />
              <span className="text-[11px]">実績入力</span>
            </button>

            {/* これまでの実績 */}
            <button
              onClick={() => setTab("history")}
              className={[
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition",
                tab === "history" ? "bg-white/8 ring-1 ring-emerald-400/30 text-emerald-300" : "text-emerald-100/70"
              ].join(" ")}
            >
              <Icon name="list" size={24} className="mb-0.5" />
              <span className="text-[11px]">これまで</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
