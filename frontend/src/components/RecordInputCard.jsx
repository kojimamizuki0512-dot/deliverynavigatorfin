import { useState } from "react";
import { records } from "../api";

export default function RecordInputCard({ onCreated }) {
  const [amount, setAmount] = useState("");
  const [appName, setAppName] = useState("general");
  const [note, setNote] = useState("");

  const save = async () => {
    const yen = parseInt(amount || "0", 10);
    if (isNaN(yen) || yen <= 0) return alert("金額（円）を入れてください。");
    await records.create({ amount: yen, app_name: appName, note });
    setAmount(""); setNote("");
    onCreated?.();
  };

  return (
    <div className="card glass p-4 mt-4 max-w-md mx-auto">
      <div className="text-sm opacity-80 mb-2">クイック記録</div>
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input"
          placeholder="金額（円）"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="input"
          placeholder="アプリ名（任意）"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
      </div>
      <input
        className="input mt-2"
        placeholder="メモ（任意）"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="btn btn-primary w-full mt-3" onClick={save}>
        追加する
      </button>
    </div>
  );
}
