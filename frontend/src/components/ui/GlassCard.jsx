// frontend/src/components/ui/GlassCard.jsx
import React from "react";

export default function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        // ベース：柔らかいガラス質感
        "relative overflow-hidden rounded-[28px]",
        "backdrop-blur-2xl bg-white/5",
        "ring-1 ring-white/10",
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      {/* 内側のビネット（周辺をわずかに落とす） */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]" />

      {/* 右奥の面グロー（エメラルドの“面のにじみ”） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70">
        <div className="-inset-8 absolute blur-2xl bg-[radial-gradient(240px_220px_at_65%_45%,rgba(109,242,197,0.35),rgba(109,242,197,0.12)_40%,transparent_70%)]" />
      </div>

      {/* 小さな点光 3つ（右側に縦に並ぶボケ光） */}
      <span className="pointer-events-none absolute right-[10%] top-[28%] w-8 h-8 blur-xl opacity-70 mix-blend-screen bg-[radial-gradient(circle_at_center,rgba(168,255,216,0.55),transparent_65%)]" />
      <span className="pointer-events-none absolute right-[6%] top-[55%]  w-7 h-7 blur-xl opacity-70 mix-blend-screen bg-[radial-gradient(circle_at_center,rgba(168,255,216,0.45),transparent_65%)]" />
      <span className="pointer-events-none absolute right-[14%] bottom-[18%] w-6 h-6 blur-xl opacity-70 mix-blend-screen bg-[radial-gradient(circle_at_center,rgba(168,255,216,0.45),transparent_65%)]" />

      {/* 実内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
