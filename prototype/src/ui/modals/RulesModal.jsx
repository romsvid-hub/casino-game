import { useRef } from 'react'
import { config } from '../../game/config.js'
import { formatMoney, formatMultiplier } from '../../game/money.js'
import CtaButton from '../CtaButton.jsx'
import ModalPanel from './ModalPanel.jsx'

// DRAFT - pending client: rules text adapted from the old prototype to our
// rules (see docs/open-questions.md). Layout from "How to play" 555:4998.
const RULES = [
  'Your knight fights enemies one by one. Each win moves you to the next gate and raises the multiplier.',
  'FIGHT: take the next fight. If you lose, you lose your bet.',
  'TAKE: end the round and collect AT RISK (bet × current multiplier).',
  'NEXT shows the next multiplier, IF WON what you get if you win the next fight.',
  'Difficulty changes the win chance and how fast the multiplier grows.',
  'The last gate is the boss. Beat it to get the MAX WIN; the round ends automatically.',
]

function Fact({ label, value }) {
  return (
    <div className="flex flex-col items-start gap-[4px]" style={{ textShadow: 'var(--fx-text-shadow-soft)' }}>
      <span className="type-label-xs text-text-muted">{label}</span>
      <span className="type-number-m text-text-parchment">{value}</span>
    </div>
  )
}

export default function RulesModal({ difficulty, onClose }) {
  const gotItRef = useRef(null)
  const d = config.difficulties[difficulty]
  const maxMultiplier = d.gates[d.gates.length - 1]

  return (
    <ModalPanel title="HOW TO PLAY" x={520} y={140} width={880} initialFocusRef={gotItRef} onClose={onClose}>
      <ol className="m-0 flex w-full list-none flex-col gap-[20px] p-0" style={{ textShadow: 'var(--fx-text-shadow-soft)' }}>
        {RULES.map((text, i) => (
          <li key={i} className="flex w-full items-start gap-[20px]">
            <span className="type-number-m w-[32px] shrink-0 text-center text-accent-amber">{i + 1}</span>
            <span className="type-number-s min-w-0 flex-1 pt-[3px] text-text-parchment">{text}</span>
          </li>
        ))}
      </ol>
      <div className="h-px w-full bg-neutral-iron" />
      <div className="flex w-full items-center justify-between">
        <Fact label={`WIN CHANCE · ${d.label.toUpperCase()}`} value={`${Math.round(d.winChance * 100)}%`} />
        <Fact label="BET" value={`${formatMoney(config.minBet)} – ${formatMoney(config.maxBet)}`} />
        <Fact label="MAX MULTIPLIER" value={formatMultiplier(maxMultiplier)} />
      </div>
      <p className="type-label-xs m-0 w-full text-center whitespace-pre text-text-muted" style={{ textShadow: 'var(--fx-text-shadow-soft)' }}>
        {'18+  ·  Set your limits before you play  ·  Demo balance has no cash value'}
      </p>
      <div className="flex w-full justify-center">
        <CtaButton ref={gotItRef} variant="take" label="GOT IT" onClick={onClose} className="w-[420px]" />
      </div>
    </ModalPanel>
  )
}
