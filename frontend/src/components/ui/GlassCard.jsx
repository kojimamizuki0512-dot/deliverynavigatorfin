import React from "react";

export default function GlassCard({ children, className = "" }) {
  return (
    <section
      className={
        "rounded-2xl bg-neutral-900/80 border border-neutral-800 " +
        "shadow-[0_0_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur " +
        className
      }
    >
      {children}
    </section>
  );
}
