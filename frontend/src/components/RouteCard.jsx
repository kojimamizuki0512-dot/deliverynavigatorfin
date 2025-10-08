import React from "react";

export default function RouteCard({ route = [] }) {
  if (!route?.length) {
    return (
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="text-sm text-neutral-400">AIおすすめルートは未取得です。</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="mb-3 text-lg font-semibold">AIおすすめルート</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {route.map((p, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800">
            <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-300 grid place-items-center">
              {p.step ?? i}
            </div>
            <div className="text-sm">
              <div>緯度: <span className="font-mono">{Number(p.lat).toFixed(4)}</span></div>
              <div>経度: <span className="font-mono">{Number(p.lng).toFixed(4)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
