import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api";

/**
 * 実績入力カード
 * - まずは「売上（円）」だけをバックエンドに送ります（value にマップ）
 * - バックの /api/records/ は {title, value, created_at} を受け取れる想定
 *   - title: 文字列（ここでは備考的に作る）
 *   - value: 数値（今回の主役。売上をそのまま入れる）
 *   - created_at: ISO日時（選択した日を 12:00 固定で送る）
 *
 * ★学習ポイント（入門の方へ）
 * - React の useState でフォームの状態を持つ
 * - クリック時に payload を作り、api.createRecord() で POST
 * - 成功/失敗でメッセージ表示、ボタンの二重押し対策に waiting フラグ
 */
export default function RecordInputCard() {
  // ---- フォーム状態 ----
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [sales, setSales] = useState("");     // 売上（円） -> backend: value
  const [hours, setHours] = useState("");     // 稼働時間（h）…今はタイトルにだけ反映
  const [count, setCount] = useState("");     // 件数 …今はタイトルにだけ反映

  // UI フィードバック
  const [msg, setMsg] = useState("");
  const [waiting, setWaiting] = useState(false);

  // 「この月の合計など」を別カードで扱うため、ここは入力に専念
  const isDisabled = useMemo(() => {
    // 売上が未入力 or 数字でないときは保存させない
    if (sales === "") return true;
    const n = Number(sales);
    return Number.isNaN(n) || n < 0;
  }, [sales]);

  async function onSave(e) {
    e.preventDefault();
    setMsg("");
    setWaiting(true);

    try {
      // ---- payload を組み立てる ----
      // created_at はユーザーが選んだ日付を 12:00 固定にして ISO 文字列に。
      // （タイムゾーン差の影響で日付がズレにくい・集計しやすい為の小ワザ）
      const createdAtIso = dayjs(date).hour(12).minute(0).second(0).millisecond(0).toISOString();

      // タイトルは学習目的で、入力の概要を残す
      const title = `manual input: ${hours || 0}h / ${count || 0}件`;

      const payload = {
        title,
        value: Number(sales),
        created_at: createdAtIso,
      };

      // ---- API を叩く（認証トークンは apiFetch 側で自動付与）----
      await api.createRecord(payload);

      // 成功したらフォームを軽くリセット
      setMsg("保存しました。ダッシュボードの合計は次回取得時に反映されます。");
      setSales("");
      // hours / count は今は保存対象外（将来のスキーマ拡張で送る想定）
    } catch (err) {
      // サーバーが返す detail があれば見せる
      const detail = err?.data?.detail || "保存に失敗しました。ネットワークやCORS設定をご確認ください。";
      setMsg(detail);
    } finally {
      setWaiting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
      <div className="mb-3 text-lg font-semibold">実績を記録</div>

      <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {/* 日付 */}
        <label className="block text-sm">
          <div className="mb-1">日付</div>
          <input
            type="date"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        {/* 売上（円） -> backend:value */}
        <label className="block text-sm">
          <div className="mb-1">売上（円）</div>
          <input
            inputMode="numeric"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
            placeholder="例: 12400"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            required
          />
        </label>

        {/* 稼働時間（h）…今は title にだけ反映 */}
        <label className="block text-sm">
          <div className="mb-1">稼働時間（h）</div>
          <input
            inputMode="decimal"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
            placeholder="例: 4.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </label>

        {/* 件数 …今は title にだけ反映 */}
        <label className="block text-sm">
          <div className="mb-1">件数</div>
          <input
            inputMode="numeric"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
            placeholder="例: 8"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </label>

        {/* 保存ボタン（md 未満では次段に落ちる） */}
        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={waiting || isDisabled}
            className={`px-4 py-2 rounded-lg ${waiting || isDisabled ? "bg-emerald-700/40 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"} transition`}
            title={isDisabled ? "売上を数値で入力してください" : "保存"}
          >
            {waiting ? "保存中…" : "保存"}
          </button>
        </div>
      </form>

      {/* メッセージ */}
      {msg && (
        <div className="mt-3 text-sm text-zinc-300">
          {msg}
        </div>
      )}

      {/* --- 以下は学習向けメモ（実装のヒント）---
         ・いずれ hours/count もサーバーに保存したくなったら、バック側のモデルを
           DeliveryRecord(date, revenue, hours, count) などに拡張し、シリアライザ/ビュー/URL を追加。
         ・フロントは payload をそれに合わせて { date, revenue, hours, count } に切り替える。
         ・月間合計の /api/monthly-total/ も revenue を集計するように変更すると、グラフやCockpitがリアル連動可能。
      ------------------------------------------------ */}
    </div>
  );
}
