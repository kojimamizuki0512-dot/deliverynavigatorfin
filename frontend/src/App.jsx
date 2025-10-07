// frontend/src/App.jsx
import { useEffect, useMemo, useState } from "react";
import * as api from "./api";
import "./index.css";

function LoginPanel({ onDone, error }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = username.trim().length >= 3 && password.length >= 4;

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "register") {
        await api.register({ username: username.trim(), password, email: email.trim() });
      } else {
        await api.login({ username: username.trim(), password });
      }
      onDone?.();
    } catch (err) {
      alert(`認証エラー: ${err.message || err}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#111] text-white">
      <div className="w-[420px] rounded-2xl p-6 bg-[#1a1a1a] shadow-xl border border-[#2a2a2a]">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg ${mode === "login" ? "bg-[#2a2a2a]" : "bg-[#141414]"}`}
          >
            ログイン
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-lg ${mode === "register" ? "bg-[#2a2a2a]" : "bg-[#141414]"}`}
          >
            新規登録
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            className="px-3 py-3 rounded-lg bg-[#131313] border border-[#2a2a2a]"
            placeholder="ユーザー名（ログインID）"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {mode === "register" && (
            <input
              className="px-3 py-3 rounded-lg bg-[#131313] border border-[#2a2a2a]"
              placeholder="メール（任意）"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input
            className="px-3 py-3 rounded-lg bg-[#131313] border border-[#2a2a2a]"
            placeholder="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={!canSubmit}
            className="mt-2 py-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 disabled:bg-[#333]"
          >
            {mode === "register" ? "登録してはじめる" : "ログイン"}
          </button>

          {error ? <p className="text-red-400 text-sm mt-2">{error}</p> : null}

          <button
            type="button"
            onClick={() => {
              // ローカルデモモード（サインインせず使う）
              localStorage.setItem("dn_demo", "1");
              onDone?.();
            }}
            className="mt-3 py-2 rounded-lg bg-[#222] hover:bg-[#262626] text-xs"
          >
            ログインせずに試す（デモ）
          </button>
        </form>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="w-full min-h-[60vh] grid place-items-center text-[#777]">
      読み込み中…
    </div>
  );
}

/** 既存のカードUIがある前提。なければ簡易表示にフォールバック */
function SimpleDeck({ route, predicted }) {
  return (
    <div className="max-w-[420px] mx-auto mt-6 text-white">
      <div className="rounded-2xl p-5 bg-[#161616] border border-[#242424] shadow">
        <h2 className="text-lg font-semibold mb-4">AIルート提案</h2>
        <div className="space-y-3">
          {(route || []).map((it, i) => (
            <div key={i} className="flex items-center gap-3 text-sm opacity-90">
              <span className="text-[#9aa] w-12">{it.time}</span>
              <span className="opacity-90">{it.title}</span>
            </div>
          ))}
        </div>
        {typeof predicted === "number" && (
          <div className="mt-5 text-right">
            <span className="text-emerald-400/90 text-xl font-bold">¥{predicted.toLocaleString()}</span>
            <span className="ml-2 text-[#8a8a8a] text-xs">予測日給</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!api.getAccessToken() || localStorage.getItem("dn_demo") === "1");
  const [goal] = useState(12000);

  const [route, setRoute] = useState(null);
  const [summary, setSummary] = useState(null);
  const [heat, setHeat] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const totalCards = useMemo(() => (Array.isArray(route) ? route.length : 0), [route]);

  useEffect(() => {
    if (!authed) return;
    const load = async () => {
      setLoading(true);
      try {
        // デモモード？
        const isDemo = localStorage.getItem("dn_demo") === "1";
        if (isDemo) {
          setRoute(api.demoDailyRoute());
          setSummary(api.demoSummary(goal));
          setHeat(api.demoHeat());
          setRecords([]);
          return;
        }
        // 認証確認（失敗ならAUTH扱い）
        await api.me();
        const [r, s, h, rec] = await Promise.all([
          api.dailyRoute(),
          api.dailySummary(goal),
          api.heatmapData(),
          api.listRecords().catch(() => []),
        ]);
        setRoute(r || []);
        setSummary(s || null);
        setHeat(h || []);
        setRecords(rec || []);
        setAuthError("");
      } catch (e) {
        if (e.code === "AUTH") {
          api.clearTokens();
          setAuthed(false);
          setAuthError("ログインが必要です");
        } else {
          // ネットワーク等はデモに切り替え（画面が真っ黒にならないため）
          setRoute(api.demoDailyRoute());
          setSummary(api.demoSummary(goal));
          setHeat(api.demoHeat());
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authed, goal]);

  const handleAuthDone = () => {
    setAuthed(true);
    setAuthError("");
  };

  if (!authed) return <LoginPanel onDone={handleAuthDone} error={authError} />;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <div className="max-w-[960px] mx-auto px-4 py-5">
        <h1 className="text-xl font-semibold mb-4">Delivery Navigator</h1>

        {/* コックピット（既存があれば差し替えてOK） */}
        <div className="rounded-2xl p-4 bg-[#161616] border border-[#242424]">
          <div className="text-sm text-[#9aa] mb-2">コックピット・ダッシュボード</div>
          <div className="h-3 rounded-full bg-[#1f1f1f] overflow-hidden">
            <div
              className="h-full bg-emerald-500/80"
              style={{ width: `${Math.round((summary?.progress || 0) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-[#8a8a8a] mt-2">
            ¥{(summary?.earned || 0).toLocaleString()} / ¥{(summary?.goal || goal).toLocaleString()}　
            時給 ¥{(summary?.hourly || 0).toLocaleString()}　稼働 {(summary?.workHours || 0)}h
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : totalCards > 0 ? (
          <SimpleDeck route={route} predicted={summary?.predicted} />
        ) : (
          <div className="mt-6 text-center text-[#888]">データがありません</div>
        )}

        {/* ユーザーごとの記録入力（端末/ユーザーで別々に保存） */}
        <RecordInputCard
          records={records}
          onSubmit={async (payload) => {
            try {
              if (localStorage.getItem("dn_demo") === "1") {
                alert("デモ中は保存されません（UIのみ挙動）。");
                return;
              }
              await api.createRecord(payload);
              const list = await api.listRecords();
              setRecords(list || []);
            } catch (e) {
              alert(`保存に失敗しました: ${e.message || e}`);
            }
          }}
        />
      </div>
    </div>
  );
}

// ---- 記録入力カード（このファイル内に簡易実装）
function RecordInputCard({ records = [], onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="max-w-[420px] mx-auto mt-8">
      <div className="rounded-2xl p-5 bg-[#161616] border border-[#242424]">
        <div className="text-lg font-semibold mb-3">今日のメモ（ユーザーごと）</div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例: 19:00 渋谷駅前がアツい"
            className="flex-1 px-3 py-3 rounded-lg bg-[#131313] border border-[#2a2a2a]"
          />
          <button
            onClick={() => text.trim() && onSubmit?.({ text: text.trim() })}
            className="px-4 rounded-lg bg-emerald-600/80 hover:bg-emerald-600"
          >
            追加
          </button>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {(records || []).slice(0, 10).map((r) => (
            <div key={r.id || r.text + String(r.created_at)} className="opacity-90">
              • {r.text}
            </div>
          ))}
          {(!records || records.length === 0) && (
            <div className="text-[#8a8a8a]">まだ記録がありません</div>
          )}
        </div>
      </div>
    </div>
  );
}
