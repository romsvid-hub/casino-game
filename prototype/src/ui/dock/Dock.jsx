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

// Which Dock/Main variant (941:6656) each game state shows.
const VARIANT = {
  [STATES.SETUP]: 'lobby', // 937:6313
  [STATES.ENTERING]: 'fight', // 941:6589: FIGHT is SKIP, TAKE disabled
  [STATES.FIGHTING]: 'fight',
  [STATES.RESOLVING]: 'fight',
  [STATES.DECISION]: 'waiting', // 941:6512
  [STATES.WIN_BANNER]: 'result', // waiting with both CTAs disabled
  [STATES.DEFEAT]: 'result',
  [STATES.CASHED_OUT]: 'result',
  [STATES.MAX_WIN]: 'result',
}

const chipLabel = (chip) => (chip.label === 'MAX' ? `MAX ${chip.value}` : chip.label)

function LobbyContent({ state, actions, derived }) {
  return (
    <>
      {/* setup/bet 937:6288: BET column + stepper, then the chips */}
      <div className="absolute top-[48px] left-[104px] flex h-[70px] items-center gap-[12px]">
        <div className="flex items-center gap-[8px]">
          <DockSlot label="BET" value={formatMoney(state.bet)} align="right" width={104} />
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
        <div className="flex gap-[4px]">
          {derived.chips.map((chip) => (
            <BetChip
              key={chip.label}
              value={chipLabel(chip)}
              wide={chip.label === 'MAX'}
              selected={state.bet === chip.value}
              disabled={chip.disabled}
              onClick={() => actions.setBet(chip.value)}
            />
          ))}
        </div>
      </div>

      {/* CTA / Play 937:6300: 364 wide, centred on the dock, no subtitle */}
      <CtaButton
        variant="play"
        label="PLAY"
        wide
        disabled={!derived.canPlay}
        onClick={actions.play}
        className="absolute top-[24px] left-[568px]"
      />

      {/* difficulty 937:6344: segments, then CHANCE */}
      <div className="absolute top-[48px] left-[972px] flex h-[70px] w-[424px] items-center gap-[16px]">
        <div className="flex gap-[4px]">
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
        <DockSlot label="CHANCE" value={`${Math.round(derived.winChance * 100)}%`} color="leaf" width={64} weight="regular" />
      </div>
    </>
  )
}

function RoundContent({ variant, state, actions, derived }) {
  const atRisk = useCountUp(derived.atRisk, config.timings.countUp)
  const ifWon = useCountUp(derived.ifWon ?? 0, config.timings.countUp)
  const decision = variant === 'waiting'
  const hasNext = derived.nextMultiplier != null
  // Defeat and MAX WIN end the round: 0.00 / — / — (Figma result frames).
  const ended = state.phase === STATES.DEFEAT || state.phase === STATES.MAX_WIN

  return (
    <>
      {/* battle/left 941:6559 */}
      <div className="absolute top-[47px] left-[104px] flex items-center gap-[32px]">
        <DockSlot label="BET" value={formatMoney(state.bet)} align="right" />
        <DockSlot label="AT RISK" value={formatMoney(ended ? 0 : atRisk)} color="risk" align="right" />
      </div>
      {/* battle/right 941:6566 */}
      <div className="absolute top-[47px] left-[1124px] flex items-center gap-[32px]">
        <DockSlot label="NEXT" value={hasNext && !ended ? formatMultiplier(derived.nextMultiplier) : '—'} color="teal" />
        <DockSlot label="IF WON" value={hasNext && !ended ? formatMoney(ifWon) : '—'} color="amber" />
      </div>

      {/* While the fight plays, SKIP takes FIGHT's place (State=Skip 769:6112). */}
      {variant === 'fight' ? (
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
          amount={hasNext && !ended ? `risk ${formatMoney(derived.atRisk)}` : '—'}
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
        amount={ended ? formatMoney(0) : derived.atRisk > 0 ? formatMoney(derived.atRisk) : '—'}
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
export default function Dock({ state, actions, derived, keysEnabled = true, locked = false, className = '' }) {
  const variant = VARIANT[state.phase]
  useDockKeys(state, actions, derived, keysEnabled)

  return (
    // `locked`: during the intro splash the dock is not clickable (it fades in at the end).
    <div className={`absolute h-[168px] w-[1500px] ${locked ? 'pointer-events-none' : ''} ${className}`} data-variant={variant} data-dock>
      <DockSkin />
      {/* Switching variants crossfades 150 ms (each variant remounts and fades in). */}
      <div key={variant === 'lobby' ? 'lobby' : 'round'} className="dock-fade absolute inset-0">
        {variant === 'lobby' ? (
          <LobbyContent state={state} actions={actions} derived={derived} />
        ) : (
          <RoundContent variant={variant} state={state} actions={actions} derived={derived} />
        )}
      </div>
    </div>
  )
}
