import { assets } from '../assets.js'

const LEVELS = {
  easy: { label: 'EASY', color: 'text-accent-teal' },
  medium: { label: 'MEDIUM', color: 'text-accent-amber' },
  high: { label: 'HIGH', color: 'text-accent-blood' },
}

// Badge/Mode 585:4776: read-only difficulty tag shown once the round starts.
export default function ModeBadge({ level = 'medium', className = '' }) {
  const { label, color } = LEVELS[level]
  return (
    <span className={`badge ${color} ${className}`}>
      <img src={assets.vectors.badgePips[level].src} alt="" width={33} height={9} className="block" />
      {label}
    </span>
  )
}
