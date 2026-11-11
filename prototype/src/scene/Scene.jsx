import { useEffect, useState } from 'react'
import { STATES } from '../game/machine.js'
import Character, { CageLightRelease, CharacterLight, DefeatRedLight, spriteUrls } from './Character.jsx'
import ClipSlot from './ClipSlot.jsx'
import { BOSS_PRELOAD_GATES, BOSS_SHAKE, CLIP_BATCHES, FIRST_BOSS_GATE } from './director.js'
import Environment, { envImageUrls, HeroLight } from './Environment.jsx'
import { preloadLottie } from './LottieLayer.jsx'

const VICTORY_PHASES = [STATES.WIN_BANNER, STATES.MAX_WIN, STATES.CASHED_OUT]

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

// Battle scene, bottom to top: location layers with their lights (Environment.jsx,
// from Figma) → hero → enemy → FX. The characters are Figma sprites anchored at
// their shadow centre (Character.jsx, block C+B).
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
    preloadImages([...spriteUrls('hero'), ...spriteUrls('vovkulak'), ...envImageUrls('forest')])
  }, [])
  useEffect(() => {
    if (inRound) preload(CLIP_BATCHES.round)
  }, [inRound])
  useEffect(() => {
    if (!nearBoss) return
    preload(CLIP_BATCHES.boss)
    preloadImages([...spriteUrls('vovkulakBoss'), ...spriteUrls('babaYaga'), ...envImageUrls('field'), ...envImageUrls('hut')])
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
  // On a win the game state has already moved to the next gate: stay on the beaten one.
  const onBeatenGate = state.phase === STATES.WIN_BANNER || state.phase === STATES.MAX_WIN
  const gate = onBeatenGate ? state.passed - 1 : state.passed
  const defeat = state.phase === STATES.DEFEAT

  return (
    <div className="pointer-events-none absolute inset-0">
      <Environment scene={scene.scene} gate={gate} focus={Boolean(frame.enemy)} />
      {/* Baba Yaga's cage light sits behind both characters. */}
      {frame.enemy && !defeat && (
        <CharacterLight set={scene.set} {...frame.enemy} released={state.phase === STATES.MAX_WIN} />
      )}
      {frame.hero && VICTORY_PHASES.includes(state.phase) && <HeroLight x={frame.hero.x} />}
      {frame.hero && (
        <Character set="hero" qa="char-hero" {...frame.hero} flash={frame.flash.hero} />
      )}
      {/* FX / Defeat darken 460:2016 covers the fallen knight, then the enemy's lights.
          Baba Yaga's defeat frame 843:6912 has no darken: the caged knight stays readable. */}
      {defeat && scene.set !== 'babaYaga' && <div data-qa="defeat-darken" className="env-defeat-darken absolute inset-0" />}
      {defeat && frame.enemy && <CharacterLight set={scene.set} {...frame.enemy} />}
      {defeat && frame.enemy && <DefeatRedLight x={frame.enemy.x} />}
      {state.phase === STATES.MAX_WIN && scene.set === 'babaYaga' && frame.enemy && <CageLightRelease x={frame.enemy.x} />}
      {frame.enemy && (
        <Character
          // A new enemy remounts (it fades in on its gate).
          key={`${scene.set}-${onBeatenGate ? state.passed - 1 : state.passed}`}
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
