import React from 'react'

export default function SummaryCard({ data }) {
  if (!data) return <div className="glass p-4">サマリーを読み込み中...</div>
  return (
    <div className="glass p-4">
      <div className="text-[15px] font-semibold opacity-90 mb-3">本日の実績サマリー</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="売上" value={`¥${data.revenue.toLocaleString()}`} accent />
        <Stat label="件数" value={`${data.jobs} 件`} />
        <Stat label="平均時給" value={`¥${data.avg_hourly.toLocaleString()}`} />
        <Stat label="稼働時間" value={`${data.hours} h`} />
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="text-[11px] text-gray-300/85 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${accent ? 'neon-green' : ''}`}>{value}</div>
    </div>
  )
}
