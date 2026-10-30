import { assets } from '../assets.js'

// Chip/Bet · S 585:4702 (46x26). Selected = gold stroke + glow.
// Disabled = chip value above the balance.
export default function BetChip({ value, selected = false, disabled = false, state, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Bet ${value}`}
      className={`chip tile-bg ui-focus ${className}`}
      data-forced={state ? '' : undefined}
      disabled={disabled}
      onClick={onClick}
      style={{ '--tile': `url(${assets.dock.tile.src})` }}
    >
      {value}
    </button>
  )
}
