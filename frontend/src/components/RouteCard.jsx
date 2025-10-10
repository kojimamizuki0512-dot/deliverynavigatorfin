import React from "react";

/**
 * AI Route Suggestion（デモ）
 * 画像のような：左に時刻／中央にアイコン付き行動／全体にエメラルドのグロー
 * route が空ならデモデータを表示します。
 */
export default function RouteCard({ route = [] }) {
  const demo = [
    { time: "11:00", icon: "🔒", text: "渋谷 道玄坂クラスターに滞在" },
    { time: "11:30", icon: "🧭", text: "恵比寿へリポジション" },
    { time: "12:00", icon: "⚡", text: "駅周辺でピーク狙い" },
  ];

  const items = Array.isArray(route) && route.length > 0 ? route : demo;

  return (
    <div className="relative">
      {/* ガラスカード本体（丸み強め + 内外シャドウ + ぼかし） */}
      <div className="
        relative overflow-hidden rounded-[28px]
        border border-white/10 bg-white/5 backdrop-blur-md
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.35)]
        px-5 py-5 sm:px-6 sm:py-6
      ">
        {/* エメラルドの重ねグロー（装飾レイヤー） */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-emerald-500/18 blur-3xl" />
          <div className="absolute right-24 top-40 h-36 w-36 rounded-full bg-emerald-400/22 blur-2xl" />
          <div className="absolute left-6 top-24 h-20 w-20 rounded-full bg-emerald-300/10 blur-xl" />
        </div>

        {/* タイトル */}
        <h3 className="relative z-10 text-[22px] font-semibold tracking-[0.02em] text-white/90">
          AI Route Suggestion
        </h3>

        {/* タイムライン */}
        <div className="relative z-10 mt-4 space-y-3">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="
                group flex items-center gap-4
                rounded-2xl border border-white/10 bg-black/25
                px-4 py-3 sm:px-5 sm:py-3.5
                shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
              "
            >
              {/* 時刻 */}
              <div className="w-16 shrink-0 text-right tabular-nums text-[15px] text-white/60">
                {it.time}
              </div>
              {/* アイコン（丸チップ） */}
              <div
                className="
                  grid place-items-center h-10 w-10 shrink-0
                  rounded-2xl bg-emerald-400/10
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                  ring-1 ring-emerald-300/20
                "
              >
                <span className="text-[18px] leading-none">{it.icon}</span>
              </div>
              {/* 説明 */}
              <div className="min-w-0 text-[15px] leading-6 text-white/85">
                <div className="truncate">{it.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 予測収益ブロック */}
        <div
          className="
            relative z-10 mt-5 rounded-3xl
            border border-white/10 bg-black/30 px-5 py-4
            shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
          "
        >
          <div className="text-[14px] text-white/60">予測収益</div>
          <div className="mt-1 text-4xl sm:text-[44px] font-extrabold tracking-tight text-emerald-300">
            ¥12,400
          </div>
        </div>
      </div>
    </div>
  );
}
