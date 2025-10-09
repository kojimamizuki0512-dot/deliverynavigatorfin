import React, { useState } from "react";
import { api } from "../api";

/**
 * 実績入力カード
 * - 保存成功時:
 *   1) 入力欄クリア
 *   2) window に CustomEvent("records:created", {detail: 保存されたレコード}) を dispatch
 *   3) 親から渡された onSaved(record) を呼ぶ（Cockpitの月次合計を即時反映）
 */
export default function RecordInputCard({ onSaved }) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function parseYenLike(v) {
    if (!v) return 0;
    const n = Number(String(v).replace(/[^\d\-+.]/g, ""));
    return Number.isFinite(n) ? Math.trunc(n) : 0;
    }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    const payload = {
      title: title || "record",
      value: parseYenLike(value),
    };
    if (!payload.value) {
      setErr("金額を入力してください。");
      return;
    }
    setSaving(true);
    try {
      const rec = await api.createRecord(payload);
      // 1) 入力クリア
      setTitle("");
      setValue("");
      // 2) 履歴カード向けイベント通知（リストが即座に更新される）
      const ev = new CustomEvent("records:created", { detail: rec });
      window.dispatchEvent(ev);
      // 3) 親（App）に通知 → Cockpit合計の即時更新
      onSaved && onSaved(rec);
    } catch (e2) {
      setErr(e2?.data?.detail || "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <div className="mb-1 text-sm text-neutral-400">タイトル</div>
        <input
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="例）Uber 本日分"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block">
        <div className="mb-1 text-sm text-neutral-400">金額（円）</div>
        <input
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="12,400"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>

      {err && (
        <div className="rounded-md border border-amber-800 bg-amber-900/40 p-2 text-amber-100 text-sm">
          {err}
        </div>
      )}

      <button
        disabled={saving}
        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 font-medium disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
