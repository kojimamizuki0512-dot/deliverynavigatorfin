// frontend/src/components/RouteCard.jsx
import React from "react";
import GlassCard from "./ui/GlassCard.jsx";

/* --- inline SVG icons (ベクター化 / 色はミント系) --- */
const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <rect x="5" y="11" width="14" height="10" rx="3.5" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);
const IconNav = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 11.5l16-7-7 16-1.8-6.2L4 11.5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
  </svg>
);
const IconBolt = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
  </svg>
);

/* --- demo timeline data（日本語表記） --- */
const demo = [
  { time: "11:00", icon: "lock", text: "渋谷 道玄坂クラスターに滞在" },
  { time: "11:30", icon: "nav", text: "恵比寿へリポジション" },
  { time: "12:00", icon: "bolt", text: "駅周辺でピーク狙い" },
];

function Chip({ type }) {
  const Icon =
    type === "lock" ? IconLock : type === "nav" ? IconNav : IconBolt;
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "size-9 rounded-xl",
        "bg-[#0E1512]/60 ring-1 ring-white/10",
        "shadow-[0_2px_10px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "text-emerald-300",
      ].join(" ")}
    >
      <Icon className="size-[18px]" />
    </span>
  );
}

function Row({ time, icon, text }) {
  return (
    <div
      className={[
        "flex items-center gap-4 w-full",
        "rounded-[20px] ring-1 ring-white/10 bg-black/25",
        "px-4 py-3",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      ].join(" ")}
    >
      <div className="min-w-[52px] text-white/70 tabular-nums tracking-wide">
        {time}
      </div>
      <Chip type={icon} />
      <div className="text-white/90 leading-tight">{text}</div>
    </div>
  );
}

/**
 * RouteCard:
 * - 前景: GlassCard（手順1で強化済み）
 * - 後景: 2枚の“奥カード”（縮小-6% / Y+8px / 不透明度70%）でデッキ表現
 * - タイムライン行 / 予測収益の強調（tabular-nums）
 */
export default function RouteCard() {
  return (
    <div className="relative">
      {/* --- deck behind (後列2枚) --- */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 -z-10",
          "scale-[0.97] translate-y-[4px] opacity-80",
        ].join(" ")}
        style={{ transformOrigin: "top center" }}
      >
        <div className="h-full rounded-[28px] ring-1 ring-white/10 bg-white/[0.03] backdrop-blur-xl" />
      </div>
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 -z-10",
          "scale-[0.94] translate-y-[8px] opacity-70",
        ].join(" ")}
        style={{ transformOrigin: "top center" }}
      >
        <div className="h-full rounded-[28px] ring-1 ring-white/10 bg-white/[0.02] backdrop-blur-xl" />
      </div>

      {/* --- foreground card --- */}
      <GlassCard className="px-5 sm:px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.01em]">
            AI Route Suggestion
          </h2>
          {/* 右側の小さな丸メーター（デモ用） */}
          <span className="inline-flex items-center justify-center size-9 rounded-full bg-emerald-400/15 ring-1 ring-white/10 text-emerald-300 tabular-nums">
            0
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {demo.map((it, i) => (
            <Row key={i} time={it.time} icon={it.icon} text={it.text} />
          ))}
        </div>

        {/* 予測収益ブロック */}
        <div
          className={[
            "mt-5 rounded-[20px] ring-1 ring-white/10 bg-black/25 px-4 py-4",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          ].join(" ")}
        >
          <div className="text-white/70 text-[14px]">予測収益</div>
          <div className="mt-1 text-emerald-300 font-bold tabular-nums tracking-[-0.01em] text-[40px] sm:text-[44px]">
            ¥12,400
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
