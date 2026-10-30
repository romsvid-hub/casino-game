import { useMemo, useReducer } from 'react'
import { createInitialState, EVENTS, gameReducer, selectDerived } from './machine.js'

// Returns [state, actions, derived]. Seed comes from ?seed= (see rng.js).
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState())

  const actions = useMemo(
    () => ({
      setBet: (value) => dispatch({ type: EVENTS.SET_BET, value }),
      setDifficulty: (value) => dispatch({ type: EVENTS.SET_DIFFICULTY, value }),
      play: () => dispatch({ type: EVENTS.PLAY }),
      enterDone: () => dispatch({ type: EVENTS.ENTER_DONE }),
      fight: () => dispatch({ type: EVENTS.FIGHT }),
      animDone: () => dispatch({ type: EVENTS.ANIM_DONE }),
      take: () => dispatch({ type: EVENTS.TAKE }),
      skip: () => dispatch({ type: EVENTS.SKIP }),
      newRound: () => dispatch({ type: EVENTS.NEW_ROUND }),
      menu: () => dispatch({ type: EVENTS.MENU }),
      forceNext: (value) => dispatch({ type: EVENTS.FORCE_NEXT, value }),
    }),
    [],
  )

  const derived = useMemo(() => selectDerived(state), [state])

  return [state, actions, derived]
}
