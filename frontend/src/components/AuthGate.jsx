import React, { useEffect, useState } from "react";
import { api } from "../api";

/**
 * 匿名モード用の超軽量ゲート。
 * - /api/me を一度呼んでゲストユーザーをサーバ側に用意（失敗しても先へ進む）
 * - 最大 1.5 秒でタイムアウトして必ず先へ進む（ハング防止）
 */
export default function AuthGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let finished = false;

    // セーフティ：1.5秒で必ず開放
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        setReady(true);
      }
    }, 1500);

    (async () => {
      try {
        // 匿名でもOKな /api/me（X-Device-Id を送るだけ）
        await api.me();
      } catch (_) {
        // 失敗しても続行（オフラインでもUIは見せる）
      }
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        setReady(true);
      }
    })();

    return () => clearTimeout(timeout);
  }, []);

  if (!ready) {
    return (
      <div style={{ color: "#e5e7eb", padding: "24px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Delivery Navigator
        </div>
        <div>認証を確認中…</div>
      </div>
    );
  }

  return children;
}
