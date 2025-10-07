import { useEffect, useMemo, useState } from "react";
import { api, setToken, getToken } from "./api";

function useDeviceId() {
  return useMemo(() => {
    let d = localStorage.getItem("device_id");
    if (!d) {
      d = crypto.getRandomValues(new Uint32Array(2)).join("");
      localStorage.setItem("device_id", d);
    }
    return d;
  }, []);
}

export default function App() {
  const deviceId = useDeviceId();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [route, setRoute] = useState([]);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // トークンがなければゲストログイン
        if (!getToken()) {
          const r = await api.guestLogin(deviceId);
          setToken(r.access);
        }
        const m = await api.me();
        setMe(m);
        const s = await api.dailySummary(12000);
        setSummary(s);
        const rts = await api.dailyRoute();
        setRoute(rts.cards || []);
        const rs = await api.records.list();
        setRecs(rs);
      } catch (e) {
        console.error(e);
        alert("初期化に失敗しました。時間を置いて再読み込みしてください。");
      } finally {
        setLoading(false);
      }
    })();
  }, [deviceId]);

  async function addRecord() {
    const memo = prompt("メモ（任意）", "");
    if (memo === null) return;
    const amount = Number(prompt("金額(整数)", "0") || "0");
    try {
      const created = await api.records.create({ memo, amount });
      setRecs((x) => [created, ...x]);
    } catch (e) {
      alert("保存に失敗しました");
    }
  }

  if (loading) return <div style={{ color: "#fff", padding: 24 }}>Loading…</div>;

  return (
    <div style={{ color: "#fff", padding: 24 }}>
      <h2>Delivery Navigator</h2>
      <p>ユーザー: {me?.username}</p>

      <section>
        <h3>コックピット</h3>
        <p>
          目標: ¥{summary?.goal?.toLocaleString()} / 収益: ¥
          {summary?.earned?.toLocaleString()} / 稼働: {summary?.hours}h
        </p>
      </section>

      <section>
        <h3>AIルート（あなた用に個別化）</h3>
        <ol>
          {route.map((c, i) => (
            <li key={i}>
              {c.time} - {c.title}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>あなたの記録</h3>
        <button onClick={addRecord}>+ 追加</button>
        <ul>
          {recs.map((r) => (
            <li key={r.id}>
              {new Date(r.created_at).toLocaleString()} / ¥{r.amount} / {r.memo}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
