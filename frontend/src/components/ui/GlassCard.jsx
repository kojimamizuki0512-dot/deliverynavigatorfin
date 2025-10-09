import React from "react";

/**
 * ガラスカード（全画面で共通利用）
 * - 既存のクラス構造を壊さず、視覚だけ強化
 * - 透明境界をグラデ化 + 背景は薄いグラデ + 深めのシャドウ
 * - 子側の padding をそのまま尊重（App/HistoryList など変更不要）
 */
export default function GlassCard({ children, className = "" }) {
  return (
    <section
      className={`relative rounded-2xl backdrop-blur ${className}`}
      style={{
        // 2レイヤー背景: [padding-box(内容背景)] , [border-box(枠のグラデ)]
        background:
          "linear-gradient(180deg, rgba(19,19,19,0.92), rgba(19,19,19,0.78)) padding-box, " +
          "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04)) border-box",
        border: "1px solid transparent",
        boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)",
      }}
    >
      {children}
    </section>
  );
}
