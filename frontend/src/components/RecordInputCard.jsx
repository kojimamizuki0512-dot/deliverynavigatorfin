// frontend/src/components/RecordInputCard.jsx
// シンプルな保存カード。保存後は入力をクリアし、親の onSaved を呼ぶ。

import React, { useState } from "react";
import { api } from "../api";

export default function RecordInputCard({ onSaved }) {
  const [sales, setSales] = useState("");   // 売上（円）
  const [hours, setHours] = useState("");   // 稼働時間（表示だけ・保存はしない）
  const [count, setCount] = useState("");   // 件数（表示だけ・保存はしない）
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (saving) return;

    // 数字だけにして整数化（12,400 → 12400）
    const amount = Number(String(sales).replace(/[^\d]/g, "")) || 0;

    try {
      setSaving(true);
      // バックエンドは value/sales/amount/revenue のどれでも受けるが、
      // 明示的に value を送る。
      await api.createRecord({ title: "record", value: amount });

      setMsg("保存しました。ダッシュボード/履歴は自動更新されます。");

      // 入力クリア
      setSales("");
      setHours("");
      setCount("");

      // 親へ通知→ App が fetchAll() する
      onSaved && onSaved();
    } catch (e) {
      setMsg("保存に失敗しました。ネットワークやCORS設定をご確認ください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="text-sm text-neutral-300 mb-2">実績を記録</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-neutral-400 mb-1">売上（円）</div>
          <input
            inputMode="numeric"
            pattern="[0-9,]*"
            className="w-full rounded bg-black/30 border border-white/10 px-3 py-2"
            placeholder="例: 12400"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
          />
        </div>

        <div>
          <div className="text-xs text-neutral-400 mb-1">稼働時間（h）</div>
          <input
            className="w-full rounded bg-black/30 border border-white/10 px-3 py-2"
            placeholder="例: 4.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>

        <div>
          <div className="text-xs text-neutral-400 mb-1">件数</div>
          <input
            className="w-full rounded bg-black/30 border border-white/10 px-3 py-2"
            placeholder="例: 8"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
      >
        {saving ? "保存中…" : "保存"}
      </button>

      {msg && (
        <div className="text-xs text-neutral-400 mt-2">
          {msg}
        </div>
      )}
    </form>
  );
}
