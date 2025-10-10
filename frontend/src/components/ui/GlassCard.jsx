// frontend/src/components/ui/GlassCard.jsx
import React from "react";

/**
 * 目的：
 * - 大きい面グローは維持
 * - 小粒の点光（3～4個）は KPI テキストに被らない右側/右下へ寄せる
 * - 仕様（目安）
 *   色: 中心 #E9FFF6 → #2ECC71（白寄りエメラルド）
 *   形: 円（わずかに楕円っぽくぼかし）
 *   コア径: 6–10px
 *   ハロ半径: 80–120px（外周不透明度 10–20%）
 *   ぼかし: 20–40px
 *   合成: screen（加算系）、不透明度 70–85%
 *   配置: 3–4点（大中小）
 */
export default function GlassCard({ className = "", children }) {
  // 視線誘導のための配置（右〜右下へ寄せる）
  const sparks = [
    // 大（右中段）— もっとも遠く、目立ち度は中
    { x: "86%", y: "48%", halo: 120, blur: 36, opacity: 0.78 },
    // 中（右下寄り）— 予測収益の外縁に“寄せるだけ”で数字は覆わない
    { x: "82%", y: "70%", halo: 100, blur: 32, opacity: 0.75 },
    // 小（やや左寄りの下部）— デッキの層感を補助
    { x: "72%", y: "78%", halo: 85, blur: 28, opacity: 0.72 },
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

      {/* 面グロー（右奥の広いにじみ）— 主役はテキスト側ではなく右奥 */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-80">
        <div className="-inset-10 absolute blur-[90px] bg-[radial-gradient(260px_240px_at_65%_45%,rgba(109,242,197,0.42),rgba(109,242,197,0.18)_40%,transparent_70%)]" />
      </div>

      {/* 既存のボケた面光（層の奥行き） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen">
        <span className="absolute left-[72%] top-[52%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-emerald-400/45 blur-[110px]" />
        <span className="absolute left-[86%] top-[68%] -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full bg-emerald-400/40 blur-[90px]" />
      </div>

      {/* 小粒の“点光”— コア + ハロー（指定値に合わせて調整） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen">
        {sparks.map((p, i) => (
          <React.Fragment key={i}>
            {/* コア（6–10px、明るい中心） */}
            <span
              className="absolute rounded-full shadow-[0_0_10px_3px_rgba(233,255,246,0.95)]"
              style={{
                left: p.x,
                top: p.y,
                width: "8px",
                height: "8px",
                transform: "translate(-50%,-50%)",
                background:
                  "radial-gradient(circle, #E9FFF6 0%, #2ECC71 60%, rgba(46,204,113,0.0) 100%)",
                opacity: p.opacity,
              }}
            />
            {/* ハロー（80–120px、外周10–20%） */}
            <span
              className="absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: `${p.halo}px`,
                height: `${p.halo * 0.92}px`, // わずかに楕円で有機感
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

      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
