// frontend/src/components/ui/Icon.jsx
/**
 * シンプルな SVG アイコン集（Heroicons 風の線画）
 * - 仕様: ストローク 1.75px / 端点ラウンド / currentColor
 * - サイズ: 既定 20px（タブ24px、リスト20pxを想定）
 * - name: "lock" | "compass" | "bolt" | "list" | "map"
 *
 * 使い方:
 *   <Icon name="compass" size={20} className="text-emerald-300" />
 */
import React from "react";

const strokeProps = (sw = 1.75) => ({
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

function Lock({ strokeWidth }) {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps(strokeWidth)}>
      <rect x="4.5" y="10.5" width="15" height="9" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
    </svg>
  );
}

function Compass({ strokeWidth }) {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps(strokeWidth)}>
      <circle cx="12" cy="12" r="9.25" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6 15.5 8.5z" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Bolt({ strokeWidth }) {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps(strokeWidth)}>
      <path d="M13 2.5 5.5 13h5l-1.5 8.5L18.5 11h-5l-0.5-8.5z" />
    </svg>
  );
}

function List({ strokeWidth }) {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps(strokeWidth)}>
      <path d="M4.5 6h15" />
      <path d="M4.5 12h15" />
      <path d="M4.5 18h15" />
    </svg>
  );
}

function Map({ strokeWidth }) {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps(strokeWidth)}>
      <path d="M9 4.5 3.5 7v12l5.5-2.5 6 2.5 5.5-2.5v-12L15 7 9 4.5z" />
      <path d="M9 4.5v12.5" />
      <path d="M15 7v12.5" />
    </svg>
  );
}

const registry = {
  lock: Lock,
  compass: Compass,
  bolt: Bolt,
  list: List,
  map: Map,
};

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  className = "",
  style,
  title,
  ...rest
}) {
  const Comp = registry[name] || registry["list"];
  return (
    <span
      className={["inline-block align-middle", className].join(" ")}
      style={{ width: size, height: size, lineHeight: 0, ...style }}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...rest}
    >
      {title ? <span className="sr-only">{title}</span> : null}
      <Comp strokeWidth={strokeWidth} />
    </span>
  );
}
