// frontend/src/components/HistoryList.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

// 履歴一覧カード：バックエンド /api/records/ を読み込み、最新10件を表示
export default function HistoryList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  function formatYen(n) {
    const num = Number(n || 0);
    return "¥" + num.toLocaleString("ja-JP");
  }

  async function load() {
    setErr("");
    try {
      const data = await api.records();
      // すでに降順で返りますが念のため配列化だけ保証
      setRows(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (e) {
      setErr("取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 保存後に自動更新できるよう、カスタムイベントにフック（発火されなくても問題なし）
  useEffect(() => {
    const h = () => load();
    window.addEventListener("records:created", h);
    return () => window.removeEventListener("records:created", h);
  }, []);

  return (
    <div className="p-4">
      <div className="text-sm text-neutral-400 mb-2">
        これまでの実績（最新10件）
      </div>

      {loading ? (
        <div className="text-neutral-400">読み込み中…</div>
      ) : err ? (
        <div className="p-3 rounded bg-amber-900/40 border border-amber-800 text-amber-100">
          {err}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-neutral-400">まだ記録がありません。</div>
      ) : (
        <ul className="divide-y divide-white/5 rounded-xl overflow-hidden border border-white/10 bg-neutral-900/60">
          {rows.map((r) => {
            const d = r.created_at ? new Date(r.created_at) : null;
            const when = d
              ? d.toLocaleString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "-";
            return (
              <li key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-neutral-200 truncate">
                    {r.title || "record"}
                  </div>
                  <div className="text-xs text-neutral-500">{when}</div>
                </div>
                <div className="ml-3 font-semibold text-emerald-400">
                  {formatYen(r.value)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
