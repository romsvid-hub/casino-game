import { assets } from '../../assets.js'
import { config } from '../../game/config.js'
import { formatMoney } from '../../game/money.js'
import Digits from '../Digits.jsx'
import Skin3Slice from '../Skin3Slice.jsx'
import SkinSide from '../SkinSide.jsx'
import { useCountUp } from '../useCountUp.js'

// Counter/Win 349:4258 (800x120 at x560 y150): WIN = AT RISK, POTENTIAL WIN = IF WON.
// Numbers count up over 400 ms (ease-out) when they change.
export default function CounterWin({ win, potentialWin, className = '', style }) {
  const shownWin = useCountUp(win, config.timings.countUp)
  const shownPotential = useCountUp(potentialWin ?? 0, config.timings.countUp)

  return (
    <div className={`relative h-[120px] w-[800px] ${className}`} style={style}>
      {/* skin is shifted 2 px left in Figma (inset 0 2px 0 -2px) */}
      <Skin3Slice
        className="absolute top-0 -left-[2px]"
        height={120}
        width={800}
        left={<SkinSide styleName="plain" side="left" size="M" />}
        center={{ src: assets.dock.tile.src, mode: 'tile' }}
        right={<SkinSide styleName="plain" side="right" size="M" />}
      />
      <span
        className="type-title-s absolute left-[101px] -translate-y-1/2 whitespace-nowrap text-text-muted"
        style={{ top: 72, textShadow: 'var(--fx-text-shadow)' }}
      >
        WIN
      </span>
      <span
        className="type-number-xl absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-amber"
        style={{ top: 69, textShadow: 'var(--fx-glow-amber), var(--fx-text-shadow)' }}
      >
        <Digits text={formatMoney(shownWin)} />
      </span>
      {potentialWin != null && (
        <div
          className="absolute right-[88px] flex w-[224px] -translate-y-1/2 items-center gap-[8px]"
          style={{ top: 69, textShadow: 'var(--fx-text-shadow)' }}
        >
          <span className="type-label-xs w-[118px] self-end whitespace-nowrap text-text-muted">POTENTIAL WIN</span>
          <span className="type-number-m w-[98px] text-right text-accent-teal">
            <Digits text={formatMoney(shownPotential)} />
          </span>
        </div>
      )}
    </div>
  )
}
