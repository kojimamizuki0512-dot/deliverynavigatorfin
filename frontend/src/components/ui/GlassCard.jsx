import React from "react";

/**
 * ガラス調コンテナ
 * ・装飾レイヤーは pointer-events: none で非インタラクティブ
 * ・コンテンツは z-10 で前面
 */
export default function GlassCard({ className = "", children }) {
  return (
    <section
      className={
        "relative rounded-2xl border border-white/10 " +
        "bg-[rgba(17,25,40,0.65)] backdrop-blur-md " +
        "shadow-[0_8px_30px_rgba(0,0,0,.35)] " +
        className
      }
    >
      {/* 装飾グロー（タップを拾わない） */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -inset-1 opacity-40 bg-[radial-gradient(600px_200px_at_20%_-10%,rgba(16,185,129,.22),transparent),radial-gradient(500px_180px_at_120%_120%,rgba(14,165,233,.18),transparent)]" />
      </div>

      {/* 実コンテンツ */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
