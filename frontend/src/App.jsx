import { useEffect, useState } from "react";
import * as api from "./api";
import CardDeck from "./components/CardDeck";
import CockpitBar from "./components/CockpitBar";
import TabBar from "./components/TabBar";
import RecordInputCard from "./components/RecordInputCard";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [heat, setHeat] = useState(null);
  const [route, setRoute] = useState(null);
  const goal = 12000;

  const loadAll = async () => {
    const [r, s, h] = await Promise.all([
      api.dailyRoute(),
      api.dailySummary(goal),
      api.heatmapData(),
    ]);
    setRoute(r);
    setSummary(s);
    setHeat(h);
  };

  useEffect(() => {
    (async () => {
      // ゲスト初期化（ニックネームは任意）
      try { await api.guest.init(""); } catch {}
      await loadAll();
    })();
  }, []);

  return (
    <div className="app bg-[#1A1A1A] text-white min-h-screen">
      <div className="container mx-auto py-6">
        <h1 className="text-lg font-semibold px-4">Delivery Navigator</h1>
        <CockpitBar summary={summary} goal={goal} />
        <div className="mt-2" />
        <CardDeck route={route} summary={summary} heat={heat} />
        {/* 追加: クイック記録 → 今日のサマリにも反映 */}
        <RecordInputCard onCreated={loadAll} />
      </div>
      <TabBar />
    </div>
  );
}
