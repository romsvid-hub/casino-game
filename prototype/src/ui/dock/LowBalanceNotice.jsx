import { formatMoney } from '../../game/money.js'
import CtaButton from '../CtaButton.jsx'

// notice/low-balance from Figma 555:5220 (644x126): shown in SETUP when the
// balance is below the minimum bet; ADD resets the demo balance.
export default function LowBalanceNotice({ balance, minBet, startingBalance, onAdd, className = '' }) {
  return (
    <div
      className={`flex h-[126px] w-[644px] items-center justify-between rounded-[8px] border border-notice-border bg-notice-bg px-[20px] py-[14px] ${className}`}
      role="alert"
    >
      <div className="flex flex-col items-start gap-[2px]" style={{ textShadow: 'var(--fx-text-shadow-soft)' }}>
        <span className="type-label-s text-text-parchment">NOT ENOUGH BALANCE</span>
        <span className="type-number-xs text-text-muted">
          Balance {formatMoney(balance)} is below the minimum bet {formatMoney(minBet)}
        </span>
      </div>
      {/* CTA / Take instance scaled to 80% in Figma (400x120 → 320x96). */}
      <div className="relative h-[96px] w-[320px] shrink-0">
        <CtaButton
          variant="take"
          label="ADD"
          amount={`demo ${formatMoney(startingBalance)}`}
          onClick={onAdd}
          className="absolute top-0 left-0 w-[400px] origin-top-left scale-[0.8]"
        />
      </div>
    </div>
  )
}
