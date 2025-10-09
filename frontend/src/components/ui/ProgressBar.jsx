import React from "react";

/** シンプルな進捗バー（0-100%）。高さは h-2 などで指定可能 */
export default function ProgressBar({ value = 0, className = "", height = "h-2" }) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(+value) ? +value : 0));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/10 ${height} ${className}`}>
      <div
        className="h-full bg-emerald-500 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
