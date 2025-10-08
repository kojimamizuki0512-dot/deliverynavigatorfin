import React, { useState } from "react";
import dayjs from "dayjs";
import { api } from "../api";

export default function RecordInputCard() {
  const [form, setForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    revenue: "",
    hours: "",
    deliveries: ""
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const payload = {
      date: form.date,
      revenue: Number(form.revenue || 0),
      hours: Number(form.hours || 0),
      deliveries: Number(form.deliveries || 0)
    };

    try {
      // バックが用意済みなら API 保存
      await api.createRecord(payload);
      setMsg("保存しました。");
    } catch {
      // まだエンドポイントがない場合は localStorage に保存（ユーザー毎にキーを分けない簡易版）
      const key = "dnf_records";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push({ ...payload, _local: true, savedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(arr));
      setMsg("保存しました（ローカル保存）");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="mb-3 text-lg font-semibold">実績を記録</div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="text-sm block">
          <div className="mb-1 text-neutral-300">日付</div>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
            required
          />
        </label>

        <label className="text-sm block">
          <div className="mb-1 text-neutral-300">売上（円）</div>
          <input
            type="number"
            inputMode="numeric"
            value={form.revenue}
            onChange={(e) => set("revenue", e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
          />
        </label>

        <label className="text-sm block">
          <div className="mb-1 text-neutral-300">稼働時間（h）</div>
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={form.hours}
            onChange={(e) => set("hours", e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
          />
        </label>

        <label className="text-sm block">
          <div className="mb-1 text-neutral-300">件数</div>
          <input
            type="number"
            inputMode="numeric"
            value={form.deliveries}
            onChange={(e) => set("deliveries", e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
          />
        </label>

        <div className="md:col-span-4">
          <button
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60">
            {saving ? "保存中…" : "保存"}
          </button>
          {msg && <span className="ml-3 text-sm text-neutral-300">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
