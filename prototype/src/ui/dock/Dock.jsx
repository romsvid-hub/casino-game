import { useEffect } from 'react'
import { config, DIFFICULTY_KEYS } from '../../game/config.js'
import { STATES } from '../../game/machine.js'
import { formatMoney, formatMultiplier } from '../../game/money.js'
import BetChip from '../BetChip.jsx'
import CtaButton from '../CtaButton.jsx'
import DifficultySegment from '../DifficultySegment.jsx'
import Stepper from '../Stepper.jsx'
import { useCountUp } from '../useCountUp.js'
import DockSkin from './DockSkin.jsx'
import DockSlot from './DockSlot.jsx'

// Which Dock/Decision variant (466:2088) each game state shows.
const VARIANT = {
  [STATES.SETUP]: 'setup', // 587:4973
  [STATES.ENTERING]: 'animation', // 466:2114
  [STATES.FIGHTING]: 'animation',
  [STATES.RESOLVING]: 'animation',
  [STATES.DECISION]: 'battle', // 336:3939 + Badge/Mode as in 587:5070
  [STATES.WIN_BANNER]: 'result', // 466:2139
  [STATES.DEFEAT]: 'result',
  [STATES.CASHED_OUT]: 'result',
  [STATES.MAX_WIN]: 'result',
}

export const INSUFFICIENT_BALANCE_HINT = 'Not enough balance'

function SetupContent({ state, actions, derived }) {
  const difficulty = config.difficulties[state.difficulty]
  // Below the minimum bet PLAY reads "min bet 1.00" (555:5220) and the
  // low-balance notice above the dock offers ADD.
  const playAmount = derived.canPlay
    ? `bet ${formatMoney(state.bet)} · ${difficulty.label}`
    : derived.belowMinBet
      ? `min bet ${formatMoney(derived.minBet)}`
      : INSUFFICIENT_BALANCE_HINT

  return (
    <>
      {/* setup/bet 774:7658: one row at x132 y78 */}
      <div className="absolute top-[78px] left-[132px] flex items-center gap-[4px]">
        <div className="flex items-center gap-[10px]">
          <span className="w-[28px] font-display text-[12px] tracking-[0.12em] text-text-muted">BET</span>
          <span className="font-number text-[28px] text-text-parchment" style={{ textShadow: 'var(--fx-text-shadow)' }}>
            {formatMoney(state.bet)}
          </span>
          {/* Stepper instance is scaled to 80% in the dock (25.6x38.4). */}
          <div className="h-[38.4px] w-[25.6px]">
            <Stepper
              className="origin-top-left scale-[0.8]"
              onUp={() => actions.setBet(derived.betUp)}
              onDown={() => actions.setBet(derived.betDown)}
              upDisabled={derived.betUp == null}
              downDisabled={derived.betDown == null}
            />
          </div>
        </div>
        <div className="flex gap-[5px]">
          {derived.chips.map((chip) => (
            <BetChip
              key={chip.label}
              value={chip.label}
              selected={state.bet === chip.value}
              disabled={chip.disabled}
              onClick={() => actions.setBet(chip.value)}
            />
          ))}
        </div>
      </div>

      <CtaButton
        variant="play"
        label="PLAY"
        amount={playAmount}
        disabled={!derived.canPlay}
        onClick={actions.play}
        className="absolute top-[24px] left-[596px]"
      />

      {/* setup/difficulty 774:7677 + 774:7680 */}
      <div className="absolute top-[87px] left-[926px] flex w-[161px] items-center justify-between whitespace-nowrap">
        <span className="font-display text-[12px] tracking-[0.12em] text-text-muted">DIFFICULTY</span>
        <span className="font-number text-[14px] text-text-parchment">win ~{Math.round(derived.winChance * 100)}%</span>
      </div>
      <div className="absolute top-[75px] left-[1103px] flex gap-[6px]">
        {DIFFICULTY_KEYS.map((key) => (
          <DifficultySegment
            key={key}
            level={key}
            pips={false}
            selected={state.difficulty === key}
            onClick={() => actions.setDifficulty(key)}
          />
        ))}
      </div>
    </>
  )
}

function RoundContent({ variant, state, actions, derived }) {
  const atRisk = useCountUp(derived.atRisk, config.timings.countUp)
  const ifWon = useCountUp(derived.ifWon ?? 0, config.timings.countUp)
  const decision = variant === 'battle'
  const hasNext = derived.nextMultiplier != null

  return (
    <>
      <DockSlot label="BET" value={formatMoney(state.bet)} color="parchment" className="left-[124px]" />
      <DockSlot label="AT RISK" value={formatMoney(atRisk)} color="blood" className="left-[278px]" />
      <DockSlot
        label="NEXT"
        value={hasNext ? formatMultiplier(derived.nextMultiplier) : '—'}
        color="teal"
        className="right-[289px]"
      />
      <DockSlot label="IF WON" value={hasNext ? formatMoney(ifWon) : '—'} color="amber" className="right-[121px]" />

      {/* While the fight plays, SKIP takes FIGHT's place (State=Skip 769:6112). */}
      {variant === 'animation' ? (
        <CtaButton
          variant="skip"
          label="SKIP"
          aria-label="Skip animation"
          onClick={actions.skip}
          className="absolute top-[24px] left-[434px]"
        />
      ) : (
        <CtaButton
          variant="fight"
          label="FIGHT"
          amount={hasNext ? `risk ${formatMoney(derived.atRisk)}` : '—'}
          disabled={!decision || !derived.canFight}
          // Glow when FIGHT is the only move (before the first win, TAKE is locked) and on boss gates (6, 7).
          highlight={decision && (!derived.canTake || derived.isBoss)}
          onClick={actions.fight}
          className="absolute top-[24px] left-[434px]"
        />
      )}
      <CtaButton
        variant="take"
        label="TAKE"
        amount={state.phase === STATES.MAX_WIN ? formatMoney(0) : derived.atRisk > 0 ? formatMoney(derived.atRisk) : '—'}
        disabled={!decision || !derived.canTake}
        onClick={actions.take}
        className="absolute top-[24px] left-[758px]"
      />
    </>
  )
}

// Keyboard: Space / Enter = Fight (Play in setup), T = Take, S = Skip.
// Ignored while a button has focus, so its own Enter / Space still work normally.
function useDockKeys(state, actions, derived, enabled) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target instanceof Element && e.target.closest('button, input, select, textarea, a')) return
      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'enter') {
        if (state.phase === STATES.SETUP && derived.canPlay) actions.play()
        else if (derived.canFight) actions.fight()
        else return
        e.preventDefault()
      } else if (key === 't' && derived.canTake) actions.take()
      else if (key === 's' && derived.canSkip) actions.skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.phase, actions, derived, enabled])
}

// Bottom dock (1500x168), driven by the game state. Position comes from the screen.
export default function Dock({ state, actions, derived, keysEnabled = true, className = '' }) {
  const variant = VARIANT[state.phase]
  useDockKeys(state, actions, derived, keysEnabled)

  return (
    <div className={`absolute h-[168px] w-[1500px] ${className}`} data-variant={variant}>
      <DockSkin />
      {/* Switching variants crossfades 150 ms (each variant remounts and fades in). */}
      <div key={variant === 'setup' ? 'setup' : 'round'} className="dock-fade absolute inset-0">
        {variant === 'setup' ? (
          <SetupContent state={state} actions={actions} derived={derived} />
        ) : (
          <RoundContent variant={variant} state={state} actions={actions} derived={derived} />
        )}
      </div>
    </div>
  )
}
