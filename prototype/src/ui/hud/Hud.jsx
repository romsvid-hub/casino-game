import { useEffect, useState } from 'react'
import { config } from '../../game/config.js'
import { STATES } from '../../game/machine.js'
import BossIntroBanner from '../results/BossIntroBanner.jsx'
import { PLATE_POS } from '../../scene/stage.js'
import MultiplierPlate from '../MultiplierPlate.jsx'
import CounterWin from './CounterWin.jsx'
import HudBalance from './HudBalance.jsx'
import ProgressPath from './ProgressPath.jsx'

// Counter/Win is shown while a round is being played. During the win banner it
// fades out (the result banner takes its place, Level 9) but stays mounted so it
// can count up to the new value when it returns.
const COUNTER_STATES = [STATES.ENTERING, STATES.DECISION, STATES.FIGHTING, STATES.RESOLVING]
const COUNTER_MOUNTED = [...COUNTER_STATES, STATES.WIN_BANNER]

// True for the first `bossIntro` ms of a boss entrance (gate 6 vovkulak boss and
// gate 7 Baba Yaga; the director delays the boss by the same time). SKIP leaves
// ENTERING, which ends it.
function useBossIntro(phase, isBoss, passed) {
  const active = phase === STATES.ENTERING && isBoss
  const [shown, setShown] = useState(active)
  useEffect(() => {
    setShown(active)
    if (!active) return
    const id = setTimeout(() => setShown(false), config.timings.bossIntro)
    return () => clearTimeout(id)
  }, [active, passed])
  return active && shown
}

// HUD layer on the 1920x1080 stage. Positions from Figma screens
// 587:5125 (setup), 472:7862…473:1307 (levels 1–5), 473:1397 (boss).
export default function Hud({ state, derived }) {
  const { phase } = state
  const inSetup = phase === STATES.SETUP
  const bossIntro = useBossIntro(phase, derived.isBoss, state.passed)

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* HUD/Balance 980:9470: in the lobby too since 13.11 (same component, same place). */}
      <HudBalance balance={state.balance} className="pointer-events-auto absolute top-[24px] left-[40px]" />

      {!inSetup && <ProgressPath path={derived.path} className="absolute top-[24px] left-[560px]" />}

      {/* Battle screens show WIN only (POTENTIAL WIN is hidden there; IF WON lives in the dock). */}
      {COUNTER_MOUNTED.includes(phase) && (
        <CounterWin
          win={derived.counterWin}
          className="absolute top-[150px] left-[560px] transition-opacity duration-150"
          style={{ opacity: COUNTER_STATES.includes(phase) && !bossIntro ? 1 : 0 }}
        />
      )}
      {bossIntro && (
        <BossIntroBanner
          final={derived.isFinal}
          multiplier={derived.isFinal ? derived.finalMultiplier : derived.nextMultiplier}
          className="absolute top-[150px] left-[560px]"
        />
      )}

      {/* Plate/Multiplier 554:4220: Decision state only, text only, over the head of the
          current enemy (position per enemy from the Figma reference frames). */}
      {phase === STATES.DECISION && derived.nextMultiplier != null && (
        <MultiplierPlate
          multiplier={derived.nextMultiplier}
          className="absolute"
          style={{ left: PLATE_POS[derived.enemy].x, top: PLATE_POS[derived.enemy].y }}
        />
      )}
    </div>
  )
}
