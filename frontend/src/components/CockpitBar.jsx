import React from "react";

/**
 * Cockpit Dashboard card（参照画像に寄せたガラスUI）
 * props:
 *  - total: 今月合計（数値）
 *  - goal:  目標額（数値）
 *  - onChangeGoal?: 目標変更ハンドラ（省略可）
 *
 * 親から何も来なくても崩れないように安全なデフォルト付き。
 */
export default function CockpitBar(props = {}) {
  const total = isFinite(props.total) ? props.total : 0;
  const goal = isFinite(props.goal) && props.goal > 0 ? props.goal : 120000;
  const pct = Math.max(0, Math.min(1, goal ? total / goal : 0));
  const pctText = `${Math.round(pct * 100)}%`;

  const onChangeGoal =
    typeof props.onChangeGoal === "function"
      ? props.onChangeGoal
      : () => window.alert("目標変更は後で実装予定です");

  const fmtYen = (n) =>
    "¥" + (Math.round(n) || 0).toLocaleString("ja-JP");

  return (
    <div className="relative">
      {/* ガラスカード本体 */}
      <div
        className="
          relative overflow-hidden rounded-[28px]
          border border-white/10 bg-white/6 backdrop-blur-md
          shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.35)]
          px-5 py-5 sm:px-6 sm:py-6
        "
      >
        {/* エメラルドの柔らかいグロー（装飾） */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-16 -top-10 h-40 w-40 rounded-full bg-emerald-400/18 blur-2xl" />
          <div className="absolute -left-24 top-24 h-56 w-56 rounded-full bg-emerald-500/14 blur-3xl" />
        </div>

        {/* ヘッダー行：タイトルとボタン */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-[0.02em] text-white/85">
            Cockpit Dashboard
          </h3>

          <button
            onClick={onChangeGoal}
            className="
              rounded-2xl px-3.5 py-1.5 text-[13px]
              bg-white/8 hover:bg-white/12 active:bg-white/16
              border border-white/10 text-white/85
              shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
              transition
            "
          >
            目標を変更
          </button>
        </div>

        {/* プログレス（ピル型） */}
        <div className="relative z-10 mt-3.5">
          <div
            className="
              h-3 w-full rounded-full
              bg-white/10
              shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
            "
            aria-hidden="true"
          >
            <div
              className="
                h-full rounded-full
                bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400
                shadow-[0_0_20px_rgba(16,185,129,0.45)]
              "
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[15px]">
            <span className="text-white/80">
              {fmtYen(total)} <span className="text-white/45">/ {fmtYen(goal)}</span>
            </span>
            <span className="tabular-nums text-white/70">{pctText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
