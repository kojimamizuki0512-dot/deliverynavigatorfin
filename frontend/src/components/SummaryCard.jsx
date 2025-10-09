// C:\Users\kojim\Documents\deliverynavigatorfin\frontend\src\components\SummaryCard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api";

/**
 * これはダッシュボード上の「今月の累計」カード。
 * 目的：
 *  1) 画面表示時に /api/monthly-total/ を叩いて累計を表示する
 *  2) 実績の保存が成功したら（RecordInputCard がイベントを投げる）
 *     それを受け取って自動で再取得し、数字を更新する
 *
 * React Hooks ざっくり：
 *  - useState: 値（total, loading, err）をコンポーネント内に持つ
 *  - useCallback: 関数(refetch)をメモ化＝依存が変わらない限り同じ参照で保持
 *  - useEffect: ライフサイクルのように副作用（初期取得、イベント購読/解除）を行う
 */
export default function SummaryCard() {
  // 今月の合計金額
  const [total, setTotal] = useState(0);
  // 通信中かどうか
  const [loading, setLoading] = useState(true);
  // エラーメッセージ（あれば表示）
  const [err, setErr] = useState("");

  /**
   * API から今月の合計を取得する共通関数。
   * - どこからでも呼べるように useCallback でメモ化している
   * - レスポンスの形が将来変わっても壊れにくいように、柔軟にパースする
   */
  const refetch = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      // 認証が必要なAPI。フロントの apiFetch が自動で Authorization を付与してくれる
      const res = await api.monthlyTotal();

      // ケース1: { total: 12345 } のようなオブジェクトで来る場合
      if (res && typeof res.total === "number") {
        setTotal(res.total);
      }
      // ケース2: [ { value: 1000 }, ... ] のような配列で来る場合
      else if (Array.isArray(res)) {
        const sum = res.reduce((acc, row) => acc + (Number(row?.value) || 0), 0);
        setTotal(sum);
      }
      // それ以外は 0 とみなす（バックの将来変更に備えた安全策）
      else {
        setTotal(0);
      }
    } catch (e) {
      // 401（未ログイン）のときはメッセージを優しめに
      if (e?.status === 401) {
        setErr("ログイン状態が切れています。再ログインしてください。");
      } else {
        setErr(e?.data?.detail || "取得に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 画面に初めて表示されたときに一回だけ取得。
   * 依存配列に refetch を入れるのは、eslint 的に推奨の書き方。
   */
  useEffect(() => {
    refetch();
  }, [refetch]);

  /**
   * ★今回の肝：RecordInputCard 側で保存成功時に発火される
   *   window.dispatchEvent(new CustomEvent("dnf:record:saved", { detail: {...} }))
   *   を購読して、受け取ったら再取得する。
   *
   * イベント名は "dnf:record:saved"（固定）。
   */
  useEffect(() => {
    const onSaved = () => {
      // 保存直後に数字を最新化。連打されても問題なし。
      refetch();
    };
    window.addEventListener("dnf:record:saved", onSaved);
    // アンマウント時に購読解除（メモリリーク防止）
    return () => window.removeEventListener("dnf:record:saved", onSaved);
  }, [refetch]);

  // 金額の表示を「¥1,234」のように整える小ヘルパー
  function formatJPY(v) {
    try {
      return `¥${Number(v || 0).toLocaleString("ja-JP")}`;
    } catch {
      return `¥${v}`;
    }
  }

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
      <div className="mb-3 text-lg font-semibold">これまでのサマリー</div>

      {loading ? (
        <div className="text-neutral-400">読み込み中…</div>
      ) : err ? (
        <div className="text-amber-300">{err}</div>
      ) : (
        <>
          <div className="mb-2 text-sm text-neutral-400">今月の累計</div>
          <div className="text-3xl font-bold">{formatJPY(total)}</div>

          {/* 週次グラフをこのカードに一緒に描く場合は、ここに Recharts 等で描画する */}
        </>
      )}
    </div>
  );
}
