import { config } from '../../game/config.js'
import { formatMoney } from '../../game/money.js'
import Digits from '../Digits.jsx'
import { useCountUp } from '../useCountUp.js'

// Counter/Win 349:4258 (800x120 at x560 y150), no skin since 05.11: the numbers sit on
// the scene. WIN = AT RISK, counting up over 400 ms (ease-out) when it changes.
export default function CounterWin({ win, className = 'relative', style }) {
  const shownWin = useCountUp(win, config.timings.countUp)

  return (
    <div className={`h-[120px] w-[800px] ${className}`} style={{ textShadow: 'var(--fx-counter-shadow)', ...style }}>
      <span className="type-title-s absolute top-[32px] left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-text-muted">
        WIN
      </span>
      <span className="type-number-xl absolute top-[69px] left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-amber">
        <Digits text={formatMoney(shownWin)} data-qa="counter-win" />
      </span>
    </div>
  )
}
