// frontend/src/components/SummaryCard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api";
import dayjs from "dayjs";

// Recharts（折れ線グラフ）
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
 * - /api/records/ を取得して「日別の合計」を折れ線グラフ表示
 * - 保存成功イベント `dnf:record:saved` を受けて自動で再取得
 * - API 形式の揺れ（key名など）に強めの実装（sales_yen/amount/value のどれでもOK）
 */
export default function SummaryCard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState([]); // [{ date:'MM/DD', total: number }]

  // --- 値の抽出（APIのフィールド名揺れに対応）---
  const pickAmount = useCallback((rec) => {
    // よくある候補: sales_yen / amount / value
    const v = rec?.sales_yen ?? rec?.amount ?? rec?.value ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }, []);

  // --- 日付の抽出（created_at or date）を YYYY-MM-DD に正規化 ---
  const pickDateKey = useCallback((rec) => {
    const raw = rec?.date ?? rec?.created_at ?? rec?.createdAt ?? "";
    const d = dayjs(raw);
    if (d.isValid()) return d.format("YYYY-MM-DD");
    // 文字列でなければ “今日” として扱う（フォールバック）
    return dayjs().format("YYYY-MM-DD");
  }, []);

  // --- API取得＆集計（当月 or 直近30日を可視化）---
  const refresh = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.records();
      const list = Array.isArray(res)
        ? res
        : (res?.results ?? res?.items ?? res?.data ?? []);

      // 直近30日で日別合計を作る
      const today = dayjs().startOf("day");
      const from = today.subtract(29, "day"); // 30日分
      const byDay = new Map(); // key: YYYY-MM-DD -> sum

      // ゼロ埋め（データがない日も 0 表示にする）
      for (let i = 0; i < 30; i++) {
        const k = from.add(i, "day").format("YYYY-MM-DD");
        byDay.set(k, 0);
      }

      for (const rec of list) {
        const k = pickDateKey(rec);
        const amount = pickAmount(rec);
        if (byDay.has(k)) byDay.set(k, byDay.get(k) + amount);
      }

      const chart = Array.from(byDay.entries()).map(([k, total]) => ({
        date: dayjs(k).format("MM/DD"),
        total,
      }));

      setData(chart);
    } catch (e) {
      setErr("データ取得に失敗しました。");
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [pickAmount, pickDateKey]);

  // 初回取得
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 保存成功イベントで再取得（App に依存せず単体で更新できる）
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("dnf:record:saved", handler);
    return () => window.removeEventListener("dnf:record:saved", handler);
  }, [refresh]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-neutral-400 text-sm">読み込み中…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4">
        <div className="text-amber-300 text-sm">{err}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-neutral-400">これまでの実績（直近30日・日次合計）</div>
        <div className="text-xs text-neutral-500">
          保存すると自動で更新されます
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis width={64} />
            <Tooltip />
            <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
