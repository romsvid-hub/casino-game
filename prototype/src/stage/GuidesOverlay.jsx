import { useEffect, useState } from 'react'

// Layout zones from Figma frame 629:6879, group "_Guides (hide before export)" 629:6941.
const ZONES = [
  { name: 'Safe area 40/24', x: 40, y: 24, w: 1840, h: 1032, color: '#ffffff' },
  { name: 'HUD 24–137', x: 40, y: 24, w: 1840, h: 113, color: '#38bdf8' },
  { name: 'Win counter 150–270', x: 560, y: 150, w: 800, h: 120, color: '#facc15' },
  { name: 'Battlefield 280–880', x: 40, y: 280, w: 1840, h: 600, color: '#4ade80' },
  { name: 'Multiplier tag', x: 1240, y: 320, w: 200, h: 64, color: '#f472b6' },
  { name: 'Dock 888–1056 (1500)', x: 210, y: 888, w: 1500, h: 168, color: '#fb923c' },
]

const LINES = [
  { name: 'Ground line y=730', x: 40, y: 729, w: 1840, h: 2, color: '#a3e635' },
  { name: 'Hero center x=560', x: 559, y: 280, w: 2, h: 460, color: '#22d3ee' },
  { name: 'Enemy center x=1340', x: 1339, y: 280, w: 2, h: 460, color: '#f87171' },
]

// Debug overlay with the Figma layout zones, toggled with the "G" key.
export default function GuidesOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'g' || e.key === 'G') setVisible((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50 font-mono text-[16px]">
      {ZONES.map((z) => (
        <div
          key={z.name}
          className="absolute"
          style={{
            left: z.x,
            top: z.y,
            width: z.w,
            height: z.h,
            border: `2px dashed ${z.color}`,
            background: `${z.color}14`,
          }}
        >
          <span className="absolute top-1 left-2" style={{ color: z.color }}>
            {z.name}
          </span>
        </div>
      ))}
      {LINES.map((l) => (
        <div
          key={l.name}
          className="absolute"
          style={{ left: l.x, top: l.y, width: l.w, height: l.h, background: l.color }}
        >
          <span className="absolute -top-6 left-2 whitespace-nowrap" style={{ color: l.color }}>
            {l.name}
          </span>
        </div>
      ))}
    </div>
  )
}
