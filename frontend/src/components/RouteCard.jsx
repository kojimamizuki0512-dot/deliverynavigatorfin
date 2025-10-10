// frontend/src/components/RouteCard.jsx
import React from "react";
import GlassCard from "./ui/GlassCard.jsx";

// 提案行の本文を“クールに目立たせる”専用コンポーネント
function CoolLabel({ children }) {
  return (
    <span
      className={[
        // フォント指針：やや太め＋微マイナス字間
        "font-semibold tracking-[-0.01em]",
        // エメラルドのグラデ文字（fallbackは下の text-emerald-200）
        "text-transparent bg-clip-text",
        "bg-[linear-gradient(90deg,#E9FFF6_0%,#7CF5C8_55%,#5BE1B6_100%)]",
        "text-emerald-200",
        // 文字のにじみを極薄で（視認性を損ねない程度）
        "drop-shadow-[0_0_10px_rgba(28,239,194,0.25)]",
      ].join(" ")}
      style={{
        // Safari等でも読みやすい程度のごく控えめ発光
        textShadow: "0 0 6px rgba(28,239,194,0.20)",
      }}
    >
      {children}
    </span>
  );
}

function StepRow({ time, icon, label }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/3 ring-1 ring-white/10 px-4 py-3">
      {/* 時刻（固定幅で整列） */}
      <div className="w-[3.75rem] shrink-0 text-[15px] text-slate-200/80 tabular-nums">
        {time}
      </div>

      {/* アイコン（丸チップ） */}
      <div className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-[#0E1512]/60 ring-1 ring-white/10">
        <span className="text-emerald-300/90 text-[18px] leading-none">{icon}</span>
      </div>

      {/* 本文（ここだけ“クールに目立つ”仕上げ） */}
      <div className="flex-1 text-[16.5px] leading-snug">
        <CoolLabel>{label}</CoolLabel>
      </div>
    </div>
  );
}

export default function RouteCard() {
  // デモデータ（日本語）
  const steps = [
    { time: "11:00", icon: "🔒", label: "渋谷 道玄坂クラスターに滞在" },
    { time: "11:30", icon: "🧭", label: "恵比寿へリポジション" },
    { time: "12:00", icon: "⚡", label: "駅周辺でピーク狙い" },
  ];

  return (
    <GlassCard className="relative">
      {/* ヘッダ */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[20px] sm:text-[21px] font-semibold tracking-tight text-slate-100">
          AI Route Suggestion
        </h2>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-300/30">
          demo
        </span>
      </div>

      <p className="text-slate-300/70 text-[14px] mb-3">この時間帯の推奨アクション</p>

      {/* 行リスト */}
      <div className="space-y-3">
        {steps.map((s, i) => (
          <StepRow key={i} time={s.time} icon={s.icon} label={s.label} />
        ))}
      </div>

      {/* 予測収益 */}
      <div className="mt-5 rounded-2xl bg-white/3 ring-1 ring-white/10 px-4 py-4">
        <div className="text-slate-300/80 text-[14px] mb-1">予測収益</div>
        <div className="text-[38px] sm:text-[40px] font-bold tracking-[-0.01em] text-emerald-300/95 tabular-nums">
          ¥12,400
        </div>
      </div>
    </GlassCard>
  );
}
