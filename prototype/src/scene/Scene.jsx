import { useEffect, useState } from 'react'
import { assets } from '../assets.js'
import { STATES } from '../game/machine.js'
import ClipSlot from './ClipSlot.jsx'
import { BOSS_PRELOAD_GATES, BOSS_SHAKE, CLIP_BATCHES } from './director.js'
import LottieLayer, { preloadLottie } from './LottieLayer.jsx'

const FOCUS = {
  hero: assets.lottie.focusHero.src,
  enemy: assets.lottie.focusEnemy.src,
  clash: assets.lottie.focusClash.src,
}

// Boss landing shake: on at 0.9 s for 0.35 s after the boss starts entering.
export function useBossShake(state, scene) {
  const [shaking, setShaking] = useState(false)
  const active = state.phase === STATES.ENTERING && scene.shake
  useEffect(() => {
    if (!active) return
    const on = setTimeout(() => setShaking(true), BOSS_SHAKE.at)
    const off = setTimeout(() => setShaking(false), BOSS_SHAKE.at + BOSS_SHAKE.duration)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
      setShaking(false)
    }
  }, [active, state.passed])
  return shaking
}

// Battle scene, bottom to top: bg_scene → focus light → hero → enemy → FX.
// Every layer is a full 1920x1080 Lottie (files are pre-positioned).
const preload = (clips) => clips.forEach((c) => preloadLottie(c.src).catch(() => {}))

// Loads Lottie per round (L11): setup clips at once, round clips when a round
// starts, boss clips when the boss is a few gates away.
function useLazyClips(state, gateCount) {
  const inRound = state.phase !== STATES.SETUP
  const nearBoss = inRound && state.passed >= gateCount - BOSS_PRELOAD_GATES
  useEffect(() => preload(CLIP_BATCHES.setup), [])
  useEffect(() => {
    if (inRound) preload(CLIP_BATCHES.round)
  }, [inRound])
  useEffect(() => {
    if (nearBoss) preload(CLIP_BATCHES.boss)
  }, [nearBoss])
}

export default function Scene({ scene, state, gateCount }) {
  useLazyClips(state, gateCount)
  const lobby = state.phase === STATES.SETUP

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Environment: zoomed in on the totem in the lobby (587:5125), zooms out to
          the battle framing (457:7471) when a round starts. */}
      <div className={`scene-env absolute inset-0 ${lobby ? 'scene-env--lobby' : ''}`}>
        <LottieLayer src={assets.lottie.bgScene.src} loop />
        <div className="totem-light" />
        {/* Focus light: all three loop; the active one crossfades in over 350 ms. */}
        {Object.entries(FOCUS).map(([name, src]) => (
          <div
            key={name}
            className="absolute inset-0 transition-opacity duration-[350ms] ease-in-out"
            style={{ opacity: scene.focus === name ? 1 : 0 }}
          >
            <LottieLayer src={src} loop />
          </div>
        ))}
      </div>
      <ClipSlot cue={scene.hero} />
      <ClipSlot cue={scene.enemy} />
      <ClipSlot cue={scene.fx ?? null} />
    </div>
  )
}
