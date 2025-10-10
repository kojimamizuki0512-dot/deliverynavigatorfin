// frontend/src/components/ui/GlassCard.jsx
import React from "react";

/**
 * 発光仕様（要件準拠）
 * - 色: コア #E9FFF6 → #2ECC71（白寄りエメラルド）
 * - 形: 円（ごく薄く楕円化）
 * - コア径: 6–10px（ここでは 6–8px）
 * - ハロ半径: 80–120px（ここでは 90–110px）
 * - ぼかし: 20–40px（ここでは 28–36px）
 * - 合成: screen（加算系）, 不透明度: 0.72–0.82
 * - 配置: 3–4点（大中小）— 視線誘導のため右〜右下へ寄せ、KPI/見出しから距離を確保
 */
export default function GlassCard({ className = "", children }) {
  // 視線誘導を邪魔しない位置（右〜右下）に配置
  const sparks = [
    // 大：右中段。最も明るいがテキストの外縁に留める
    { x: "86%", y: "50%", halo: 110, blur: 36, opacity: 0.82 },
    // 中：右下。予測収益周辺“外側”のみ照らす
    { x: "82%", y: "72%", halo: 100, blur: 32, opacity: 0.78 },
    // 小：やや左下。カードの奥行きを補助（本文と干渉しない）
    { x: "72%", y: "80%", halo: 90,  blur: 28, opacity: 0.74 },
  ];

  return (
    <div
      className={[
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

      {/* 面グロー（右奥の広いにじみ）— 主役テキスト側ではなく右奥に集約 */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80">
        <div className="-inset-10 absolute blur-[90px] bg-[radial-gradient(260px_240px_at_65%_45%,rgba(109,242,197,0.42),rgba(109,242,197,0.18)_40%,transparent_70%)]" />
      </div>

      {/* 小粒の“点光” — コア（6–8px）＋ハロー（90–110px、外周10–20%） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen">
        {sparks.map((p, i) => (
          <React.Fragment key={i}>
            {/* コア：明るい中心（視認性はあるが小さく） */}
            <span
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: "8px",
                height: "8px",
                transform: "translate(-50%,-50%)",
                background:
                  "radial-gradient(circle, #E9FFF6 0%, #2ECC71 60%, rgba(46,204,113,0.0) 100%)",
                boxShadow: "0 0 10px 3px rgba(233,255,246,0.95)",
                opacity: p.opacity,
              }}
            />
            {/* ハロー：やわらかい外周（わずかに楕円） */}
            <span
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: `${p.halo}px`,
                height: `${Math.round(p.halo * 0.92)}px`, // ほんの少し楕円
                transform: "translate(-50%,-50%)",
                background:
                  "radial-gradient(circle, rgba(233,255,246,0.85) 0%, rgba(124,245,200,0.35) 35%, rgba(124,245,200,0.15) 65%, rgba(124,245,200,0.10) 85%, rgba(124,245,200,0.00) 100%)",
                filter: `blur(${p.blur}px)`,
                opacity: p.opacity,
              }}
            />
          </React.Fragment>
        ))}
      </div>

      {/* 実内容（常に最前面） */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
