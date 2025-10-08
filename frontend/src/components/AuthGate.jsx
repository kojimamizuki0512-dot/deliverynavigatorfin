import { useEffect, useState } from "react";
import { api, setToken, clearToken } from "../api";

/**
 * AuthGate
 * - 未ログイン時: ログイン/新規登録のタブUIを表示
 * - ログイン/登録成功時: access を localStorage に保存 -> /api/auth/me でユーザー取得
 * - ログアウト: clearToken() -> リロード
 *
 * API 契約（/src/api/index.js に準拠）:
 *   api.login(username, password) -> { access, refresh }
 *   api.register(username, password, email?) -> { id, username, email, access, refresh }
 *   api.me() -> { id, username, email }
 */
export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await api.me();
        setUser(me);
      } catch (_) {
        // 未ログイン（無視）
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-zinc-300 p-6">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-zinc-200 flex items-center justify-center">
        <div className="w-[380px] bg-black/30 rounded-2xl p-6 shadow-xl border border-white/10">
          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-2 rounded-xl ${view === "login" ? "bg-white/10" : "bg-transparent"}`}
              onClick={() => setView("login")}
            >
              ログイン
            </button>
            <button
              className={`flex-1 py-2 rounded-xl ${view === "register" ? "bg-white/10" : "bg-transparent"}`}
              onClick={() => setView("register")}
            >
              新規登録
            </button>
          </div>

          {view === "login" ? (
            <Login onDone={setUser} setErr={setErr} />
          ) : (
            <Register onDone={setUser} setErr={setErr} />
          )}

          {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-2 right-3 text-xs text-zinc-400">
        {user.first_name ? `${user.first_name} さん` : user.username} /{" "}
        <button
          className="underline"
          onClick={() => {
            clearToken();
            location.reload();
          }}
        >
          ログアウト
        </button>
      </div>
      {children}
    </div>
  );
}

function Login({ onDone, setErr }) {
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [waiting, setWaiting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setWaiting(true);
    try {
      // /api/auth/login/ は (username, password) の位置引数
      const res = await api.login(username, pw);
      if (res?.access) setToken(res.access);
      const me = await api.me();
      onDone(me);
    } catch (e) {
      setErr("ログインに失敗しました");
    } finally {
      setWaiting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
      />
      <input
        type="password"
        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10"
        placeholder="パスワード"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
        autoComplete="current-password"
      />
      <button
        disabled={waiting}
        className="w-full py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 transition"
      >
        ログイン
      </button>
    </form>
  );
}

function Register({ onDone, setErr }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [waiting, setWaiting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setWaiting(true);
    try {
      // /api/auth/register/ は (username, password, email?) の位置引数
      const res = await api.register(username, pw, email || undefined);
      if (res?.access) {
        setToken(res.access);
      } else {
        // 念のため自動ログインフォールバック
        const loginRes = await api.login(username, pw);
        if (loginRes?.access) setToken(loginRes.access);
      }
      const me = await api.me();
      onDone(me);
    } catch (e) {
      setErr("登録に失敗しました。メール重複またはパスワード不正の可能性があります。");
    } finally {
      setWaiting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
      />
      <input
        type="email"
        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10"
        placeholder="メール（任意）"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        type="password"
        className="w-full px-3 py-2 rounded bg-white/5 border border-white/10"
        placeholder="パスワード（8文字以上）"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <button
        disabled={waiting}
        className="w-full py-2 rounded-xl bg-sky-500/80 hover:bg-sky-500 transition"
      >
        登録してはじめる
      </button>
    </form>
  );
}
