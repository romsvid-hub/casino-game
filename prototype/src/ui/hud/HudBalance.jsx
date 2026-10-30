import { assets } from '../../assets.js'
import { formatMoney } from '../../game/money.js'
import Digits from '../Digits.jsx'
import { useCountUp } from '../useCountUp.js'

// HUD/Balance 302:3760: 3-slice cartouche (129 / stretch / 39, 84 high).
// The center stretches with the value; label at x136 y17, amount at x134 y31.
export default function HudBalance({ balance, className = '' }) {
  const shown = useCountUp(balance, 400)

  return (
    <div
      className={`flex h-[84px] ${className}`}
      style={{ filter: 'drop-shadow(var(--fx-balance-shadow))' }}
      aria-label={`Balance ${formatMoney(balance)}`}
    >
      <img src={assets.hud.balanceL.src} alt="" width={129} height={84} className="block h-[84px] w-[129px]" />
      <div
        className="relative h-[84px] min-w-[149px] pr-[30px] pl-[5px]"
        style={{ backgroundImage: `url(${assets.hud.balanceC.src})`, backgroundSize: '100% 100%' }}
      >
        <span className="type-label-xs absolute top-[17px] left-[7px] text-text-muted">BALANCE</span>
        <span
          className="type-number-m relative top-[31px] block text-accent-amber"
          style={{ textShadow: 'var(--fx-balance-text)' }}
        >
          <Digits text={formatMoney(shown)} />
        </span>
      </div>
      <img src={assets.hud.balanceR.src} alt="" width={39} height={84} className="block h-[84px] w-[39px]" />
    </div>
  )
}
