import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// 軽いフォーマッタ
const yen = (n) =>
  typeof n === "number"
    ? `¥${n.toLocaleString()}`
    : n == null
    ? "-"
    : String(n);

function normalizeWeekly(raw) {
  // 受け取りうる形をざっくり吸収して {date, earnings, orders}[]
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.days)) return raw.days;
  if (Array.isArray(raw?.week)) return raw.week;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
}

function toChartRows(items) {
  return items.map((it, idx) => {
    const date =
      it.date || it.day || it.label || dayjs().add(idx, "day").format("YYYY-MM-DD");
    const earnings =
      it.earnings ??
      it.amount ??
      it.revenue ??
      it.y ??
      0;
    const orders = it.orders ?? it.count ?? it.n ?? 0;
    return {
      date,
      label: dayjs(date).isValid() ? dayjs(date).format("MM/DD") : String(date),
      earnings: Number(earnings) || 0,
      orders: Number(orders) || 0,
    };
  });
}

export default function SummaryCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const r = await api.weeklyForecast();
        const items = normalizeWeekly(r);
        const chart = toChartRows(items);
        setRows(chart);
      } catch (e) {
        setErr(e?.data?.detail || "データ取得に失敗しました");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, x) => {
        acc.earnings += x.earnings;
        acc.orders += x.orders;
        return acc;
      },
      { earnings: 0, orders: 0 }
    );
  }, [rows]);

  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-neutral-400">Summary（今週の予測・実績）</div>
        <div className="text-xs text-neutral-400">
          合計：{yen(totals.earnings)} / 注文 {totals.orders}件
        </div>
      </div>

      {loading ? (
        <div className="h-48 grid place-items-center text-neutral-400">
          読み込み中…
        </div>
      ) : err ? (
        <div className="h-48 grid place-items-center text-rose-300">
          {err}
        </div>
      ) : rows.length === 0 ? (
        <div className="h-48 grid place-items-center text-neutral-400">
          データがありません
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,.2)" }}
                tickLine={{ stroke: "rgba(255,255,255,.2)" }}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `¥${v / 1000}k`}
                tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,.2)" }}
                tickLine={{ stroke: "rgba(255,255,255,.2)" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "rgba(255,255,255,.6)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,.2)" }}
                tickLine={{ stroke: "rgba(255,255,255,.2)" }}
              />
              <Tooltip
                formatter={(v, n) =>
                  n === "earnings" ? [yen(v), "売上"] : [v, "件数"]
                }
                labelFormatter={(l) => `${l}`}
                contentStyle={{ background: "rgba(0,0,0,.85)", border: "1px solid rgba(255,255,255,.1)" }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="earnings"
                name="売上"
                fill="rgba(16,185,129,.35)"
                stroke="rgba(16,185,129,1)"
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                name="件数"
                fill="rgba(59,130,246,.25)"
                stroke="rgba(59,130,246,1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
