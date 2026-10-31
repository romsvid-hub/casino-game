import { useRef } from 'react'
import { assets } from '../../assets.js'
import { config } from '../../game/config.js'
import { formatMoney } from '../../game/money.js'
import CtaButton from '../CtaButton.jsx'
import Toggle from '../Toggle.jsx'
import ModalPanel from './ModalPanel.jsx'

// Settings row (555:5166): UI/Title S title + UI/Number XS hint, control on the right.
function Row({ title, hint, children }) {
  return (
    <div className="flex w-full items-center justify-between gap-6">
      <div className="flex flex-col items-start gap-[2px]" style={{ textShadow: 'var(--fx-text-shadow-soft)' }}>
        <span className="type-title-s text-text-parchment">{title}</span>
        <span className="type-number-xs text-text-muted">{hint}</span>
      </div>
      {children}
    </div>
  )
}

// Small chip-style action button in the settings rows (Chip/Bet look).
function RowButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="chip tile-bg ui-focus h-[44px] w-[120px] font-display text-[14px] tracking-[0.08em]"
      style={{ '--tile': `url(${assets.dock.tile.src})` }}
    >
      {children}
    </button>
  )
}

// Menu (from the Menu medallion / MENU on round-end popups). Visual reference:
// Settings 555:5065 and Toggle 554:4742. Only settings that exist in this
// prototype are shown (no sound, music, language or session reminder).
export default function MenuModal({ skipAnimations, onSkipAnimations, onRules, onResetBalance, onClose }) {
  const closeRef = useRef(null)
  return (
    <ModalPanel title="MENU" x={580} y={186} width={760} initialFocusRef={closeRef} onClose={onClose}>
      <div className="flex w-full flex-col gap-[20px]">
        <Row title="SKIP ANIMATIONS" hint="Jump straight to the result of every fight">
          <Toggle checked={skipAnimations} onChange={onSkipAnimations} label="Skip animations" />
        </Row>
        <Row title="RULES" hint="How to play this game">
          <RowButton onClick={onRules}>OPEN</RowButton>
        </Row>
        <div className="h-px w-full bg-neutral-iron" />
        <Row title="RESET DEMO BALANCE" hint={`Set the balance back to ${formatMoney(config.startingBalance)}`}>
          <RowButton onClick={onResetBalance}>RESET</RowButton>
        </Row>
      </div>
      <div className="flex w-full justify-center pt-[8px]">
        <CtaButton ref={closeRef} variant="take" label="CLOSE" onClick={onClose} className="w-[420px]" />
      </div>
    </ModalPanel>
  )
}
