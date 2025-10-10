// frontend/src/components/RouteCard.jsx
import React from "react";
import GlassCard from "./ui/GlassCard.jsx";

// --- SVG Icons (Heroicons風) ---
const Chip = ({ children }) => (
  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0E1512]/70 ring-1 ring-white/10 shadow-inner">
    {children}
  </span>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="text-emerald-300">
    <path
      fill="currentColor"
      d="M12 2a4 4 0 0 0-4 4v3H7a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-1V6a4 4 0 0 0-4-4Zm-2 7V6a2 2 0 1 1 4 0v3H10Z"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="text-emerald-300">
    <path
      fill="currentColor"
      d="M12 2l3.5 7.5L23 13l-7.5 3.5L12 24l-3.5-7.5L1 13l7.5-3.5L12 2Z"
    />
  </svg>
);

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="text-emerald-300">
    <path
      fill="currentColor"
      d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"
    />
  </svg>
);

export default function RouteCard() {
  const rows = [
    { time: "11:00", icon: <LockIcon />, text: "渋谷 道玄坂クラスターに滞在" },
    { time: "11:30", icon: <ArrowIcon />, text: "恵比寿へリポジション" },
    { time: "12:00", icon: <BoltIcon />, text: "駅周辺でピーク狙い" },
  ];

  return (
    <GlassCard className="mt-6">
      {/* タイトル行 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-tight text-emerald-50">
          AI Route Suggestion
        </h2>
        <span className="rounded-full bg-emerald-500/20 text-emerald-200 text-xs px-3 py-1 ring-1 ring-emerald-300/30">
          demo
        </span>
      </div>

      {/* サブコピー */}
      <p className="text-[14px] text-emerald-100/70 mb-3">
        この時間帯の推奨アクション
      </p>

      {/* 行アイテム */}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl bg-black/20 ring-1 ring-white/5 px-4 py-3"
          >
            <div className="w-[48px] shrink-0 text-emerald-100/80 font-medium tracking-tight">
              {r.time}
            </div>
            <Chip>{r.icon}</Chip>
            <div className="text-emerald-50/90">{r.text}</div>
          </div>
        ))}
      </div>

      {/* 予測収益 */}
      <div className="mt-5 rounded-2xl bg-black/20 ring-1 ring-white/5 px-4 py-4">
        <div className="text-emerald-100/70 mb-1">予測収益</div>
        <div className="tabular-nums tracking-tight font-bold text-emerald-300 text-[40px] sm:text-[44px]">
          ¥12,400
        </div>
      </div>
    </GlassCard>
  );
}
