// frontend/src/components/ui/GlassCard.jsx
import React from "react";

/**
 * Frosted glass card that matches the reference:
 * - R=28, blur≈24, thin ring, inner highlight
 * - Right-back emerald area glow + three dot glows
 * - Very soft vignette + ultra-fine noise to avoid banding
 */
export default function GlassCard({ className = "", children }) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px]",
        // frosted base
        "backdrop-blur-2xl bg-white/5",
        // thin outline + deep elevation
        "ring-1 ring-white/10 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)]",
        // comfortable paddings
        "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      {/* --- Emerald area glow (right-back face light) --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 opacity-80 mix-blend-screen"
        style={{
          background:
            "radial-gradient(260px 220px at 65% 45%, rgba(109,242,197,0.35) 0%, rgba(109,242,197,0.18) 30%, rgba(109,242,197,0) 70%)",
        }}
      />

      {/* --- Dot glows (three soft points) --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 top-20 w-[16px] h-[16px] rounded-full blur-[70px] opacity-35 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(168,255,216,0.55) 0%, rgba(168,255,216,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 w-[14px] h-[14px] rounded-full blur-[70px] opacity-30 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(168,255,216,0.5) 0%, rgba(168,255,216,0) 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-12 bottom-16 w-[14px] h-[14px] rounded-full blur-[70px] opacity-30 mix-blend-screen"
        style={{
          background:
            "radial-gradient(circle, rgba(168,255,216,0.5) 0%, rgba(168,255,216,0) 75%)",
        }}
      />

      {/* --- Inner highlight (1px) & soft vignette --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] shadow-[inset_0_0_90px_rgba(0,0,0,0.55)]"
      />

      {/* --- Ultra-fine noise to prevent banding --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' seed='2'/></filter><rect width='128' height='128' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />

      {/* content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
