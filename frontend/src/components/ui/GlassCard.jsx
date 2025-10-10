// frontend/src/components/ui/GlassCard.jsx
import React from "react";

/**
 * ガラス風カード（基準画像準拠）
 * - 角丸 R=28
 * - 背景: 透過白(5%) + blur + 極薄の輪郭
 * - 右奥に面光（エメラルド系）
 * - 端の余白に小さく明るい点光を 3 点（視線は本文/数値に向く配置）
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
      {/* --- 面光（大きなグリーングロー／基準画像の右側のにじみ） --- */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(120%_80%_at_70%_50%,rgba(16,185,129,0.18),rgba(16,185,129,0.08)_45%,transparent_70%)]",
          "opacity-70 blur-xl",
        ].join(" ")}
      />

      {/* --- 点光（小さく明るめ：3点）--- 
           仕様目安：
             - コア径: 6–10px（下の core）
             - ハロ:   80–120px（下の halo）
             - 色:     center #E9FFF6 → #2ECC71（白寄りのエメラルド）
             - 合成:   Screen（mix-blend-screen）
             - 不透明: 0.7–0.85
             - 位置:   コンテンツを避け、端の余白に寄せる（視線は本文へ）
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        {/* dot #1（左上） */}
        <span className="absolute top-6 left-10 mix-blend-screen">
          {/* コア */}
          <span className="block h-[9px] w-[9px] rounded-full bg-[#E9FFF6] opacity-80" />
          {/* ハロ */}
          <span
            className="block -mt-[9px] -ml-[45px] h-[110px] w-[110px] rounded-full opacity-80"
            style={{
              background:
                "radial-gradient(closest-side, rgba(233,255,246,0.85) 0%, rgba(46,204,113,0.55) 12%, rgba(46,204,113,0.0) 70%)",
              filter: "blur(28px)",
            }}
          />
        </span>

        {/* dot #2（右下） */}
        <span className="absolute bottom-8 right-12 mix-blend-screen">
          <span className="block h-[8px] w-[8px] rounded-full bg-[#E9FFF6] opacity-80" />
          <span
            className="block -mt-[8px] -ml-[40px] h-[100px] w-[100px] rounded-full opacity-75"
            style={{
              background:
                "radial-gradient(closest-side, rgba(233,255,246,0.85) 0%, rgba(46,204,113,0.5) 12%, rgba(46,204,113,0.0) 68%)",
              filter: "blur(26px)",
            }}
          />
        </span>

        {/* dot #3（中段やや右：本文ラインを避け、右寄せ） */}
        <span className="absolute top-[46%] right-16 mix-blend-screen">
          <span className="block h-[7px] w-[7px] rounded-full bg-[#E9FFF6] opacity-75" />
          <span
            className="block -mt-[7px] -ml-[38px] h-[95px] w-[95px] rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(closest-side, rgba(233,255,246,0.8) 0%, rgba(46,204,113,0.45) 12%, rgba(46,204,113,0.0) 66%)",
              filter: "blur(24px)",
            }}
          />
        </span>
      </div>

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
