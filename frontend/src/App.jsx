import React, { useEffect, useState } from 'react'
import { api } from './api/index.js'
import CockpitBar from './components/CockpitBar.jsx'
import CardDeck from './components/CardDeck.jsx'
import RouteTimelineCard from './components/RouteTimelineCard.jsx'
import HeatmapCard from './components/HeatmapCard.jsx'
import SummaryCard from './components/SummaryCard.jsx'
import TabBar from './components/TabBar.jsx'

export default function App() {
  const [route, setRoute] = useState(null)
  const [summary, setSummary] = useState(null)
  const [heat, setHeat] = useState(null)
  const goal = 12000

  useEffect(() => {
    (async () => {
      const [r, s, h] = await Promise.all([api.dailyRoute(), api.dailySummary(goal), api.heatmap()])
      setRoute(r); setSummary(s); setHeat(h)
    })()
  }, [])

  return (
    <div className="min-h-screen bg-basebg pb-[76px]">
      <div className="max-w-[420px] mx-auto px-4">
        <CockpitBar goal={goal} summary={summary} />

        <CardDeck>
          {/* 手前：AIルート提案（ガラス＋プラズマ） */}
          <RouteTimelineCard route={route} />
          {/* 奥：ヒートマップ */}
          <HeatmapCard heat={heat} />
          {/* さらに奥：サマリー */}
          <SummaryCard data={summary} />
        </CardDeck>
      </div>

      <TabBar active="home" />
    </div>
  )
}
