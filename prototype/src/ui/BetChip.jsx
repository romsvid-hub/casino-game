import { assets } from '../assets.js'

// Chip/Bet · S in Dock/Main 937:6295: 48x36, MAX 72x36 with its amount. Selected = gold stroke + glow.
// Disabled = chip value above the balance.
export default function BetChip({ value, wide = false, selected = false, disabled = false, state, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Bet ${value}`}
      className={`chip tile-bg ui-focus ${wide ? 'chip--wide' : ''} ${className}`}
      data-forced={state ? '' : undefined}
      disabled={disabled}
      onClick={onClick}
      style={{ '--tile': `url(${assets.dock.tile.src})` }}
    >
      {value}
    </button>
  )
}
