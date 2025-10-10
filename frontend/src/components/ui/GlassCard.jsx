// frontend/src/components/ui/GlassCard.jsx
import React from "react";

export default function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        // ベース：柔らかいガラス
        "relative overflow-hidden rounded-[28px]",
        "backdrop-blur-xl bg-white/5",
        // 輪郭は極薄に
        "ring-1 ring-white/10",
        // 深い影で浮かせる
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        // 余白
        "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      {/* 内側エメラルドのグロー（理想画像の緑のにじみ） */}
      <div
        className={[
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(120%_80%_at_70%_60%,rgba(16,185,129,0.18),rgba(16,185,129,0.08)_45%,transparent_70%)]",
          "opacity-70 blur-xl",
        ].join(" ")}
      />
      {/* 追加の柔らかい周辺ビネット */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]"
      />
      {/* 実内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
