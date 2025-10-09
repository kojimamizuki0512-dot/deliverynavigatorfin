import React from "react";

/**
 * 匿名モード用：認証待ちを一切せず、即座にアプリを表示するゲート。
 * ここで外部API確認やトークン検証は行いません。
 */
export default function AuthGate({ children }) {
  return <>{children}</>;
}
