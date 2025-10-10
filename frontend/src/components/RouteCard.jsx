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
        {/* 見出し（ミント系グラデ）＋ サブラベル */}
        <div className="flex items-center justify-between">
          <h2
            className="text-[22px] sm:text-[24px] font-semibold tracking-[0.2px] leading-tight
                       bg-gradient-to-r from-[#E6FFF4] to-[#7CF5C8] bg-clip-text text-transparent"
          >
            AI Route Suggestion
          </h2>

          {/* 右上バッジ（弱めの存在感） */}
          <div className="select-none ml-3 shrink-0">
            <div className="rounded-full px-2.5 py-1 text-[11px] font-semibold
                            bg-emerald-500/85 text-emerald-950 shadow
                            ring-1 ring-white/20">
              demo
            </div>
          </div>
        </div>

        <div className="mt-1 text-[13px] text-emerald-100/60">
          この時間帯の推奨アクション
        </div>

        {/* タイムライン（SVGアイコン版） */}
        <ul className="mt-4 space-y-2.5">
          {demo.map((row, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-[18px] px-4 py-3
                         ring-1 ring-white/10 bg-black/20"
            >
              {/* 時刻：タブラーナムで桁揃え、やや淡く */}
              <span className="w-12 shrink-0 tabular-nums text-emerald-100/75 tracking-tight">
                {row.time}
              </span>

              {/* アイコンチップ：12px角のチップイメージに近づける（高さ低め） */}
              <span
                className="grid place-items-center h-8 w-8 shrink-0
                           rounded-xl bg-[#0E1512]/60 ring-1 ring-white/10"
              >
                <Icon
                  name={row.icon}
                  size={19}
                  strokeWidth={1.75}
                  className="text-emerald-300"
                  title={row.icon}
                />
              </span>

              {/* 本文：16px、行高やや詰め、発色は控えめ */}
              <span className="text-[16px] leading-[1.25] text-emerald-50/90 tracking-[0.005em]">
                {row.text}
              </span>
            </li>
          ))}
        </ul>

        {/* 予測収益（太字・タブラーナム・わずかに字詰め） */}
        <div className="mt-5 rounded-[18px] ring-1 ring-white/10 bg-black/20 px-4 py-4">
          <div className="text-[13px] text-emerald-100/70">予測収益</div>
          <div
            className="mt-1 tabular-nums font-extrabold text-emerald-300
                       text-[38px] sm:text-[42px]"
            style={{ letterSpacing: "-0.01em" }}
          >
            ¥12,400
          </div>
        </div>

        {/* インジケータ（弱く・横幅に強弱） */}
        <div className="mt-3 flex justify-center items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-emerald-400/55" />
          <span className="h-1.5 w-2 rounded-full bg-emerald-400/28" />
          <span className="h-1.5 w-2 rounded-full bg-emerald-400/28" />
        </div>
      </GlassCard>
    </section>
  );
}
