import { useState } from "react";
import { api } from "../api";

export default function RecordInputCard({ onSaved }) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setErr("");
    setSaving(true);
    try {
      const res = await api.records.create({
        amount: Number(amount) || 0,
        duration_min: Number(duration) || 0,
        memo,
      });
      setAmount("");
      setDuration("");
      setMemo("");
      onSaved?.(res);
    } catch (e) {
      setErr("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-neutral-900 rounded-2xl p-4 space-y-3">
      <div className="text-white/80">記録を追加</div>
      <div className="grid grid-cols-3 gap-2">
        <input className="col-span-1 bg-black/40 rounded px-3 py-2 text-white"
               placeholder="収益(¥)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <input className="col-span-1 bg-black/40 rounded px-3 py-2 text-white"
               placeholder="時間(分)" value={duration} onChange={e=>setDuration(e.target.value)} />
        <input className="col-span-1 bg-black/40 rounded px-3 py-2 text-white"
               placeholder="メモ" value={memo} onChange={e=>setMemo(e.target.value)} />
      </div>
      <button onClick={save} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2">
        {saving ? "保存中..." : "保存"}
      </button>
      {err && <div className="text-red-400 text-sm">{err}</div>}
    </div>
  );
}
