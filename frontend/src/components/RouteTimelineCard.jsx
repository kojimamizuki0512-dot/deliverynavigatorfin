import React from "react";

/**
 * AI Route Suggestion（デモ）
 * - 1枚ガラスカード + 背後にゴーストカードを重ねて奥行き演出
 * - 右側にエメラルドの発光ドット（radial-gradient）
 * - ヘッダー右に円形バッジ
 * - 行は .row-thin（Step1で導入済みのユーティリティ）を使用
 */

const demoItems = [
  { time: "11:00", icon: LockIcon, text: "渋谷 道玄坂クラスターに滞在" },
  { time: "11:30", icon: ArrowIcon, text: "恵比寿へリポジション" },
  { time: "12:00", icon: BoltIcon, text: "駅周辺でピーク狙い" },
];

export default function RouteTimelineCard(props) {
  const items = Array.isArray(props.items) && props.items.length > 0 ? props.items : demoItems;
  const predicted = props.predicted ?? 12400; // 円
  const badge = props.badge ?? "0";

  return (
    <section
      className="glass-card round-xl gap-row relative overflow-hidden"
      style={{
        padding: "18px 18px 16px 18px",
        borderRadius: 24,
      }}
    >
      {/* --- 背景：右側のエメラルド発光（radial-gradient を3つ重ね） --- */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(160px 160px at 95% 20%, rgba(16,185,129,.20), rgba(0,0,0,0) 60%)," +
            "radial-gradient(160px 160px at 95% 50%, rgba(16,185,129,.16), rgba(0,0,0,0) 62%)," +
            "radial-gradient(160px 160px at 95% 80%, rgba(16,185,129,.22), rgba(0,0,0,0) 64%)",
          opacity: 0.9,
          mixBlendMode: "screen",
        }}
      />

      {/* --- 背後の“重なりガラス” --- */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-14px",
          top: "20px",
          bottom: "20px",
          width: "86%",
          borderRadius: 24,
          background: "rgba(10,16,16,.55)",
          border: "1px solid rgba(255,255,255,.04)",
          filter: "drop-shadow(0 10px 18px rgba(0,0,0,.35))",
          transform: "translateX(8px) scale(.98)",
        }}
      />

      {/* --- ヘッダー --- */}
      <div className="flex items-center justify-between mb-2 relative">
        <h3
          className="glass-title"
          style={{
            fontSize: 22,
            letterSpacing: 0.2,
          }}
        >
          AI Route Suggestion
        </h3>

        {/* 円形バッジ（理想画像の “0” 表示） */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            color: "var(--emerald-1)",
            background:
              "radial-gradient(60% 60% at 50% 40%, rgba(16,185,129,.25), rgba(0,0,0,0))",
            border: "1px solid rgba(16,185,129,.35)",
            boxShadow:
              "inset 0 0 12px rgba(16,185,129,.35), 0 0 18px rgba(16,185,129,.15)",
          }}
        >
          <span style={{ fontWeight: 700 }}>{badge}</span>
        </div>
      </div>

      {/* --- タイムライン行 --- */}
      <div className="gap-row relative">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="row-thin"
            style={{
              background: "rgba(0,0,0,.18)",
              border: "1px solid rgba(255,255,255,.05)",
              borderRadius: 16,
              padding: "10px 12px",
            }}
          >
            <div className="row-time" style={{ minWidth: 54 }}>
              {it.time}
            </div>
            <div className="icon-badge" style={{ marginRight: 10 }}>
              {(it.icon ?? DotIcon)()}
            </div>
            <div className="row-text">{it.text}</div>
          </div>
        ))}
      </div>

      {/* --- 予測収益 --- */}
      <div className="mt-3 relative">
        <div className="text-faint mb-1" style={{ fontSize: 14, opacity: 0.8 }}>
          Predicted Earnings
        </div>
        <div className="amount-emerald" style={{ fontSize: 44, lineHeight: 1.1 }}>
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
