import { useEffect } from 'react'
import { config } from '../game/config.js'
import { STATES } from '../game/machine.js'

// TEMPORARY (Level 7): stands in for the animation director (Level 8) and the
// round-end popups (Level 9) so a round can be played from the dock alone.
// Each beat ends on a timer; SKIP still jumps ahead through the reducer.
const BEATS = {
  [STATES.ENTERING]: { ms: 700, action: 'enterDone' },
  [STATES.FIGHTING]: { ms: 900, action: 'animDone' },
  [STATES.RESOLVING]: { ms: 400, action: 'animDone' },
  [STATES.WIN_BANNER]: { ms: config.timings.resultBanner, action: 'animDone' },
  // Round end → back to setup until the result popups with NEW ROUND exist.
  [STATES.DEFEAT]: { ms: 2500, action: 'newRound' },
  [STATES.CASHED_OUT]: { ms: 2500, action: 'newRound' },
  [STATES.MAX_WIN]: { ms: 3000, action: 'newRound' },
}

export function useBeatTimer(state, actions, enabled = true) {
  const { phase, passed } = state
  useEffect(() => {
    const beat = BEATS[phase]
    if (!enabled || !beat) return
    const id = setTimeout(() => actions[beat.action](), beat.ms)
    return () => clearTimeout(id)
  }, [phase, passed, actions, enabled])
}
