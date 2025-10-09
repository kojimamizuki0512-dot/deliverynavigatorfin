import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, getToken } from "../api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * SummaryCard
 * - 今月合計（/api/monthly-total/）
 * - 週間トレンド（/api/weekly-forecast/ が失敗したらデモデータ）
 * - 取得失敗時は UI を壊さず静かなフォールバック
 */
export default function SummaryCard() {
  const [loading, setLoading] = useState(true);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [err, setErr] = useState("");

  const demoWeek = useMemo(
    () => [
      { name: "Mon", value: 8200 },
      { name: "Tue", value: 9100 },
      { name: "Wed", value: 7600 },
      { name: "Thu", value: 10400 },
      { name: "Fri", value: 9800 },
      { name: "Sat", value: 12300 },
      { name: "Sun", value: 11200 },
    ],
    []
  );

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      const token = getToken();
      const headers = {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      };

      // 1) 今月合計
      try {
        const r = await fetch(`${API_BASE}/api/monthly-total/`, { headers });
        if (r.ok) {
          const j = await r.json();
          // 期待形: { total_sum: number }
          const total =
            typeof j?.total_sum === "number"
              ? j.total_sum
              : Number(j?.total || 0);
          setMonthlyTotal(isFinite(total) ? total : 0);
        } else {
          setMonthlyTotal(0);
        }
      } catch {
        setMonthlyTotal(0);
      }

      // 2) 週間トレンド
      try {
        const r = await fetch(`${API_BASE}/api/weekly-forecast/`, { headers });
        if (r.ok) {
          const j = await r.json();
          // いくつかの可能性に耐えるパーサ
          let arr = [];
          if (Array.isArray(j)) arr = j;
          else if (Array.isArray(j?.items)) arr = j.items;
          else if (Array.isArray(j?.data)) arr = j.data;

          const mapped = arr
            .map((it) => {
              const name =
                it?.name ||
                it?.day ||
                it?.label ||
                it?.date ||
                it?.d ||
                "—";
              const v =
                it?.value ??
                it?.predicted ??
                it?.y ??
                it?.amount ??
                it?.earnings ??
                it?.v;
              const value = Number(v);
              return { name: String(name).slice(0, 6), value: isFinite(value) ? value : 0 };
            })
            .filter((x) => typeof x.value === "number");

          setWeekData(mapped.length ? mapped : demoWeek);
        } else {
          setWeekData(demoWeek);
        }
      } catch {
        setWeekData(demoWeek);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE, demoWeek]);

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-zinc-100">これまでのサマリー</h3>
        {loading ? (
          <span className="text-xs text-zinc-400">Loading…</span>
        ) : err ? (
          <span className="text-xs text-amber-400">{err}</span>
        ) : null}
      </div>

      {/* 今月の累計 */}
      <div className="mb-4">
        <div className="text-sm text-zinc-400 mb-1">今月の累計</div>
        <div className="text-2xl font-bold text-zinc-100">
          ¥{monthlyTotal.toLocaleString()}
        </div>
      </div>

      {/* 週間トレンド（デモ／APIフォールバック） */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #27272a",
                borderRadius: "0.75rem",
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        ※ グラフはデモを含みます。データ保存が実装され次第、実データに置き換わります。
      </p>
    </div>
  );
}
