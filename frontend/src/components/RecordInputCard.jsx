// frontend/src/components/RecordInputCard.jsx
import React, { useState } from "react";
import { api } from "../api";

// ユーザー入力（"12,400" や "12400"）を安全に整数へ
function toInt(x) {
  if (x == null) return 0;
  const n = Number(String(x).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

// YYYY-MM-DD をバックエンドに渡すための ISO 風に（タイムゾーンずれ防止にJST正午）
function toIsoFromYmd(ymd) {
  if (!ymd) return undefined;
  return `${ymd}T12:00:00+09:00`;
}

export default function RecordInputCard() {
  // 画面入力
  const [dateYmd, setDateYmd] = useState(() => {
    const d = new Date();
    // YYYY-MM-DD
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });
  const [sales, setSales] = useState("");   // 円
  const [hours, setHours] = useState("");   // h（現在は未送信）
  const [count, setCount] = useState("");   // 件（現在は未送信）

  const [msg, setMsg] = useState("");

  async function onSave() {
    setMsg("");

    // バックエンドは value を合計するので、売上を value に入れて送る
    const payload = {
      title: "record",                      // サーバ既定と合わせる。任意で "売上" 等でも可
      value: toInt(sales),                  // ★これが月間合計の対象
      created_at: toIsoFromYmd(dateYmd),    // サーバ側が無視する設計でも害なし
      // hours, count は今は使わないので送らない（必要になったらAPIを拡張）
    };

    try {
      await api.createRecord(payload);

      // 入力欄をクリア（要望）
      setSales("");
      setHours("");
      setCount("");

      // 作成直後にダッシュボード側へ更新通知
      window.dispatchEvent(new CustomEvent("dnf:records-updated"));
      setMsg("保存しました。ダッシュボード/グラフは自動更新されます。");
    } catch (e) {
      const detail = e?.data?.detail ?? e.message ?? "error";
      setMsg(`保存に失敗しました。${detail}`);
    }
  }

  return (
    <div>
      <div className="text-lg font-semibold mb-3">実績を記録</div>

      <div className="space-y-3">
        <label className="block text-sm text-neutral-400">
          日付
          <input
            type="date"
            value={dateYmd}
            onChange={(e) => setDateYmd(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-neutral-400">
          売上（円）
          <input
            type="text"
            inputMode="numeric"
            placeholder="例: 12400"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-neutral-400">
          稼働時間（h）
          <input
            type="text"
            inputMode="decimal"
            placeholder="例: 4.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-neutral-400">
          件数
          <input
            type="text"
            inputMode="numeric"
            placeholder="例: 8"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="mt-1 w-full rounded bg-neutral-900 border border-neutral-700 px-3 py-2"
          />
        </label>

        <button
          onClick={onSave}
          className="px-4 py-2 rounded bg-emerald-700 hover:bg-emerald-600">
          保存
        </button>

        {msg && (
          <div className="text-sm text-neutral-300 mt-2">{msg}</div>
        )}
      </div>
    </div>
  );
}
