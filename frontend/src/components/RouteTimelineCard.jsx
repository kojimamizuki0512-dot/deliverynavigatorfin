import React from "react";

/**
 * AI Route Suggestion（デモ）
 * - 1枚ガラスカード化
 * - 行は .row-thin を使いアイコン/時刻/本文の3カラム
 * - 下部に「予測収益」ブロック＋大きな金額
 * - 既存からの props が来ても壊れないようにフォールバックを用意
 */

const demoItems = [
  { time: "11:00", icon: LockIcon, text: "渋谷 道玄坂クラスターに滞在" },
  { time: "11:30", icon: ArrowIcon, text: "恵比寿へリポジション" },
  { time: "12:00", icon: BoltIcon, text: "駅周辺でピーク狙い" },
];

export default function RouteTimelineCard(props) {
  const items = Array.isArray(props.items) && props.items.length > 0 ? props.items : demoItems;
  const predicted = props.predicted ?? 12400; // 円

  return (
    <section className="glass-card round-xl gap-row">
      {/* ヘッダー */}
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="glass-title">AI Route Suggestion</h3>
        <span className="ml-3 rounded-full px-2 py-0.5 text-[12px] border border-[rgba(255,255,255,.06)] text-[var(--emerald-1)] bg-[rgba(12,24,22,.55)]">
          デモ
        </span>
      </div>

      {/* タイムライン行 */}
      <div className="gap-row">
        {items.map((it, idx) => (
          <div key={idx} className="row-thin">
            <div className="row-time">{it.time}</div>
            <div className="icon-badge">{(it.icon ?? DotIcon)()}</div>
            <div className="row-text">{it.text}</div>
          </div>
        ))}
      </div>

      {/* 予測収益 */}
      <div className="mt-2 row-thin flex-col items-start">
        <div className="text-faint mb-1">予測収益</div>
        <div className="amount-emerald">
          {formatJPY(predicted)}
        </div>
      </div>
    </section>
  );
}

/* -------- helpers -------- */

function formatJPY(n) {
  try {
    const v = Number(n ?? 0);
    return "¥" + v.toLocaleString("ja-JP");
  } catch {
    return "¥0";
  }
}

/* -------- minimal inline icons (依存なし) -------- */

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 10V8a5 5 0 1110 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="5" y="10" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="5" fill="currentColor" />
    </svg>
  );
}
