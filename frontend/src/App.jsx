import { useEffect, useState } from "react";
import * as api from "./api/index.js";
import "./index.css";

function LoginCard({ onSuccess }) {
  const [tab, setTab] = useState("register"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // 任意
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handleRegister() {
    setErr("");
    try {
      const res = await api.apiRegister({ username, email, password });
      api.setToken(res.access);
      onSuccess();
    } catch (e) {
      setErr(`登録失敗: ${e.message}`);
    }
  }

  async function handleLogin() {
    setErr("");
    try {
      await api.apiLogin({ username, password });
      onSuccess();
    } catch (e) {
      setErr(`ログイン失敗: ${e.message}`);
    }
  }

  return (
    <div className="login-wrap">
      <div className="tabs">
        <button
          className={tab === "login" ? "active" : ""}
          onClick={() => setTab("login")}
        >
          ログイン
        </button>
        <button
          className={tab === "register" ? "active" : ""}
          onClick={() => setTab("register")}
        >
          新規登録
        </button>
      </div>

      <div className="form">
        <input
          placeholder="ユーザー名（必須）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {tab === "register" && (
          <input
            placeholder="メール（任意）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
        <input
          placeholder="パスワード（6文字以上）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {tab === "register" ? (
          <button onClick={handleRegister}>登録してはじめる</button>
        ) : (
          <button onClick={handleLogin}>ログイン</button>
        )}

        {err && <p className="error">{err}</p>}

        <div className="try">
          <button
            onClick={async () => {
              try {
                await api.apiLogin({ username: "demo", password: "demo1234" });
                onSuccess();
              } catch (e) {
                alert("デモユーザーが未作成です（管理側で作成してください）");
              }
            }}
          >
            ログインを先に試す（デモ）
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState(null);
  const [route, setRoute] = useState(null);
  const [heat, setHeat] = useState(null);
  const [goal] = useState(12000);

  async function fetchAll() {
    const [r, s, h] = await Promise.all([
      api.apiDailyRoute(),
      api.apiDailySummary(goal),
      api.apiHeatmap()
    ]);
    setRoute(r);
    setSummary(s);
    setHeat(h);
  }

  useEffect(() => {
    // すでにトークンがあれば試しに /me
    (async () => {
      try {
        if (api.getToken()) await api.apiMe();
        await fetchAll();
        setReady(true);
      } catch {
        // 未ログイン → readyはfalseのまま
      }
    })();
  }, []);

  if (!ready || !summary || !route) {
    return <LoginCard onSuccess={async () => { await fetchAll(); setReady(true); }} />;
  }

  // 以下は既存のUI（略）─ 実体のカード群をレンダリング
  return (
    <div className="page">
      <header>Delivery Navigator</header>

      <section className="cockpit">
        <div className="bar">
          <div className="fill" style={{ width: `${Math.min(100, (summary.earned / summary.goal) * 100)}%` }} />
          <span>{Math.round((summary.earned / summary.goal) * 100)}%</span>
        </div>
        <div className="meta">
          ¥{summary.earned.toLocaleString()} / ¥{summary.goal.toLocaleString()}　|　
          時給 ¥{summary.wage.toLocaleString()}　|　稼働 {summary.hours}h
        </div>
      </section>

      <section className="cards">
        <h3>AIルート提案</h3>
        <ul>
          {route.timeline.map((it, idx) => (
            <li key={idx}>{it.time}　{it.label}</li>
          ))}
        </ul>
        <div className="pred">予測日給　<span className="glow">¥{summary.predicted.toLocaleString()}</span></div>
      </section>

      <footer className="tabs">ホーム　ルート　ヒート　ログ</footer>
    </div>
  );
}
