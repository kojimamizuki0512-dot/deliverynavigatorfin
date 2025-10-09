import React, { useState } from "react";
import { api } from "../api";

/**
 * 実績入力カード
 * - タイトルと金額を入力 → 保存
 * - 保存成功時:
 *   1) window に "dnf:record-saved" を発火（HistoryList が受けて即リロード）
 *   2) 親から渡された onSaved() があれば呼び出し（Cockpit 合計の即更新）
 *   3) 入力欄クリア
 */
export default function RecordInputCard({ onSaved }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // 文字列で保持（入力しやすさ優先）
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // "12,345円" みたいな文字列から数値へ安全に変換
  function toIntSafe(v) {
    if (v == null) return 0;
    const n = Number(String(v).replace(/[^\d\-+.]/g, ""));
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      const payload = {
        title: title || "record",
        // バックエンドは value/sales/amount/revenue のいずれでも受けるが、基本は value を送る
        value: toIntSafe(amount),
      };
      const created = await api.createRecord(payload); // POST /api/records/

      // ---- 履歴へ即時反映：保存イベントを通知（HistoryList がリロード）----
      window.dispatchEvent(new CustomEvent("dnf:record-saved", { detail: created }));

      // ---- Cockpit 合計を即時反映：親ハンドラを呼ぶ（App.jsx で月間合計を再取得）----
      if (typeof onSaved === "function") {
        try {
          await onSaved(created);
        } catch {
          // 親での再取得失敗はここでは握りつぶす（UIに影響させない）
        }
      }

      // 入力欄クリア
      setTitle("");
      setAmount("");

      setMsg("保存しました。");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg(err?.data?.detail || "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm">
        <div className="mb-1 text-neutral-300">タイトル</div>
        <input
          className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 outline-none focus:ring-1 focus:ring-emerald-500/60"
          placeholder="例）昼ピーク"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <label className="block text-sm">
        <div className="mb-1 text-neutral-300">金額（円）</div>
        <input
          className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 outline-none focus:ring-1 focus:ring-emerald-500/60"
          placeholder="例）12400"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <button
        disabled={saving}
        className="w-full py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 transition disabled:opacity-60"
        type="submit"
      >
        {saving ? "保存中…" : "保存する"}
      </button>

      {msg && <p className="text-sm text-emerald-300">{msg}</p>}
    </form>
  );
}
