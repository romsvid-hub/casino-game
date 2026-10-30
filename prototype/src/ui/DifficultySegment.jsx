import { assets } from '../assets.js'

const LABELS = { easy: 'EASY', medium: 'MEDIUM', high: 'HIGH' }

// Segment/Difficulty 585:4757 (86x44). Title takes the level colour only when
// selected; the pips always show the level (grey when disabled).
export default function DifficultySegment({ level = 'easy', selected = false, disabled = false, state, onClick, className = '' }) {
  const pips = disabled ? assets.vectors.pips.disabled : assets.vectors.pips[level]
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`segment segment--${level} tile-bg ui-focus ${className}`}
      data-forced={state ? '' : undefined}
      disabled={disabled}
      onClick={onClick}
      style={{ '--tile': `url(${assets.dock.tile.src})` }}
    >
      <img src={pips.src} alt="" width={32} height={8} className="block" />
      <span className="segment__label">{LABELS[level]}</span>
    </button>
  )
}
