// frontend/src/components/RouteCard.jsx
import React from "react";
import GlassCard from "./ui/GlassCard";

// タイムラインの1行
function ItemRow({ time, icon, title }) {
  return (
    <div className="rounded-2xl ring-1 ring-white/10 bg-black/30 px-4 py-4 flex items-center gap-4">
      <div className="w-[54px] shrink-0 text-sm tabular-nums text-white/70">{time}</div>
      <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <span className="text-xl leading-none text-emerald-300">{icon}</span>
      </div>
      <div className="text-[17px] leading-tight tracking-wide text-white/90">{title}</div>
    </div>
  );
}

export default function RouteCard() {
  return (
    <GlassCard className="mt-6 p-5">
      <h3 className="text-[22px] font-semibold tracking-wide text-white/90 mb-4">
        AI Route Suggestion
      </h3>

      <div className="space-y-3">
        <ItemRow time="11:00" icon="🔒" title="渋谷 道玄坂クラスターに滞在" />
        <ItemRow time="11:30" icon="🧭" title="恵比寿へリポジション" />
        <ItemRow time="12:00" icon="⚡" title="駅周辺でピーク狙い" />
      </div>

      <div className="mt-5 rounded-2xl ring-1 ring-white/10 bg-black/30 px-4 py-4">
        <div className="text-white/60">予測収益</div>
        <div className="mt-1 text-5xl font-extrabold text-emerald-300 tracking-wide tabular-nums">
          ¥12,400
        </div>
      </div>
    </GlassCard>
  );
}
