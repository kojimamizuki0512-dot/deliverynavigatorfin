import React from "react";

/**
 * うっすら透ける“ガラス”カード。
 * - タイトル/右上ツールバー（任意）
 * - 内側に軽いグラデをしいて奥行きを出す
 */
export default function GlassCard({ title, toolbar, className = "", children }) {
  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/[0.04] backdrop-blur-md",
        className,
      ].join(" ")}
    >
      {/* 奥行き用の淡いグラデーション */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />

      {(title || toolbar) && (
        <div className="relative flex items-center justify-between px-4 pt-4">
          {title ? (
            <div className="text-sm font-medium text-neutral-300">{title}</div>
          ) : (
            <span />
          )}
          {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
        </div>
      )}

      <div className={`relative p-4 ${title ? "pt-3" : ""}`}>{children}</div>
    </section>
  );
}
