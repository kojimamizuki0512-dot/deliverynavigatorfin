import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api";

/**
 * 実績入力カード
 * - 「売上（円）」をバックエンドに保存します（value にマップ）
 * - 保存成功時にブラウザ全体へ CustomEvent を通知します（他カードが再取得できるように）
 *
 * ★学習ポイント（入門向け解説）
 * - useState でフォームの状態を管理（React の基本）
 * - onSubmit で payload を組み立てて、api.createRecord() で POST
 * - 成功時に window.dispatchEvent(new CustomEvent(...)) で「出来事」を発火
 *   → 他のコンポーネント（SummaryCard など）が addEventListener で受け取れる
 * - まずは「イベントを飛ばす」だけを実装し、受信側は次の手順で追加します
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

  // 売上が未入力 or 数値でない場合は保存ボタンを無効化
  const isDisabled = useMemo(() => {
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
      // （タイムゾーン差の影響で日付がズレにくい・集計しやすい）
      const createdAtIso = dayjs(date)
        .hour(12).minute(0).second(0).millisecond(0)
        .toISOString();

      // タイトルは学習目的で、入力の概要を残す
      const title = `manual input: ${hours || 0}h / ${count || 0}件`;

      const payload = {
        title,
        value: Number(sales),
        created_at: createdAtIso,
      };

      // ---- API を叩く（トークンは apiFetch 側で付与）----
      const created = await api.createRecord(payload);

      // ---- ここが今回の追加：保存成功イベントをブラウザ全体に飛ばす ----
      // detail には作成されたレコードと入力値を渡す（受信側が自由に使える）
      window.dispatchEvent(new CustomEvent("dnf:record:saved", {
        detail: { record: created, payload }
      }));

      // 成功メッセージ＆軽いリセット
      setMsg("保存しました。ダッシュボードは自動更新されます。");
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

      {/* --- 学習用メモ ---
         ・イベント駆動の発想：
           いきなり親子 props を通さずとも、まずは「出来事」を投げて他が拾う形にすると
           既存コードへの影響が最小になる（1ファイル差分で段階的導入ができる）。
         ・次の手順で SummaryCard / CockpitBar 側に addEventListener を書いて、
           この "dnf:record:saved" を受けたら各APIを再取得する実装を足します。
      -------------------------------- */}
    </div>
  );
}
