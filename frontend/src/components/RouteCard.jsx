// frontend/src/components/RouteCard.jsx
import React from "react";
import GlassCard from "./ui/GlassCard";
import Icon from "./ui/Icon";

// デモ用の提案データ（必要なら後でAPI差し替え）
const demo = [
  { time: "11:00", icon: "lock",    text: "渋谷 道玄坂クラスターに滞在" },
  { time: "11:30", icon: "compass", text: "恵比寿へリポジション" },
  { time: "12:00", icon: "bolt",    text: "駅周辺でピーク狙い" },
];

export default function RouteCard() {
  return (
    <section className="mt-6 px-4 sm:px-6">
      {/* 主役のガラスカード（後列なしで視認性重視） */}
      <GlassCard className="relative">
        {/* 見出し */}
        <h2 className="text-[22px] sm:text-[24px] font-semibold tracking-[0.2px] text-emerald-50/90">
          AI Route Suggestion
        </h2>

        {/* 右上バッジ（必要なら値を連動） */}
        <div className="absolute right-4 top-4 select-none">
          <div className="rounded-full px-2.5 py-1 text-xs font-semibold
                          bg-emerald-500/90 text-emerald-950 shadow
                          ring-1 ring-white/20">
            0
          </div>
        </div>

        {/* タイムライン（SVGアイコン版） */}
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

              {/* アイコンチップ：#0E1512/60%、ミント色、SVGストローク1.75 */}
              <span
                className="grid place-items-center h-9 w-9 shrink-0
                           rounded-xl bg-[#0E1512]/60 ring-1 ring-white/10"
              >
                <Icon
                  name={row.icon}
                  size={20}
                  strokeWidth={1.75}
                  className="text-emerald-300"
                  title={row.icon}
                />
              </span>

              <span className="text-[16px] leading-tight text-emerald-50/90">
                {row.text}
              </span>
            </li>
          ))}
        </ul>

        {/* 予測収益（フォント指針: tabular-nums/太字/36–40px相当） */}
        <div className="mt-5 rounded-[18px] ring-1 ring-white/10 bg-black/20 px-4 py-4">
          <div className="text-sm text-emerald-100/70">予測収益</div>
          <div className="mt-1 tabular-nums tracking-tight font-extrabold
                          text-emerald-300 text-[40px] sm:text-[44px]">
            ¥12,400
          </div>
        </div>

        {/* インジケータ（弱く） */}
        <div className="mt-3 flex justify-center gap-2">
          <span className="h-1.5 w-6 rounded-full bg-emerald-400/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/30" />
        </div>
      </GlassCard>
    </section>
  );
}
