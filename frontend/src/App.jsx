import { useEffect, useState } from "react";
import { api } from "./api";
import RecordInputCard from "./components/RecordInputCard";

function LoginPanel({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Mizuki0512@"); // デモ用に表示
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [err, setErr] = useState("");

  async function register() {
    setErr("");
    try {
      const res = await api.register({
        username: nickname,  // 任意
        email,               // 任意
        password,
      });
      localStorage.setItem("access_token", res.access);
      onLoggedIn();
    } catch (e) {
      setErr("登録に失敗しました");
      alert(e.message);
    }
  }

  async function login() {
    setErr("");
    try {
      const res = await api.login({ login: email || nickname, password });
      localStorage.setItem("access_token", res.access);
      onLoggedIn();
    } catch (e) {
      setErr("ログインに失敗しました");
      alert(e.message);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-neutral-900 rounded-2xl p-6 space-y-3">
      <div className="flex gap-2">
        <button onClick={()=>setMode("login")}
                className={`px-3 py-2 rounded ${mode==="login"?"bg-emerald-600 text-white":"bg-neutral-800 text-white/80"}`}>
          ログイン
        </button>
        <button onClick={()=>setMode("register")}
                className={`px-3 py-2 rounded ${mode==="register"?"bg-emerald-600 text-white":"bg-neutral-800 text-white/80"}`}>
          新規登録
        </button>
      </div>

      {mode === "register" && (
        <input className="w-full bg-black/40 rounded px-3 py-2 text-white"
               placeholder="ニックネーム（任意）" value={nickname} onChange={e=>setNickname(e.target.value)} />
      )}
      <input className="w-full bg-black/40 rounded px-3 py-2 text-white"
             placeholder="メール（ログインID でも可）" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full bg-black/40 rounded px-3 py-2 text-white"
             type="password" placeholder="パスワード（8文字以上）" value={password} onChange={e=>setPassword(e.target.value)} />

      <button onClick={mode==="register" ? register : login}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2">
        登録してはじめる
      </button>

      <button onClick={async ()=>{
        // デモログイン（サーバでユーザーが無ければ登録→ログイン）
        try {
          // 1) まず登録を試みる
          try {
            const res = await api.register({ username:"demo", email:"", password:"Mizuki0512@" });
            localStorage.setItem("access_token", res.access);
            onLoggedIn();
            return;
          } catch {}
          // 2) ダメならログイン
          const res2 = await api.login({ login:"demo", password:"Mizuki0512@" });
          localStorage.setItem("access_token", res2.access);
          onLoggedIn();
        } catch (e) {
          alert("デモログイン失敗: " + e.message);
        }
      }} className="w-full bg-neutral-800 text-white rounded px-4 py-2">
        ログインを先に試す（デモ）
      </button>

      {err && <div className="text-red-400 text-sm">{err}</div>}
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState(null);
  const [route, setRoute] = useState(null);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);

  async function loadAll() {
    const m = await api.me();
    setMe(m);
    const [r, s, list] = await Promise.all([
      api.dailyRoute(),
      api.dailySummary(12000),
      api.records.list(),
    ]);
    setRoute(r);
    setSummary(s);
    setRecords(list);
  }

  useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem("access_token")) {
          await loadAll();
        }
      } catch (e) {
        // 未ログインの場合は何もしない
      }
    })();
  }, []);

  if (!me) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <LoginPanel onLoggedIn={loadAll} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="text-xl font-bold">Delivery Navigator</div>

      {summary && (
        <div className="bg-neutral-900 rounded-2xl p-4">
          <div>コックピット・ダッシュボード</div>
          <div className="text-sm text-white/70 mt-1">
            ¥{summary.earned.toLocaleString()} / ¥{summary.goal.toLocaleString()}　
            時給 ¥{summary.per_hour.toLocaleString()}　稼働 {summary.hours}h
          </div>
          <div className="w-full bg-neutral-800 h-3 rounded mt-3">
            <div className="bg-emerald-500 h-3 rounded" style={{width: `${summary.progress_pct}%`}} />
          </div>
        </div>
      )}

      {route && (
        <div className="bg-neutral-900 rounded-2xl p-4 space-y-2">
          <div className="text-white/80">AIルート提案（カード {route.current_index}/{route.cards_total}）</div>
          <ul className="space-y-1">
            {route.items.map((it, i) => (
              <li key={i} className="text-white/90">
                <span className="text-white/60 mr-2">{it.time}</span>{it.text}
              </li>
            ))}
          </ul>
          <div className="text-emerald-400 text-right">予測日給 ¥{route.estimated_income.toLocaleString()}</div>
        </div>
      )}

      <RecordInputCard onSaved={(rec)=>setRecords([rec, ...records])} />

      <div className="bg-neutral-900 rounded-2xl p-4">
        <div className="text-white/80 mb-2">あなたの記録</div>
        {records.length === 0 ? (
          <div className="text-white/60">まだ記録はありません</div>
        ) : (
          <ul className="space-y-2">
            {records.map(r => (
              <li key={r.id} className="flex justify-between text-white/90">
                <span>{new Date(r.created_at).toLocaleString()}</span>
                <span>¥{r.amount} / {r.duration_min}分 / {r.memo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="text-white/60 underline" onClick={()=>{
        localStorage.removeItem("access_token");
        location.reload();
      }}>ログアウト</button>
    </div>
  );
}
