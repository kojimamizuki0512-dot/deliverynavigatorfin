// frontend/src/components/SummaryCard.jsx
// 折れ線グラフの代わりに、最新の記録を一覧で見せるカード。
// 親(App.jsx)から props.records を受け取り、追加のAPI呼び出しはしません。

import React, { useMemo } from "react";

// 金額表示を "¥12,345" 形式に
function yen(n) {
  const v = Number(n) || 0;
  return `¥${v.toLocaleString("ja-JP")}`;
}

// 日付表示をローカルタイムで
function fmtDateTime(s) {
  // APIはISO文字列を返す想定。Dateにしてからローカルで整形
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s || "");
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SummaryCard({ records = [] }) {
  // 表示用に新しい順へ（DB側も新しい順だが念のため）
  const sorted = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [records]);

  // 合計と件数
  const total = useMemo(
    () => sorted.reduce((acc, r) => acc + (Number(r.value) || 0), 0),
    [sorted]
  );
  const count = sorted.length;

  // 最新15件だけ出す（多すぎると縦に伸びるため）
  const latest = sorted.slice(0, 15);

  return (
    <div className="p-4">
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-neutral-400">これまでの実績（最新15件）</div>
          <div className="text-xs text-neutral-400">
            合計 {yen(total)} / {count} 件
          </div>
        </div>

        {/* 記録が無いときの案内 */}
        {latest.length === 0 ? (
          <div className="text-neutral-400 text-sm py-10 text-center">
            記録がありません。カード「実績を記録」で保存してください。
          </div>
        ) : (
          <div className="divide-y divide-white/10 rounded-lg overflow-hidden border border-white/10">
            {latest.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 gap-3 items-center px-3 py-2 bg-black/20 hover:bg-black/30"
              >
                {/* 日時 */}
                <div className="col-span-5 text-sm text-neutral-300">
                  {fmtDateTime(r.created_at)}
                </div>
                {/* タイトル */}
                <div className="col-span-4 text-sm text-neutral-400 truncate">
                  {r.title || "record"}
                </div>
                {/* 金額 */}
                <div className="col-span-3 text-right font-medium">
                  {yen(r.value)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-[11px] text-neutral-500 mt-2">
          ※ 自動更新：新しく保存すると、この一覧も更新されます。
        </div>
      </div>
    </div>
  );
}
