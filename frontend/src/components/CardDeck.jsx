import React, { useRef, useState } from 'react'

export default function CardDeck({ children }) {
  const items = React.Children.toArray(children)
  const [idx, setIdx] = useState(0)
  const startX = useRef(null)
  const prev = () => setIdx(i => (i - 1 + items.length) % items.length)
  const next = () => setIdx(i => (i + 1) % items.length)

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (dx > 50) prev()
    if (dx < -50) next()
    startX.current = null
  }

  return (
    <div className="card-deck select-none relative">
      {/* 操作用ボタン */}
      <div className="flex justify-between items-center mb-2">
        <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/15" onClick={prev}>←</button>
        <div className="text-sm text-gray-300">カード {idx+1}/{items.length}</div>
        <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/15" onClick={next}>→</button>
      </div>

      <div className="relative h-[520px]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {items.map((child, i) => {
          const offset = (i - idx + items.length) % items.length
          const visible = i === idx
          const style = {
            transform: `translateX(${offset===0?0:offset>0?24:-24}px) scale(${visible?1:0.96})`,
            opacity: visible ? 1 : 0.0,
            zIndex: items.length - offset,
          }
        return (
          <div key={i} className="card absolute inset-0" style={style}>
            {child}
          </div>
        )})}
      </div>
    </div>
  )
}
