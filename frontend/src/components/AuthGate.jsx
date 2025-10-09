import React, { useMemo } from "react";

/**
 * ログイン廃止モード：
 * 端末ごとの匿名IDを localStorage に用意するだけ。
 * 画面は即座に素通し（待ち時間ゼロ）。
 */
const DID_KEY = "dnf_device_id";

function ensureDeviceId() {
  let id = localStorage.getItem(DID_KEY);
  if (!id) {
    // 端末ごと一意（ユーザー操作なし）
    id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : String(Math.random()).slice(2) + Date.now();
    localStorage.setItem(DID_KEY, id);
  }
  return id;
}

export default function AuthGate({ children }) {
  useMemo(() => { ensureDeviceId(); }, []);
  return children;
}
