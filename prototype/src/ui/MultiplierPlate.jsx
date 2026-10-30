import { formatMultiplier } from '../game/money.js'

// Plate/Multiplier 554:4220 (196x64): next multiplier above the enemy's head.
// Shown only in DECISION (the plate art is hidden in Figma, only the text shows).
export default function MultiplierPlate({ multiplier, className = '' }) {
  return (
    <div
      className={`flex h-[64px] w-[196px] items-center justify-center ${className}`}
      style={{ filter: 'drop-shadow(var(--fx-plate-shadow))' }}
    >
      <span className="type-number-l text-accent-amber" style={{ textShadow: 'var(--fx-text-shadow-soft)' }}>
        {formatMultiplier(multiplier)}
      </span>
    </div>
  )
}
