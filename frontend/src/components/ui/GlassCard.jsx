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

      {/* 大きめの面的ボケ光（既存：残す） */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen">
        <span className="absolute left-[72%] top-[52%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-emerald-400/55 blur-[110px]" />
        <span className="absolute left-[86%] top-[68%] -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full bg-emerald-400/50 blur-[90px]" />
        <span className="absolute left-[62%] top-[78%] -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full bg-emerald-300/55 blur-[80px]" />
        <span className="absolute left-[82%] top-[36%] -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full bg-emerald-300/45 blur-[70px]" />
      </div>

      {/* ===== 追加：小さくて明るい“点光” 3〜4個（芯 + ハロー） ===== */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen">
        {[
          { x: "86%", y: "48%" },
          { x: "88%", y: "63%" },
          { x: "80%", y: "72%" },
          { x: "74%", y: "58%" },
        ].map((p, i) => (
          <React.Fragment key={i}>
            {/* 明るい芯（小さくキラッと） */}
            <span
              className="absolute w-[8px] h-[8px] rounded-full bg-emerald-100/95 shadow-[0_0_10px_3px_rgba(125,255,220,0.95)]"
              style={{
                left: p.x,
                top: p.y,
                transform: "translate(-50%,-50%)",
              }}
            />
            {/* 外側のハロー（ふわっと） */}
            <span
              className="absolute w-[110px] h-[110px] rounded-full bg-emerald-400/45 blur-[60px]"
              style={{
                left: p.x,
                top: p.y,
                transform: "translate(-50%,-50%)",
              }}
            />
          </React.Fragment>
        ))}
      </div>
      {/* ========================================================== */}

      {/* 実内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
