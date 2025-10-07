export function intensityToColor(intensity) {
  const t = Math.min(1, Math.max(0, intensity))
  const a = { r: 0x18, g: 0xC6, b: 0x7A }   // 緑
  const b = { r: 0xF4, g: 0xC4, b: 0x30 }   // 金
  const r = Math.round(a.r + (b.r - a.r) * t)
  const g = Math.round(a.g + (b.g - a.g) * t)
  const bl = Math.round(a.b + (b.b - a.b) * t)
  return `rgb(${r}, ${g}, ${bl})`
}
