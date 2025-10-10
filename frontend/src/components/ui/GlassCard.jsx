// frontend/src/components/ui/GlassCard.jsx
import React from "react";

export default function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        // ベース：柔らかいガラス
        "relative overflow-hidden rounded-[28px]",
        "backdrop-blur-2xl bg-white/5",
        "ring-1 ring-white/10",
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      {/* 周辺ビネット（深み） */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]" />

      {/* 面グロー（右奥の広いにじみ） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80">
        <div className="-inset-10 absolute blur-[90px] bg-[radial-gradient(260px_240px_at_65%_45%,rgba(109,242,197,0.42),rgba(109,242,197,0.18)_40%,transparent_70%)]" />
      </div>

      {/* ===== エメラルドの“発光点”を複数配置（濃いめ＆大きめ） ===== */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen">
        {/* 中心寄り・一番大きい点 */}
        <span className="absolute left-[72%] top-[52%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-emerald-400/55 blur-[110px]" />
        {/* 右寄り中サイズ */}
        <span className="absolute left-[86%] top-[68%] -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full bg-emerald-400/50 blur-[90px]" />
        {/* 下め小サイズ */}
        <span className="absolute left-[62%] top-[78%] -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full bg-emerald-300/55 blur-[80px]" />
        {/* 右上に小粒 */}
        <span className="absolute left-[82%] top-[36%] -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full bg-emerald-300/45 blur-[70px]" />
      </div>
      {/* ======================================================== */}

      {/* 実内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
