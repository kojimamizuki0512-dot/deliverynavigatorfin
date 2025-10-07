import { useEffect, useState } from "react";
import "./index.css";
import { api } from "./api";
import AuthGate from "./components/AuthGate";

// 既存のUIパーツをそのまま import（あなたの構成に合わせて）
import CockpitBar from "./components/CockpitBar.jsx";
import CardDeck from "./components/CardDeck.jsx";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [heat, setHeat] = useState(null);
  const goal = 12000;

  const [route, setRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const [r, s, h] = await Promise.all([
        api.dailyRoute(),
        api.dailySummary(goal),
        api.heatmapData(),
      ]);
      setRoute(r); setSummary(s); setHeat(h);
    })();
  }, []);

  return (
    <AuthGate>
      <div className="min-h-screen bg-[#1A1A1A] text-zinc-200">
        <div className="max-w-[430px] mx-auto px-4 py-6">
          <h1 className="text-lg mb-2 font-semibold">Delivery Navigator</h1>
          <CockpitBar summary={summary} goal={goal}/>
          <div className="mt-3">
            <CardDeck route={route} heat={heat}/>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
