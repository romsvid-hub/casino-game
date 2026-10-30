import { useEffect } from 'react'
import { STATES } from '../game/machine.js'

// TEMPORARY (Levels 7–8): returns to SETUP after a round ends, standing in for
// the round-end popups with NEW ROUND (Level 9). Animation beats are driven by
// the director (scene/director.js) since Level 8.
const ROUND_END = {
  [STATES.DEFEAT]: 2500,
  [STATES.CASHED_OUT]: 2500,
  [STATES.MAX_WIN]: 3000,
}

export function useBeatTimer(state, actions, enabled = true) {
  const { phase } = state
  useEffect(() => {
    const delay = ROUND_END[phase]
    if (!enabled || !delay) return
    const id = setTimeout(() => actions.newRound(), delay)
    return () => clearTimeout(id)
  }, [phase, actions, enabled])
}
