// frontend/src/components/RouteCard.jsx
import React from "react";
import GlassCard from "./ui/GlassCard";

// デモ用の提案データ（必要なら後でAPI差し替え）
const demo = [
  { time: "11:00", icon: "🔒", text: "渋谷 道玄坂クラスターに滞在" },
  { time: "11:30", icon: "🧭", text: "恵比寿へリポジション" },
  { time: "12:00", icon: "⚡", text: "駅周辺でピーク狙い" },
];

export default function RouteCard() {
  return (
    <section className="relative mt-6 px-4 sm:px-6">
      {/* ===== 後列カード（縮小・Yシフト・半透明） ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-2 h-[88%] rounded-[26px]
                   backdrop-blur-xl bg-white/5 ring-1 ring-white/10
                   scale-[.94] translate-y-2 opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-5 h-[82%] rounded-[24px]
                   backdrop-blur-xl bg-white/5 ring-1 ring-white/10
                   scale-[.88] translate-y-3 opacity-60"
      />

      {/* ===== 手前の主役ガラスカード ===== */}
      <GlassCard className="relative">
        {/* 見出し */}
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[0.2px] text-emerald-50/90">
          AI Route Suggestion
        </h2>

        {/* 小さなカウンタバッジ（右上） */}
        <div className="absolute right-4 top-4 select-none">
          <div className="rounded-full px-2.5 py-1 text-xs font-semibold
                          bg-emerald-500/90 text-emerald-950 shadow
                          ring-1 ring-white/20">
            0
          </div>
        </div>

        {/* タイムライン行 */}
        <ul className="mt-4 space-y-3">
          {demo.map((row, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-[18px] px-4 py-3
                         ring-1 ring-white/10 bg-black/20"
            >
              <span className="w-12 shrink-0 tabular-nums text-emerald-100/80">
                {row.time}
              </span>

              <span className="grid place-items-center h-9 w-9 shrink-0
                               rounded-xl bg-[#0E1512]/60 ring-1 ring-white/10 text-lg">
                {row.icon}
              </span>

              <span className="text-[16px] leading-tight text-emerald-50/90">
                {row.text}
              </span>
            </li>
          ))}
        </ul>

        {/* 予測収益 */}
        <div className="mt-5 rounded-[18px] ring-1 ring-white/10 bg-black/20 px-4 py-4">
          <div className="text-sm text-emerald-100/70">予測収益</div>
          <div className="mt-1 tabular-nums tracking-tight font-extrabold
                          text-emerald-300 text-[40px] sm:text-[44px]">
            ¥12,400
          </div>
        </div>

        {/* ページインジケータ（3点） */}
        <div className="mt-3 flex justify-center gap-2">
          <span className="h-1.5 w-6 rounded-full bg-emerald-400/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/40" />
        </div>
      </GlassCard>
    </section>
  );
}
