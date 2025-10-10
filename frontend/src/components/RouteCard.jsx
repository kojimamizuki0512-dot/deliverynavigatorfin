import React from "react";

/**
 * AI Route Suggestion（デモ）
 * - backend からの props.route が空なら demoItems を表示
 * - 参照画像に寄せたガラスカード＋タイムライン＋予測収益の構成
 */
export default function RouteCard({ route = [] }) {
  const hasData = Array.isArray(route) && route.length > 0;

  // デモ用データ（参照画像ベース）
  const demoItems = [
    { time: "11:00", icon: "🔒", text: "渋谷 道玄坂クラスタに滞在" },
    { time: "11:30", icon: "🧭", text: "恵比寿へリポジション" },
    { time: "12:00", icon: "⚡", text: "駅周辺でピーク狙い" },
  ];
  const items = hasData
    ? route.map((r, i) => ({
        time: r.time || r.eta || r.slot || `--:--`,
        icon: "🧭",
        text:
          r.title ||
          r.action ||
          `${r.from ? `${r.from} → ` : ""}${r.to ?? "次エリアへ"}`,
      }))
    : demoItems;

  const predictedYen = 12400; // デモ金額

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
      {/* 奥行きのためのぼかしグロー */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full blur-2xl opacity-30"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,0.65) 0%, rgba(16,185,129,0.15) 45%, rgba(0,0,0,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full blur-2xl opacity-25"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,0.45) 0%, rgba(16,185,129,0.1) 50%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* 見出し */}
      <h3 className="mb-3 text-xl font-semibold tracking-wide text-white/95">
        AI Route Suggestion
      </h3>

      {/* タイムライン */}
      <ul className="mb-4 space-y-3">
        {items.map((it, idx) => (
          <li
            key={`${it.time}-${idx}`}
            className="grid grid-cols-[60px,36px,1fr] items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2"
          >
            <div className="text-sm tabular-nums text-white/60">{it.time}</div>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400/10 text-lg">
              <span aria-hidden className="select-none">
                {it.icon}
              </span>
            </div>
            <div className="text-[15px] leading-tight text-white/90">{it.text}</div>
          </li>
        ))}
      </ul>

      {/* 予測収益（デモ） */}
      <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
        <div className="text-sm text-white/60">予測収益</div>
        <div className="mt-1 text-4xl font-bold tracking-wide text-emerald-300">
          ¥{predictedYen.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
