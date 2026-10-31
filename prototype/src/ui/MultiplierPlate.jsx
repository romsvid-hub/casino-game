import { formatMultiplier } from '../game/money.js'

// Plate/Multiplier 554:4220 (196x64): the next multiplier above the enemy's head,
// shown only in DECISION. Text only, as in Figma: the plate art (554:4221) stays
// hidden. Kurale 30/34 amber, centred at (98, 31.5) in a 166x49 box.
// Positioning comes from the caller (`absolute` in the HUD); defaults to relative.
export default function MultiplierPlate({ multiplier, className = 'relative', style }) {
  return (
    <div className={`h-[64px] w-[196px] ${className}`} style={{ filter: 'drop-shadow(var(--fx-plate-shadow))', ...style }} data-qa="plate-multiplier">
      <span
        className="type-number-l absolute top-[31.5px] left-[98px] w-[166px] -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap text-accent-amber"
        style={{ textShadow: 'var(--fx-text-shadow-soft)' }}
      >
        {formatMultiplier(multiplier)}
      </span>
    </div>
  )
}
