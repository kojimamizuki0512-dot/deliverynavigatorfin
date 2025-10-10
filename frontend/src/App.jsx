import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import RouteCard from "./components/RouteCard.jsx";
import RecordInputCard from "./components/RecordInputCard.jsx";
import TabBar from "./components/TabBar.jsx";

// ===== ローカル保存のキー =====
const GOAL_KEY = "dnf_goal_monthly";

function useDeviceId() {
  // 端末ごと識別（バックは X-Device-Id を見てゲスト割り当て）
  return useMemo(() => {
    const k = "dnf_device_id";
    let id = localStorage.getItem(k);
    if (!id) {
      id = (crypto.randomUUID?.() || String(Math.random()).slice(2)) + "";
      localStorage.setItem(k, id);
    }
    return id;
  }, []);
}

export default function App() {
  useDeviceId();

  // ===== 画面タブ =====
  const [tab, setTab] = useState("cockpit"); // "cockpit" | "record" | "history"

  // ===== ダッシュボード/実績 =====
  const [route, setRoute] = useState([]);
  const [records, setRecords] = useState([]); // 履歴タブ用（これまでの実績）
  const [monthTotal, setMonthTotal] = useState(0);
  const [msg, setMsg] = useState("");

  // 目標金額（ローカル保持）
  const [monthlyGoal, setMonthlyGoal] = useState(() => {
    const v = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(v) && v > 0 ? v : 120000;
  });

  // 初期ロード
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setMsg("");
    try {
      const [r, recs, total] = await Promise.all([
        api.dailyRoute().catch(() => []),
        api.records().catch(() => []),
        api.monthlyTotal().catch(() => ({ total: 0 })),
      ]);
      setRoute(Array.isArray(r) ? r : r?.route || []);
      setRecords(Array.isArray(recs) ? recs : []);
      setMonthTotal(Number(total?.total || 0));
    } catch {
      setMsg("データ取得に失敗しました。");
    }
  }

  // 部分取得
  async function refreshMonthly() {
    try {
      const t = await api.monthlyTotal();
      setMonthTotal(Number(t?.total || 0));
    } catch {}
  }
  async function refreshRecords() {
    try {
      const recs = await api.records();
      setRecords(Array.isArray(recs) ? recs : []);
    } catch {}
  }

  // 記録保存後に親で即時反映
  function handleSaved() {
    // どちらも更新（コックピット & これまでの実績）
    refreshMonthly();
    refreshRecords();
  }

  function changeGoal() {
    const v = window.prompt("月間目標金額（円）を入力してください。", String(monthlyGoal));
    if (!v) return;
    const n = Number(String(v).replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    localStorage.setItem(GOAL_KEY, String(n));
    setMonthlyGoal(n);
    refreshMonthly();
  }

  // 達成率
  const progressPct = Math.max(0, Math.min(100, Math.floor((monthTotal / monthlyGoal) * 100)));

  // 共通カード枠（グラス風）
  function Card({ children, className = "" }) {
    return (
      <section
        className={[
          "rounded-3xl bg-white/[.04] border border-white/10",
          "shadow-[0_10px_80px_-20px_rgba(0,0,0,.6)]",
          "backdrop-blur-md p-4 md:p-5",
          className,
        ].join(" ")}
      >
        {children}
      </section>
    );
  }

  // ====== 画面 ======
  const CockpitScreen = (
    <div className="space-y-4">
      <Card className="relative overflow-hidden">
        <div className="text-sm text-neutral-300/80 mb-2 truncate">Cockpit Dashboard</div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-3 rounded-full"
              style={{
                width: `${progressPct}%`,
                background:
                  "linear-gradient(90deg, rgba(16,185,129,.8) 0%, rgba(5,150,105,.9) 100%)",
              }}
            />
          </div>
          <div className="text-neutral-300 text-sm tabular-nums w-10 text-right">{progressPct}%</div>
        </div>

        <div className="mt-2 text-lg font-semibold tabular-nums">
          ¥{monthTotal.toLocaleString()} <span className="text-neutral-400">/ ¥{monthlyGoal.toLocaleString()}</span>
        </div>

        <button
          onClick={changeGoal}
          className="absolute right-4 top-4 text-xs px-2 py-1 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15"
        >
          目標を変更
        </button>
      </Card>

      <Card>
        <div className="text-xl font-semibold mb-2 truncate">AI Route Suggestion</div>
        {/* ルートカード（中の文言が長いときは折り返し/省略） */}
        <div className="text-sm text-neutral-300/90">
          <RouteCard route={route} />
        </div>
      </Card>
    </div>
  );

  const RecordScreen = (
    <div className="space-y-4">
      <Card>
        <div className="text-xl font-semibold mb-3 truncate">実績を記録</div>
        {/* 入力欄の文字溢れ対策：内部で w-full, text-ellipsis, break-words を使う */}
        <RecordInputCard onSaved={handleSaved} />
      </Card>
    </div>
  );

  const HistoryScreen = (
    <div className="space-y-4">
      <Card>
        <div className="text-xl font-semibold mb-3 truncate">これまでの実績</div>
        {/* シンプルな履歴リスト（即時反映用に App 側の records を使用） */}
        <ul className="divide-y divide-white/10">
          {records.length === 0 && (
            <li className="py-6 text-neutral-400 text-sm">まだ記録がありません。</li>
          )}
          {records.map((r) => (
            <li key={r.id} className="py-3 flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-neutral-300 whitespace-normal break-words">
                  {r.title || "record"}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-base font-semibold tabular-nums shrink-0">¥{Number(r.value || 0).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* 背景グラデーション */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(16,185,129,.18), transparent 60%), radial-gradient(1200px 600px at 50% 120%, rgba(0,0,0,.7), #050505 70%)",
        }}
      />

      {/* ヘッダー */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-center tracking-wide">
            Delivery Navigator
          </h1>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="mx-auto max-w-5xl px-4 py-5 pb-28">
        {msg && (
          <div className="mb-4 p-3 rounded-lg bg-amber-900/40 border border-amber-800 text-amber-200">
            {msg}
          </div>
        )}

        {tab === "cockpit" && CockpitScreen}
        {tab === "record" && RecordScreen}
        {tab === "history" && HistoryScreen}
      </main>

      {/* ボトムタブ */}
      <TabBar current={tab} onChange={setTab} />
    </div>
  );
}
