import React from 'react'

export default function TabBar({ active="home" }) {
  const Item = ({id,label}) => (
    <button className={`flex-1 py-[10px] text-[11px] ${active===id?'text-white':'text-gray-300/70'}`}>
      {label}
    </button>
  )
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-[#0E1013]/90 backdrop-blur px-3">
      <div className="max-w-[420px] mx-auto flex">
        <Item id="home" label="ホーム" />
        <Item id="route" label="ルート" />
        <Item id="heat" label="ヒート" />
        <Item id="profile" label="プロフ" />
      </div>
    </div>
  )
}
