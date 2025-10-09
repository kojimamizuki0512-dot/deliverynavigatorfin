// frontend/src/components/RecordInputCard.jsx
import React, { useMemo, useState } from "react";
import { api } from "../api";

/**
 * RecordInputCard
 * - 実績の入力フォーム。
 * - 「保存」成功時に 'dnf:record:saved' を dispatch してダッシュボード/グラフ側を自動更新。
 * - 今回の変更点：保存成功後に入力欄（売上・時間・件数）をクリア。
 *   （日付は連続入力しやすいよう **そのまま維持** します。必要なら today に戻す実装に変更可）
 */
export default function RecordInputCard() {
  // 今日の日付を 'YYYY/MM/DD' で作る（例: 2025/10/09）
  const today = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${dd}`;
  }, []);

  // 入力値
  const [date, setDate] = useState(today);
  const [sales, setSales] = useState("");
  const [hours, setHours] = useState("");
  const [count, setCount] = useState("");

  // UI 状態
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave(e) {
    e.preventDefault();
    if (saving) return;

    setMsg("");
    setSaving(true);

    // --- バックエンドに送る形に整形 ----------------------------
    // sales（円）は数字以外を除去 -> 数字が無ければ 0
    const salesYen = Number(String(sales).replace(/[^\d]/g, "")) || 0;
    // hours は小数OK、count は整数想定
    const hoursNum = Number(hours) || 0;
    const countNum = Number(count) || 0;

    const payload = {
      date,                // '2025/10/09' など。API側で受け入れ可能な形式に合わせる
      sales_yen: salesYen, // 金額（円）
      hours: hoursNum,     // 稼働時間（h）
      count: countNum,     // 件数
    };
    // ----------------------------------------------------------

    try {
      await api.createRecord(payload);

      // 保存成功メッセージ
      setMsg("保存しました。ダッシュボードが自動更新されます。");

      // ダッシュボード側に更新イベント発火（App.jsx / SummaryCard.jsx が購読）
      window.dispatchEvent(new CustomEvent("dnf:record:saved"));

      // ★ 入力欄をクリア（date は維持。today に戻したい場合は setDate(today) に変更）
      setSales("");
      setHours("");
      setCount("");
    } catch (err) {
      const detail =
        err?.data?.detail ||
        (typeof err?.data === "string" ? err.data : "") ||
        "保存に失敗しました。ネットワークまたはCORS設定をご確認ください。";
      setMsg(detail);
    } finally {
      setSaving(false);
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

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
        title={saving ? "送信中…" : "保存"}
      >
        {saving ? "保存中…" : "保存"}
      </button>

      {msg && <div className="mt-2 text-sm text-neutral-300">{msg}</div>}
    </form>
  );
}
