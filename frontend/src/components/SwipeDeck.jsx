import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * SwipeDeck
 * 子要素を横スワイプ／ドラッグで切り替える極小デッキ。
 *
 * 使い方:
 *   <SwipeDeck initialIndex={0} onIndexChange={setIdx}>
 *     <section>カード1</section>
 *     <section>カード2</section>
 *     <section>カード3</section>
 *   </SwipeDeck>
 */
export default function SwipeDeck({
  children,
  initialIndex = 0,
  onIndexChange,
  className = "",
  height = "auto",
}) {
  const slides = useMemo(() => React.Children.toArray(children), [children]);
  const [index, setIndex] = useState(() => {
    const i = Number(initialIndex);
    return Number.isFinite(i) ? Math.max(0, Math.min(i, slides.length - 1)) : 0;
  });
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const containerRef = useRef(null);

  const setIndexSafe = useCallback(
    (next) => {
      const clamped = Math.max(0, Math.min(next, slides.length - 1));
      setIndex(clamped);
      onIndexChange && onIndexChange(clamped);
    },
    [slides.length, onIndexChange]
  );

  // --- Pointer handlers ---
  const onPointerDown = (e) => {
    if (!containerRef.current) return;
    containerRef.current.setPointerCapture?.(e.pointerId);
    startXRef.current = e.clientX;
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startXRef.current;
    setDragX(dx);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    const threshold = (containerRef.current?.clientWidth || 1) * 0.2; // 20%
    const dx = dragX;
    setDragging(false);
    setDragX(0);
    if (dx <= -threshold) setIndexSafe(index + 1);
    else if (dx >= threshold) setIndexSafe(index - 1);
  };

  // キーボード左右矢印で移動
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      setIndexSafe(index + 1);
    } else if (e.key === "ArrowLeft") {
      setIndexSafe(index - 1);
    }
  };

  useEffect(() => {
    // ウィンドウリサイズ時のドラッグ値リセット
    const h = () => setDragX(0);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // トラックの translateX を計算
  const trackStyle = (() => {
    const w = containerRef.current?.clientWidth || 1;
    const dxPercent = (dragX / w) * 100;
    const base = -index * 100;
    const tx = dragging ? base + dxPercent : base;
    return {
      transform: `translate3d(${tx}%, 0, 0)`,
      transition: dragging ? "none" : "transform 300ms ease",
    };
  })();

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden select-none ${className}`}
      style={{ height }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* トラック */}
      <div className="flex w-full" style={trackStyle}>
        {slides.map((node, i) => (
          <div key={i} className="shrink-0 grow-0 basis-full px-2">
            <div className="h-full">{node}</div>
          </div>
        ))}
      </div>

      {/* インジケータ */}
      <div className="flex justify-center gap-2 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndexSafe(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white/80" : "w-2 bg-white/30"}`}
          />
        ))}
      </div>

      {/* 矢印（小） */}
      <div className="pointer-events-none">
        <button
          aria-label="Prev"
          onClick={() => setIndexSafe(index - 1)}
          className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-black/40 border border-white/10 hover:bg-black/60"
        >
          ‹
        </button>
        <button
          aria-label="Next"
          onClick={() => setIndexSafe(index + 1)}
          className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full bg-black/40 border border-white/10 hover:bg-black/60"
        >
          ›
        </button>
      </div>
    </div>
  );
}
