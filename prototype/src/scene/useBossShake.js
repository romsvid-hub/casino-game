import { useEffect, useState } from 'react'
import { STATES } from '../game/machine.js'
import { BOSS_SHAKE } from './director.js'

// Boss landing shake: on at 0.9 s for 0.35 s after the boss starts entering.
export function useBossShake(state, scene) {
  const [shaking, setShaking] = useState(false)
  const active = state.phase === STATES.ENTERING && scene.shake
  const at = scene.shakeAt ?? BOSS_SHAKE.at
  useEffect(() => {
    if (!active) return
    const on = setTimeout(() => setShaking(true), at)
    const off = setTimeout(() => setShaking(false), at + BOSS_SHAKE.duration)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
      setShaking(false)
    }
  }, [active, state.passed, at])
  return shaking
}
