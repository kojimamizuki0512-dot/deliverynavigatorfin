// frontend/src/components/RouteTimelineCard.jsx
import React, { useMemo, useState } from "react";

/**
 * ルートの各ステップを縦タイムラインで表示するカード。
 *
 * props:
 * - route: Array<{ lat:number, lng:number, step?:number, label?:string }>
 * - title?: string
 * - onSelectStep?: (index:number, point:object) => void
 */
export default function RouteTimelineCard({
  route = [],
  title = "AIおすすめルート",
  onSelectStep,
}) {
  const [active, setActive] = useState(-1);

  const steps = useMemo(() => {
    // 入力のゆらぎに耐える: null/undefined/NaN を除外して整形
    const arr = Array.isArray(route) ? route : [];
    return arr
      .map((p, i) => ({
        lat: toNum(p?.lat),
        lng: toNum(p?.lng),
        step: Number.isFinite(p?.step) ? Number(p.step) : i,
        label: typeof p?.label === "string" ? p.label : undefined,
      }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  }, [route]);

  const totalDistKm = useMemo(() => {
    let sum = 0;
    for (let i = 1; i < steps.length; i++) {
      sum += haversine(steps[i - 1], steps[i]);
    }
    return sum;
  }, [steps]);

  function handleClick(i) {
    setActive(i);
    onSelectStep && onSelectStep(i, steps[i]);
  }

  if (!steps.length) {
    return (
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="mb-1 text-lg font-semibold">{title}</div>
        <div className="text-sm text-neutral-400">
          ルート情報がありません。右上の「データを再取得」をお試しください。
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="flex items-end justify-between mb-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-xs text-neutral-400">
          全{steps.length}ステップ / 推定距離{" "}
          <span className="font-mono">{totalDistKm.toFixed(2)}</span> km
        </div>
      </div>

      <ol className="relative border-s border-neutral-700 ml-3">
        {steps.map((p, i) => {
          const selected = i === active;
          return (
            <li key={`${p.step}-${i}`} className="mb-4 ms-6">
              <span
                className={[
                  "absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border",
                  selected
                    ? "bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20"
                    : "bg-neutral-600 border-neutral-400",
                ].join(" ")}
              />
              <button
                type="button"
                onClick={() => handleClick(i)}
                className={[
                  "w-full text-left p-3 rounded-xl transition-colors",
                  selected
                    ? "bg-neutral-800 border border-neutral-700"
                    : "hover:bg-neutral-800/60",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-neutral-300">
                    <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 font-medium">
                      {p.step}
                    </span>
                    <span className="font-mono">
                      {fmt(p.lat)}, {fmt(p.lng)}
                    </span>
                  </div>
                  {p.label ? (
                    <div className="text-xs text-neutral-400">{p.label}</div>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ===== 小物ユーティリティ（外部依存なし） ===== */
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(4) : "--";
}

// ハバサインで２点間距離（km）
function haversine(a, b) {
  if (!Number.isFinite(a?.lat) || !Number.isFinite(a?.lng)) return 0;
  if (!Number.isFinite(b?.lat) || !Number.isFinite(b?.lng)) return 0;
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function toRad(deg) {
  return (deg * Math.PI) / 180;
}
