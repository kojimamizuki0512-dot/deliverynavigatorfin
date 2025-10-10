// frontend/src/components/ui/ProgressBar.jsx
import React from "react";

export default function ProgressBar({ percent = 0, showPercent = true }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="flex items-center gap-3">
      <div className="progress-rail flex-1 overflow-hidden">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      {showPercent && (
        <div className="text-sm" style={{ color: "var(--txt-dim)" }}>
          {pct}%
        </div>
      )}
    </div>
  );
}
