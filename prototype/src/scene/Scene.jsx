import { useEffect, useState } from 'react'
import { assets } from '../assets.js'
import { STATES } from '../game/machine.js'
import Character, { CharacterLight, DefeatRedLight, spriteUrls } from './Character.jsx'
import ClipSlot from './ClipSlot.jsx'
import { BOSS_PRELOAD_GATES, BOSS_SHAKE, CLIP_BATCHES, FIRST_BOSS_GATE } from './director.js'
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
    const at = scene.shakeAt ?? BOSS_SHAKE.at
    const on = setTimeout(() => setShaking(true), at)
    const off = setTimeout(() => setShaking(false), at + BOSS_SHAKE.duration)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
      setShaking(false)
    }
  }, [active, state.passed])
  return shaking
}

// Battle scene, bottom to top: bg_scene → focus light → hero → enemy → FX.
// Background, focus light and FX are full 1920x1080 Lottie; the characters are
// Figma sprites anchored at their shadow centre (Character.jsx, block C+B).
const preload = (clips) => clips.forEach((c) => preloadLottie(c.src).catch(() => {}))
const preloadImages = (urls) =>
  urls.forEach((u) => {
    const img = new Image()
    img.src = u
  })

// Loads Lottie per round (L11): setup clips at once, round clips when a round
// starts, boss clips when the boss is a few gates away.
function useLazyClips(state) {
  const inRound = state.phase !== STATES.SETUP
  const nearBoss = inRound && state.passed >= FIRST_BOSS_GATE - BOSS_PRELOAD_GATES
  useEffect(() => {
    preload(CLIP_BATCHES.setup)
    preloadImages([...spriteUrls('hero'), ...spriteUrls('vovkulak')])
  }, [])
  useEffect(() => {
    if (inRound) preload(CLIP_BATCHES.round)
  }, [inRound])
  useEffect(() => {
    if (!nearBoss) return
    preload(CLIP_BATCHES.boss)
    preloadImages([...spriteUrls('vovkulakBoss'), ...spriteUrls('babaYaga')])
  }, [nearBoss])
}

// Plays the scene's timeline: starts from the state's poses, then applies each
// step at its time. Restarts when the game state changes (scene.beatKey).
// A step's `flash` ('hero' | 'enemy') bumps that side's flash counter.
function useStageFrame(scene) {
  const initial = () => ({
    key: scene.beatKey,
    hero: scene.hero,
    enemy: scene.enemy,
    flash: { hero: scene.flash === 'hero' ? 1 : 0, enemy: scene.flash === 'enemy' ? 1 : 0 },
  })
  const [frame, setFrame] = useState(initial)
  // New game state: start from its poses in the same render (no one-frame lag).
  if (frame.key !== scene.beatKey) setFrame(initial())
  useEffect(() => {
    const ids = (scene.timeline ?? []).map((step) =>
      setTimeout(
        () =>
          setFrame((f) => ({
            key: f.key,
            hero: step.hero ?? f.hero,
            enemy: step.enemy ?? f.enemy,
            flash: {
              hero: f.flash.hero + (step.flash === 'hero' ? 1 : 0),
              enemy: f.flash.enemy + (step.flash === 'enemy' ? 1 : 0),
            },
          })),
        step.t,
      ),
    )
    return () => ids.forEach(clearTimeout)
    // the timeline belongs to one game state
  }, [scene.beatKey])
  return frame.key === scene.beatKey ? frame : initial()
}

export default function Scene({ scene, state }) {
  useLazyClips(state)
  const frame = useStageFrame(scene)
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
      {/* Lights behind both characters: the enemy's own light (Baba Yaga's cage), the red defeat light. */}
      {frame.enemy && <CharacterLight set={scene.set} {...frame.enemy} />}
      {state.phase === STATES.DEFEAT && frame.enemy && <DefeatRedLight x={frame.enemy.x} />}
      {frame.hero && (
        <Character set="hero" qa="char-hero" scene={scene.scene} {...frame.hero} flash={frame.flash.hero} />
      )}
      {frame.enemy && (
        <Character
          // A new enemy remounts (it fades in on its gate).
          key={`${scene.set}-${state.phase === STATES.WIN_BANNER || state.phase === STATES.MAX_WIN ? state.passed - 1 : state.passed}`}
          set={scene.set}
          qa="char-enemy"
          {...frame.enemy}
          flash={frame.flash.enemy}
        />
      )}
      <ClipSlot cue={scene.fx ?? null} />
    </div>
  )
}
