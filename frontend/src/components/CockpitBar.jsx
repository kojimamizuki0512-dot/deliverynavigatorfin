import React from 'react'

export default function CockpitBar({ goal=12000, summary }) {
  const progress = summary?.progress_percent ?? 68
  const hourly = summary?.avg_hourly ?? 0
  const hours = summary?.hours ?? 0

  return (
    <div className="pt-[18px] pb-2">
      <div className="text-[15px] font-semibold opacity-90">Delivery Navigator</div>
      <div className="mt-2 glass h-[56px] flex items-center px-4">
        <div className="w-full">
          <div className="flex items-center justify-between text-[11px] text-gray-300/80 mb-[6px]">
            <span>コックピット・ダッシュボード</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-[8px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{width:`${Math.min(100,progress)}%`}} />
          </div>
          <div className="mt-1 text-[11px] text-gray-300/80">¥{(summary?.revenue ?? 0).toLocaleString()} / ¥{goal.toLocaleString()}　|　時給 ¥{hourly.toLocaleString()}　|　稼働 {hours}h</div>
        </div>
      </div>
    </div>
  )
}
