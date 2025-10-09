import React from "react";

export default function ProgressBar({ value = 0, className = "" }) {
  const v = Math.max(0, Math.min(100, Math.floor(value)));
  return (
    <div className={`h-2 w-full rounded bg-white/10 overflow-hidden ${className}`}>
      <div
        className="h-2 bg-emerald-500"
        style={{ width: `${v}%`, transition: "width 300ms ease" }}
      />
    </div>
  );
}
