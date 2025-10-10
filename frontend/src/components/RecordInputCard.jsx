import React, { useState } from "react";
import { api } from "../api";

/**
 * 入力欄がスワイプデッキにタッチを奪われないよう
 * onPointerDown/onTouchStart でイベント伝播を止める。
 * 保存中以外は disabled にしない。
 */
export default function RecordInputCard({ onSaved }) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const stopSwipe = (e) => {
    e.stopPropagation();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setMsg("");
    try {
      const payload = {
        title: title.trim() || "record",
        // 数値っぽい文字だけ拾う
        value: Number(String(value).replace(/[^\d\-.]/g, "")) || 0,
      };
      await api.createRecord(payload);

      // 入力欄クリア
      setTitle("");
      setValue("");

      // 画面側の集計更新（両方を即時反映）
      try {
        // App 側の再取得（存在すれば）
        if (typeof onSaved === "function") onSaved();
      } catch {}

      // 保険: カスタムイベントで他コンポーネントへ通知
      try {
        window.dispatchEvent(new CustomEvent("dnf:record-saved"));
      } catch {}

      setMsg("保存しました。ダッシュボードは自動更新されます。");
    } catch (err) {
      setMsg("保存に失敗しました。ネットワークやCORS設定をご確認ください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="glass-card p-4"
      onPointerDown={stopSwipe}
      onTouchStart={stopSwipe}
    >
      <h3 className="text-xl font-semibold mb-3">実績を記録</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-neutral-300 mb-1">タイトル</label>
          <input
            type="text"
            placeholder="例）昼ピーク"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-1">金額（円）</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="例）12400"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
            className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 outline-none focus:ring focus:ring-emerald-500/30"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg py-3 font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存する"}
        </button>

        {msg && <p className="text-xs text-neutral-300">{msg}</p>}
      </form>
    </div>
  );
}
