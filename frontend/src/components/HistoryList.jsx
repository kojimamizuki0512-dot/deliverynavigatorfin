import React, { useEffect, useState } from "react";
import { api } from "../api";
import GlassCard from "./ui/GlassCard.jsx";

function formatJPY(n) {
  try {
    return Number(n).toLocaleString("ja-JP");
  } catch {
    return String(n ?? 0);
  }
}

function formatDate(iso) {
  // ISO or datetime string -> YYYY/MM/DD HH:mm
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

/**
 * これまでの実績（最新10件）をカードで一覧表示
 * 折れ線グラフの代替（軽量・壊れにくい）
 */
export default function HistoryList() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.records(); // GET /api/records/
        setItems(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (e) {
        setMsg("履歴の取得に失敗しました。");
      }
    })();
  }, []);

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="text-sm text-neutral-300">これまでの実績（最新10件）</div>
      </div>

      {msg && (
        <div className="px-4 py-3 text-amber-200 bg-amber-900/30 border-b border-amber-800">
          {msg}
        </div>
      )}

      {items.length === 0 ? (
        <div className="px-4 py-10 text-neutral-400 text-sm">まだ記録がありません。</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {items.map((r) => (
            <li key={r.id} className="px-4 py-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-neutral-200 text-sm truncate">{r.title || "record"}</div>
                <div className="text-xs text-neutral-500">{formatDate(r.created_at)}</div>
              </div>
              <div className="text-emerald-400 font-medium shrink-0">¥{formatJPY(r.value)}</div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
