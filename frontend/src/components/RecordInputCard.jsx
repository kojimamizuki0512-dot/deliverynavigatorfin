// frontend/src/components/RecordInputCard.jsx
import React, { useMemo, useState } from "react";
import { api } from "../api";

export default function RecordInputCard() {
  // 入力用のローカル state
  const today = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}/${mm}/${dd}`;
  }, []);

  const [date, setDate] = useState(today);
  const [sales, setSales] = useState("");
  const [hours, setHours] = useState("");
  const [count, setCount] = useState("");
  const [msg, setMsg] = useState("");

  async function onSave(e) {
    e.preventDefault();
    setMsg("");

    const payload = {
      // API 側の期待する形に合わせて調整してください
      date,                                       // 例: '2025/10/09'
      sales_yen: Number(String(sales).replace(/[^\d]/g, "")) || 0,
      hours: Number(hours) || 0,
      count: Number(count) || 0,
    };

    try {
      await api.createRecord(payload);
      setMsg("保存しました。ダッシュボードは自動更新されます。");

      // ← これがポイント：保存成功イベントを発火（親や他コンポーネントが拾って再集計）
      window.dispatchEvent(new CustomEvent("dnf:record:saved"));

      // 入力を軽くリセット（お好みで）
      // setSales(""); setHours(""); setCount("");
    } catch (err) {
      const detail = err?.data?.detail || "保存に失敗しました。ネットワークやCORS設定をご確認ください。";
      setMsg(detail);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-3">
      <div>
        <div className="text-sm text-neutral-400 mb-1">日付</div>
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="YYYY/MM/DD"
        />
      </div>

      <div>
        <div className="text-sm text-neutral-400 mb-1">売上（円）</div>
        <input
          value={sales}
          onChange={(e) => setSales(e.target.value)}
          className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="例: 12400"
          inputMode="numeric"
        />
      </div>

      <div>
        <div className="text-sm text-neutral-400 mb-1">稼働時間（h）</div>
        <input
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="例: 4.5"
          inputMode="decimal"
        />
      </div>

      <div>
        <div className="text-sm text-neutral-400 mb-1">件数</div>
        <input
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="w-full rounded bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="例: 8"
          inputMode="numeric"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
      >
        保存
      </button>

      {msg && (
        <div className="mt-2 text-sm text-neutral-300">{msg}</div>
      )}
    </form>
  );
}
