import { STATES } from '../../game/machine.js'
import MultiplierPlate from '../MultiplierPlate.jsx'
import CounterWin from './CounterWin.jsx'
import HudBalance from './HudBalance.jsx'
import HudMedallion from './HudMedallion.jsx'
import ProgressPath from './ProgressPath.jsx'

// Counter/Win is shown while a round is being played. During the win banner it
// fades out (the result banner takes its place, Level 9) but stays mounted so it
// can count up to the new value when it returns.
const COUNTER_STATES = [STATES.ENTERING, STATES.DECISION, STATES.FIGHTING, STATES.RESOLVING]
const COUNTER_MOUNTED = [...COUNTER_STATES, STATES.WIN_BANNER]

// HUD layer on the 1920x1080 stage. Positions from Figma screens
// 587:5125 (setup), 472:7862…473:1307 (levels 1–5), 473:1397 (boss).
export default function Hud({ state, derived, onRules, onMenu }) {
  const { phase } = state
  const inSetup = phase === STATES.SETUP

  return (
    <div className="pointer-events-none absolute inset-0">
      <HudBalance balance={state.balance} className="pointer-events-auto absolute top-[24px] left-[40px]" />

      {/* Setup screen 587:5125: centred title (691:12273), subtitle and responsible-gaming footer. */}
      {inSetup && (
        <>
          <p
            className="type-display-xl absolute top-[193px] left-[568px] m-0 w-[840px] text-center text-accent-amber"
            style={{ textShadow: 'var(--fx-text-shadow-soft), var(--fx-logo-glow)' }}
          >
            SLAVIC FOREST
          </p>
          <p
            className="type-number-s absolute top-[285px] left-[568px] m-0 w-[840px] text-center text-text-muted"
            style={{ textShadow: 'var(--fx-text-shadow-soft)' }}
          >
            A cash-out battle in the Slavic forest
          </p>
          <p
            className="type-label-xs absolute top-[1058px] left-[560px] m-0 w-[800px] text-center whitespace-pre text-text-muted"
            style={{ textShadow: 'var(--fx-text-shadow-soft)' }}
          >
            {'18+  ·  Play responsibly  ·  Demo balance'}
          </p>
        </>
      )}

      {/* Medallions appear only on the setup screen in Figma; Sound is omitted (no audio). */}
      {inSetup && (
        <>
          <HudMedallion icon="rules" onClick={onRules} className="pointer-events-auto absolute top-[28px] left-[1728px]" />
          <HudMedallion icon="menu" onClick={onMenu} className="pointer-events-auto absolute top-[28px] left-[1810px]" />
        </>
      )}

      {!inSetup && <ProgressPath gates={derived.gates.map((g) => g.multiplier)} passed={derived.level} className="absolute top-[24px] left-[560px]" />}

      {/* Battle screens show WIN only (POTENTIAL WIN is hidden there; IF WON lives in the dock). */}
      {COUNTER_MOUNTED.includes(phase) && (
        <CounterWin
          win={derived.counterWin}
          className="absolute top-[150px] left-[560px] transition-opacity duration-150"
          style={{ opacity: COUNTER_STATES.includes(phase) ? 1 : 0 }}
        />
      )}

      {/* Plate/Multiplier: Decision state only (Figma note on 554:4220); higher above the boss. */}
      {phase === STATES.DECISION && derived.nextMultiplier != null && (
        <MultiplierPlate
          multiplier={derived.nextMultiplier}
          className="absolute left-[1217px]"
          style={{ top: derived.isBoss ? 278 : 333 }}
        />
      )}
    </div>
  )
}
