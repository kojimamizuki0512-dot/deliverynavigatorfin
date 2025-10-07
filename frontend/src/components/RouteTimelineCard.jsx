import React from 'react'
import { Bag, Pin, Flash } from '../assets/icons.jsx'

const iconMap = { bag: Bag, pin: Pin, flash: Flash }

export default function RouteTimelineCard({ route }) {
  if (!route) return <div className="glass p-4">AIルート提案を読み込み中...</div>

  return (
    <div className="glass plasma p-0 shadow-card">
      <div className="p-4">
        <div className="text-[15px] font-semibold opacity-90 mb-2">AIルート提案</div>
        <div className="relative">
          <div className="timeline-line" />
          <ul className="space-y-4">
            {route.timeline.map((t, i) => {
              const Icon = iconMap[t.icon] || Bag
              return (
                <li key={i} className="pl-10 relative">
                  <div className="absolute left-[24px] top-[2px] -translate-x-1/2 timeline-dot"></div>
                  <div className="text-[12px] text-gray-300/85 w-[52px] absolute left-0 top-0">{t.start}</div>
                  <div className="flex items-center gap-2">
                    <Icon className="text-white/90"/>
                    <span className="text-[14px]">{t.action}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-line px-4 py-3 flex items-center justify-between">
        <div className="text-[12px] text-gray-300/80">予測日給</div>
        <div className="text-[24px] font-semibold neon-green">¥{route.predicted_daily_earnings.toLocaleString()}</div>
      </div>
    </div>
  )
}
