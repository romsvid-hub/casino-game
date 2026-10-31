import { assets } from '../assets.js'
import { formatMultiplier } from '../game/money.js'

// Plate/Multiplier 554:4220 (196x64): next multiplier above the enemy's head,
// shown only in DECISION. The plate art (frame 554:4221, hidden in the Figma
// component) is shown here so the number reads as a tag, not bare text (L12):
// skin/fill 180x49 at (8,7) = dock tile darkened 25 %, iron rails top and bottom.
// `final` (boss level): wider plate "MAX WIN ×19.00" with a gold glow and a
// short pulse when it appears. Values come from derived (game/), never computed here.
export default function MultiplierPlate({ multiplier, final = false, className = '', style }) {
  const width = final ? 300 : 196
  const inner = width - 16
  return (
    <div
      className={`relative h-[64px] ${final ? 'plate-final-in' : ''} ${className}`}
      style={{ width, filter: 'drop-shadow(var(--fx-plate-shadow))', ...style }}
      data-qa={final ? 'plate-final' : 'plate-multiplier'}
    >
      {final && <div className="plate-final-glow absolute -inset-x-[24px] -inset-y-[18px] rounded-[40px]" aria-hidden />}
      <div className="absolute top-[7px] left-[8px] h-[49px] overflow-hidden" style={{ width: inner }} aria-hidden>
        <img
          src={assets.dock.tile.src}
          alt=""
          className="absolute left-0 block max-w-none"
          style={{ top: '-90.48%', width: '100%', height: '238.1%' }}
        />
        <div className="absolute inset-0 bg-shade-25" />
      </div>
      <div className="absolute top-[2px] left-[8px] h-[6px] border border-neutral-ink bg-neutral-iron" style={{ width: inner }} aria-hidden />
      <div className="absolute top-[56px] left-[8px] h-[6px] border border-neutral-ink bg-neutral-iron" style={{ width: inner }} aria-hidden />
      <div className="absolute inset-x-[15px] top-[7px] flex h-[49px] items-center justify-center gap-[12px] whitespace-nowrap">
        {final && (
          <span className="type-title-s text-accent-amber" style={{ textShadow: 'var(--fx-text-shadow-soft), var(--fx-glow-amber)' }}>
            MAX WIN
          </span>
        )}
        <span
          className="type-number-l text-accent-amber"
          style={{ textShadow: final ? 'var(--fx-text-shadow-soft), var(--fx-glow-amber)' : 'var(--fx-text-shadow-soft)' }}
        >
          {formatMultiplier(multiplier)}
        </span>
      </div>
    </div>
  )
}
