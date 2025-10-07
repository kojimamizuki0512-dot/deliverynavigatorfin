import { useEffect, useState } from "react";
import { api, clearTokens } from "../api";

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
        // 未ログイン
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
            <button className={`flex-1 py-2 rounded-xl ${view==='login'?'bg-white/10':'bg-transparent'}`} onClick={()=>setView('login')}>ログイン</button>
            <button className={`flex-1 py-2 rounded-xl ${view==='register'?'bg-white/10':'bg-transparent'}`} onClick={()=>setView('register')}>新規登録</button>
          </div>
          {view === "login" ? <Login onDone={setUser} setErr={setErr}/> : <Register onDone={setUser} setErr={setErr}/>}
          {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-2 right-3 text-xs text-zinc-400">
        {user.first_name ? `${user.first_name} さん` : user.username} /{" "}
        <button className="underline" onClick={() => { clearTokens(); location.reload(); }}>ログアウト</button>
      </div>
      {children}
    </div>
  );
}

function Login({ onDone, setErr }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [waiting, setWaiting] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr(""); setWaiting(true);
    try {
      await api.login({ emailOrUsername: id, password: pw });
      const me = await api.me();
      onDone(me);
    } catch (e) {
      setErr("ログインに失敗しました");
    } finally { setWaiting(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" placeholder="メールまたはユーザー名" value={id} onChange={e=>setId(e.target.value)} />
      <input type="password" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" placeholder="パスワード" value={pw} onChange={e=>setPw(e.target.value)} />
      <button disabled={waiting} className="w-full py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 transition">ログイン</button>
    </form>
  );
}

function Register({ onDone, setErr }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [waiting, setWaiting] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setErr(""); setWaiting(true);
    try {
      await api.register({ email, password: pw, name });
      await api.login({ emailOrUsername: email, password: pw });
      const me = await api.me();
      onDone(me);
    } catch (e) {
      setErr("登録に失敗しました。メール重複またはパスワード不正の可能性があります。");
    } finally { setWaiting(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" placeholder="ニックネーム（任意）" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" placeholder="メール（ログインID）" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10" placeholder="パスワード（8文字以上）" value={pw} onChange={e=>setPw(e.target.value)} />
      <button disabled={waiting} className="w-full py-2 rounded-xl bg-sky-500/80 hover:bg-sky-500 transition">登録してはじめる</button>
    </form>
  );
}
