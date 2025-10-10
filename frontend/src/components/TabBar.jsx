import React from "react";

/**
 * Bottom Tab Bar
 * @param {Object} props
 * @param {"cockpit"|"record"|"history"} props.current - 現在のタブ
 * @param {(key: "cockpit"|"record"|"history") => void} props.onChange - タブ変更コールバック
 */
export default function TabBar({ current = "cockpit", onChange }) {
  const items = [
    { key: "cockpit", label: "Cockpit", icon: "🏠" },
    { key: "record", label: "記録", icon: "✍️" },
    { key: "history", label: "履歴", icon: "🗂️" },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        pointer-events-auto
        backdrop-blur-md
        bg-black/40 border-t border-white/10
      "
      style={{
        paddingBottom:
          "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      }}
      aria-label="Bottom navigation"
    >
      <ul className="mx-auto max-w-xl grid grid-cols-3 gap-2 px-3 pt-2">
        {items.map((it) => {
          const active = current === it.key;
          return (
            <li key={it.key}>
              <button
                type="button"
                onClick={() => onChange?.(it.key)}
                className={[
                  "w-full rounded-xl px-3 py-2",
                  "flex flex-col items-center justify-center",
                  "text-xs transition-colors",
                  active
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                    : "bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10",
                ].join(" ")}
              >
                <span className="text-base leading-none mb-0.5" aria-hidden>
                  {it.icon}
                </span>
                <span className="leading-none">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
