// frontend/src/components/ui/GlassCard.jsx
import React from "react";

/**
 * ガラス風カード（基準画像準拠）
 * - 角丸 R=28
 * - 背景: 透過白(5%) + blur + 極薄の輪郭
 * - 右奥に大きめのエメラルド面光（小さな点光は無し）
 * - 内側のビネットで層感を締める
 */
export default function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px]",
        "backdrop-blur-xl bg-white/5",
        "ring-1 ring-white/10",
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      {/* --- 面光（大きなグリーングローのみ） --- */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(120%_80%_at_70%_50%,rgba(16,185,129,0.18),rgba(16,185,129,0.08)_45%,transparent_70%)]",
          "opacity-70 blur-xl",
        ].join(" ")}
      />

      {/* --- 周辺ビネット（締め） --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]"
      />

      {/* --- 実内容 --- */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
