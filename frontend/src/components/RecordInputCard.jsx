// frontend/src/components/RecordInputCard.jsx
import React, { useState } from "react";
import { api } from "../api";

export default function RecordInputCard({ onSaved }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`; // 例: 2025-10-09
  });
  const [amount, setAmount] = useState("");
  const [hours, setHours] = useState("");
  const [count, setCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function toInt(v) {
    const n = Number(String(v).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
    // ※ hours は小数OKなので後で parse
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    setMsg("");
    setSaving(true);
    try {
      // バックエンドの期待キーで送る
      const payload = {
        date,                                   // YYYY-MM-DD
        amount_yen: toInt(amount),              // Int
        hours: Number(hours || 0),              // Float/Decimal OK
        count: toInt(count),                    // Int
      };

      const created = await api.createRecord(payload); // 201想定

      // 入力欄クリア
      setAmount("");
      setHours("");
      setCount("");

      setMsg("保存しました。ダッシュボード/グラフは自動更新されます。");

      // ← これが重要：Appに通知して月次合計＆グラフを更新
      onSaved?.(created);
    } catch (e) {
      setMsg("保存に失敗しました。ネットワークやCORS設定をご確認ください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div className="text-lg font-semibold mb-2">実績を記録</div>

      <label className="block text-sm text-neutral-400">日付</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />

      <label className="block text-sm text-neutral-400 mt-2">売上（円）</label>
      <input
        inputMode="numeric"
        placeholder="例: 12400"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />

      <label className="block text-sm text-neutral-400 mt-2">稼働時間（h）</label>
      <input
        inputMode="decimal"
        placeholder="例: 4.5"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />

      <label className="block text-sm text-neutral-400 mt-2">件数</label>
      <input
        inputMode="numeric"
        placeholder="例: 8"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
      />

      <button
        type="submit"
        disabled={saving}
        className="mt-3 px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60">
        {saving ? "保存中…" : "保存"}
      </button>

      {msg && (
        <div className="text-sm text-neutral-300 mt-2">{msg}</div>
      )}
    </form>
  );
}
