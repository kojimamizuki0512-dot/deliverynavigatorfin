import React from "react";

/**
 * AI Route Suggestion（参照画像に寄せたガラスUI）
 * props:
 *  - items: [{time: "11:00", icon: "lock"|"nav"|"bolt", text: "..."}, ...]
 *  - predicted: number（予測収益）
 *
 * props が無い時はデモ内容でレンダリングする。
 */
const DEFAULT_ITEMS = [
  { time: "11:00", icon: "lock", text: "渋谷 道玄坂クラスターに滞在" },
  { time: "11:30", icon: "nav", text: "恵比寿へリポジション" },
  { time: "12:00", icon: "bolt", text: "駅周辺でピーク狙い" },
];

function IconBadge({ kind = "lock" }) {
  // 依存を増やさないためシンプルなSVGを内製
  const base =
    "inline-flex shrink-0 items-center justify-center h-9 w-9 rounded-2xl bg-white/8 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
  switch (kind) {
    case "nav":
      return (
        <div className={`${base}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l4 9-9 4 5-13Z" fill="currentColor" className="text-emerald-300" />
          </svg>
        </div>
      );
    case "bolt":
      return (
        <div className={`${base}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" fill="currentColor" className="text-emerald-300" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${base}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 11V8a6 6 0 1 1 12 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v3Z" fill="currentColor" className="text-emerald-300" />
          </svg>
        </div>
      );
  }
}

function Row({ time, icon, text }) {
  return (
    <div
      className="
        flex items-center gap-3 sm:gap-4
        rounded-2xl px-3.5 py-3.5
        bg-white/4 border border-white/8
      "
    >
      <div className="w-[54px] text-right pr-1 tabular-nums text-sm sm:text-[15px] text-white/70">{time}</div>
      <IconBadge kind={icon} />
      <div className="flex-1 text-[15px] sm:text-[16px] leading-[1.4] text-white/85">
        {text}
      </div>
    </div>
  );
}

export default function RouteCard({ items, predicted }) {
  const data = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS;
  const pred = Number.isFinite(predicted) ? Math.round(predicted) : 12400;

  return (
    <div className="relative">
      {/* 外側のガラスカード */}
      <div
        className="
          relative overflow-hidden rounded-[28px]
          border border-white/10 bg-white/6 backdrop-blur-md
          shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.35)]
          px-5 py-5 sm:px-6 sm:py-6
        "
      >
        {/* エメラルドのグロー */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-8 top-10 h-44 w-44 rounded-full bg-emerald-400/18 blur-2xl" />
          <div className="absolute -left-24 bottom-4 h-60 w-60 rounded-full bg-emerald-500/12 blur-3xl" />
        </div>

        {/* タイトル */}
        <h3 className="relative z-10 text-[20px] sm:text-[21px] font-semibold tracking-[0.02em] text-white/90">
          AI Route Suggestion
        </h3>

        {/* 内側のカード（暗め） */}
        <div
          className="
            relative z-10 mt-4 rounded-[24px]
            border border-white/8 bg-black/25 backdrop-blur-sm
            p-3.5 sm:p-4
          "
        >
          <div className="flex flex-col gap-3.5">
            {data.map((r, i) => (
              <Row key={`${r.time}-${i}`} time={r.time} icon={r.icon} text={r.text} />
            ))}
          </div>

          {/* 予測収益 */}
          <div
            className="
              mt-4 rounded-2xl border border-white/8 bg-white/4
              px-4 py-4
            "
          >
            <div className="text-[14px] text-white/65">予測収益</div>
            <div className="mt-1 text-emerald-300 text-[40px] sm:text-[44px] font-bold tracking-tight">
              {"¥" + pred.toLocaleString("ja-JP")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
