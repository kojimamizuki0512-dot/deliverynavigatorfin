// frontend/src/components/ui/ProgressBar.jsx
import React from "react";

/**
 * Robust ProgressBar
 * - 受け取り方を多重対応：percent or (value/max) or (current/goal)
 * - 角丸ピル / 薄いリング / 上面ハイライト / エメラルドのグラデ
 * - トランジションあり（数値が更新された時に滑らかに）
 */
export default function ProgressBar(props) {
  const {
    percent,
    value,
    max,
    current,
    goal,
    className = "",
    height = 10, // px
  } = props;

  // 値の推定（どのプロップでも受け付け）
  let p = 0;
  if (typeof percent === "number") {
    p = percent;
  } else if (typeof value === "number" && typeof max === "number" && max > 0) {
    p = (value / max) * 100;
  } else if (typeof current === "number" && typeof goal === "number" && goal > 0) {
    p = (current / goal) * 100;
  }
  p = Math.max(0, Math.min(100, p)); // 0–100 にクランプ

  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-full",
        "bg-white/10 ring-1 ring-white/10",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      ].join(" ")}
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
    >
      {/* フィル（エメラルドのグラデ / 角丸ピル / アニメ） */}
      <div
        className={[
          "h-full rounded-full",
          "bg-[linear-gradient(90deg,rgba(149,246,207,0.85)_0%,rgba(16,185,129,0.95)_45%,rgba(99,232,190,0.65)_100%)]",
          "transition-[width] duration-300 ease-out",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_6px_16px_-6px_rgba(16,185,129,0.6)]",
        ].join(" ")}
        style={{ width: `${p}%` }}
      />

      {/* 上面のグロス（細いハイライト） */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.06)_35%,rgba(255,255,255,0)_100%)]"
      />

      {/* 微妙なビネットで深み */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_24px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}
