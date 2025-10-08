import { useEffect, useMemo, useState } from "react";
import { api, setToken, getToken } from "./api";

function useDeviceId() {
  return useMemo(() => {
    const key = "device_id";
    const now = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    let id = localStorage.getItem(key);
    if (!id) {
      id = now();
      localStorage.setItem(key, id);
    }
    return id;
  }, []);
}

export default function App() {
  const deviceId = useDeviceId();
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // 初期化：ログイン済みチェック（失敗してもアラートは出さない）
  useEffect(() => {
    const t = getToken();
    if (!t) return;
    api.me().then(setMe).catch(() => setMe(null));
  }, []);

  // --- 認証 UI ---

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // 任意
  const [password, setPassword] = useState("");

  async function handleRegister() {
    setBusy(true);
    setError("");
    try {
      await api.register({ username, email, password });
      const d = await api.login({ username, password });
      if (d?.access) {
        const m = await api.me();
        setMe(m);
      }
    } catch (e) {
      setError("登録/ログインに失敗しました。入力を見直してください。");
    } finally {
      setBusy(false);
    }
  }

  async function handleLoginDemo() {
    // デモログイン（ユーザー作成が面倒な時用）
    setBusy(true);
    setError("");
    try {
      const u = `demo_${deviceId.slice(0, 8)}`;
      try {
        await api.register({ username: u, email: "", password: "demo1234" });
      } catch {
        // 既に作成済みなら続行
      }
      await api.login({ username: u, password: "demo1234" });
      const m = await api.me();
      setMe(m);
    } catch (e) {
      setError("デモログインに失敗しました。");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken("");
    setMe(null);
  }

  // --- アプリ UI ---

  const [route, setRoute] = useState([]);
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [weekly, setWeekly] = useState([]);

  async function loadData() {
    setBusy(true);
    setError("");
    try {
      const [r, s, h, w] = await Promise.all([
        api.dailyRoute(),
        api.dailySummary(12000),
        api.heatmap(),
        api.weekly()
      ]);
      setRoute(r?.points || []);
      setSummary(s || null);
      setHeatmap(h || []);
      setWeekly(w || []);
    } catch (e) {
      // ここでもアラート禁止。画面に小さく表示するだけ
      setError("データ取得に失敗しました。時間を置いて再読み込みしてください。");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (me) loadData();
  }, [me]);

  if (!me) {
    return (
      <div style={{ maxWidth: 440, margin: "40px auto", padding: 16 }}>
        <h2>Delivery Navigator FIN</h2>
        <p style={{ color: "#666" }}>ログイン または 新規登録</p>

        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <input
            placeholder="ユーザー名（必須）"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="メール（任意）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="パスワード（8文字以上）"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button disabled={busy} onClick={handleRegister}>
            {busy ? "処理中..." : "登録してはじめる"}
          </button>
          <button disabled={busy} onClick={handleLoginDemo}>
            {busy ? "処理中..." : "ログインを先に試す（デモ）"}
          </button>
          {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>ようこそ、{me.username} さん</h2>
        <button onClick={logout}>ログアウト</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <button disabled={busy} onClick={loadData}>
          {busy ? "更新中..." : "データを再取得"}
        </button>
        {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
      </div>

      <section style={{ marginTop: 24 }}>
        <h3>AIおすすめルート（ダミー）</h3>
        <pre style={{ background: "#111", color: "#9ef", padding: 12, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(route, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>今日のサマリ</h3>
        <pre style={{ background: "#111", color: "#9ef", padding: 12, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(summary, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>ヒートマップ</h3>
        <pre style={{ background: "#111", color: "#9ef", padding: 12, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(heatmap, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>週間予測</h3>
        <pre style={{ background: "#111", color: "#9ef", padding: 12, borderRadius: 8, overflow: "auto" }}>
{JSON.stringify(weekly, null, 2)}
        </pre>
      </section>
    </div>
  );
}
