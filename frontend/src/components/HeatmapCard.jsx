import React, { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { intensityToColor } from '../utils/colors.js'

export default function HeatmapCard({ heat }) {
  const center = useMemo(() => [35.66, 139.70], [])
  if (!heat) return <div className="glass p-4">ヒートマップを読み込み中...</div>

  return (
    <div className="glass p-3">
      <div className="text-[15px] font-semibold opacity-90 mb-2">ヒートマップ（予測）</div>
      <div className="rounded-xl overflow-hidden border border-white/10">
        <MapContainer center={center} zoom={13} style={{ height: 360 }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {heat.points.map((p, i) => (
            <CircleMarker
              key={i}
              center={[p.lat, p.lng]}
              radius={6 + p.intensity * 10}
              pathOptions={{ color: intensityToColor(p.intensity), fillColor: intensityToColor(p.intensity), fillOpacity: 0.55, weight: 1 }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="mb-1">強度 {(p.intensity*100|0)}%</div>
                  <div className="font-semibold mb-1">人気店</div>
                  <ul className="list-disc pl-5">
                    {p.popular_restaurants.map((r, j) => (
                      <li key={j}>{r.name}（★{r.rating}）</li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
