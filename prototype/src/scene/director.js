import { useEffect, useMemo } from 'react'
import { assets } from '../assets.js'
import { config } from '../game/config.js'
import { exchangeCount, fightScript, finalPoses } from '../game/fightScript.js'
import { STATES } from '../game/machine.js'
import { ENEMY_IN_FROM, ENEMY_SPRITES, HOME, MOVE, SCENE_OF, STEP, WALK_IN_FROM } from './stage.js'

const L = assets.lottie

// Round start: the enemy appears 0.7 s after the knight starts walking in (roadmap L8).
const ENEMY_ENTER_DELAY = 700
// Boss landing (FX Lottie fx_boss_land_shake + CSS shake of the stage at 0.9 s, 0.35 s long).
export const BOSS_SHAKE = { at: 900, duration: 350 }
// The boss slides in so it lands when the landing dust hits (0.9 s).
const BOSS_SLIDE_DELAY = BOSS_SHAKE.at - MOVE.enemyIn.ms
// Win banner: the beaten enemy lies, darkens and fades (char-down), then the next one enters.
const WIN_BANNER_MS = Math.max(config.timings.resultBanner, 2000)

const cue = (key, clip, extra = {}) => ({ key, src: clip.src, loop: clip.mode === 'loop', ...extra })

// The fight script of the current fight (FIGHTING / RESOLVING / result states).
// The outcome is already rolled; the script only presents it (game/fightScript.js).
export function scriptFor(state, derived) {
  return fightScript({
    outcome: state.outcome ?? (state.phase === STATES.DEFEAT ? 'lose' : 'win'),
    exchanges: exchangeCount(state.rngState),
    defeat: derived.heroDefeat,
  })
}

// What the scene shows for a game state. Pure: the same state always gives the
// same scene, so SKIP (which jumps the reducer to the end state) simply shows
// the end poses. Returns
//   hero / enemy  { pose, x, move? }    sprite pose at a stage x (shadow centre)
//   timeline      [{ t, hero?, enemy?, flash? }]  steps played over the state
//   fx, shake, beats                    FX Lottie, boss shake, timed game events
export function sceneFor(state, derived) {
  const { phase, passed } = state
  const kind = derived.enemy
  const set = ENEMY_SPRITES[kind]
  const scene = SCENE_OF[kind]
  const base = { set, kind, scene, fx: null, shake: false, timeline: null, beats: [] }
  const idleHero = { pose: 'idle', x: HOME.hero }
  const idleEnemy = { pose: 'idle', x: HOME.enemy }

  switch (phase) {
    case STATES.SETUP:
      // Lobby 885:10856 covers the stage: no characters behind it.
      return { ...base, hero: null, enemy: null }

    case STATES.ENTERING: {
      if (passed === 0) {
        // Round start: the knight walks in from the left, then the first enemy slides in.
        const done = Math.max(MOVE.walkIn.ms, ENEMY_ENTER_DELAY + MOVE.enemyIn.ms)
        return {
          ...base,
          hero: { pose: 'walk', x: WALK_IN_FROM },
          enemy: null,
          timeline: [
            { t: 30, hero: { pose: 'walk', x: HOME.hero, move: MOVE.walkIn } },
            { t: ENEMY_ENTER_DELAY, enemy: { pose: 'idle', x: ENEMY_IN_FROM, enter: true } },
            { t: ENEMY_ENTER_DELAY + 30, enemy: { pose: 'idle', x: HOME.enemy, move: MOVE.enemyIn } },
            { t: MOVE.walkIn.ms + 30, hero: idleHero },
          ],
          beats: [{ at: done, action: 'enterDone' }],
        }
      }
      // Next gate: the winner walks back home from his step, the next enemy slides in.
      // Bosses wait for the boss intro banner (HUD, config.timings.bossIntro) and land.
      const boss = derived.isBoss
      const wait = boss ? config.timings.bossIntro : 0
      const slideAt = wait + (boss ? BOSS_SLIDE_DELAY : 150)
      return {
        ...base,
        hero: { pose: 'walk', x: HOME.hero + STEP },
        enemy: null,
        fx: boss ? cue(`boss-land-${passed}`, L.bossLandShake, { delay: wait }) : null,
        shake: boss,
        shakeAt: wait + BOSS_SHAKE.at,
        timeline: [
          { t: 30, hero: { pose: 'walk', x: HOME.hero, move: MOVE.home } },
          { t: MOVE.home.ms + 30, hero: idleHero },
          { t: slideAt, enemy: { pose: 'idle', x: ENEMY_IN_FROM, enter: true } },
          { t: slideAt + 30, enemy: { pose: 'idle', x: HOME.enemy, move: MOVE.enemyIn } },
        ],
        beats: [{ at: slideAt + 30 + MOVE.enemyIn.ms + 200, action: 'enterDone' }],
      }
    }

    case STATES.DECISION:
      return { ...base, hero: idleHero, enemy: idleEnemy }

    case STATES.FIGHTING: {
      // The exchange of blows up to the decisive impact, then RESOLVING.
      const script = scriptFor(state, derived)
      return {
        ...base,
        script,
        hero: idleHero,
        enemy: idleEnemy,
        timeline: withMoves(script.steps.filter((s) => s.t < script.impactAt)),
        beats: [{ at: script.impactAt, action: 'animDone' }],
      }
    }

    case STATES.RESOLVING: {
      // Decisive impact: the loser goes down at home, the winner turns to Victory on his step.
      const script = scriptFor(state, derived)
      const rest = script.steps.filter((s) => s.t >= script.impactAt).map((s) => ({ ...s, t: s.t - script.impactAt }))
      const first = rest[0]
      return {
        ...base,
        script,
        hero: first.hero,
        enemy: first.enemy,
        flash: first.flash,
        timeline: rest.slice(1),
        beats: [{ at: script.duration - script.impactAt, action: 'animDone' }],
      }
    }

    case STATES.WIN_BANNER:
    case STATES.MAX_WIN: {
      // Hero celebrates on his step over the fallen enemy (380:5467 / 629:6879).
      const end = finalPoses(scriptFor({ ...state, outcome: 'win' }, derived))
      return {
        ...base,
        hero: end.hero,
        enemy: end.enemy,
        beats: phase === STATES.WIN_BANNER ? [{ at: WIN_BANNER_MS, action: 'animDone' }] : [],
      }
    }

    case STATES.DEFEAT: {
      // Enemy celebrates on its step; the knight lies dead (or caged by Baba Yaga) at home.
      const end = finalPoses(scriptFor({ ...state, outcome: 'lose' }, derived))
      return { ...base, hero: end.hero, enemy: end.enemy }
    }

    case STATES.CASHED_OUT:
      // TAKE: the knight stays home in Victory, the enemy leaves.
      return { ...base, hero: { pose: 'victory', x: HOME.hero }, enemy: null }

    default:
      return { ...base, hero: idleHero, enemy: null }
  }
}

// Fight steps get their CSS move: forward steps are quick (ease-out), the way back home is softer.
function withMoves(steps) {
  return steps.map((s) => {
    const out = { ...s }
    for (const who of ['hero', 'enemy']) {
      if (!s[who]) continue
      const forward = s[who].pose === 'attack'
      out[who] = { ...s[who], move: forward ? MOVE.step : MOVE.back }
    }
    return out
  })
}

// Lottie is now FX only (characters are sprites since C+B, locations are Figma layers
// since E): the boss landing and the MAX WIN popup, loaded close to the bosses.
export const CLIP_BATCHES = {
  setup: [],
  round: [],
  boss: [L.bossLandShake, L.popupMaxWin],
}
// Start loading the boss batch this many gates before the first boss gate.
export const BOSS_PRELOAD_GATES = 3
export const FIRST_BOSS_GATE = config.enemyByGate.findIndex((kind) => kind !== 'vovkulak')

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const ANIMATED = [STATES.ENTERING, STATES.FIGHTING, STATES.RESOLVING, STATES.WIN_BANNER]

// Runs the scene: returns what to draw and fires the timed game events.
// With reduce-motion every animation state is skipped straight to its result.
export function useDirector(state, actions, derived, { reduceMotion = prefersReducedMotion(), enabled = true } = {}) {
  const scene = sceneFor(state, derived)
  const beatKey = `${state.phase}-${state.passed}-${state.outcome}`

  useEffect(() => {
    if (!enabled) return
    if (reduceMotion && ANIMATED.includes(state.phase)) {
      const id = setTimeout(() => actions.skip(), 0)
      return () => clearTimeout(id)
    }
    const ids = scene.beats.map((b) => setTimeout(() => actions[b.action](), b.at))
    return () => ids.forEach(clearTimeout)
    // beats depend only on the state that beatKey describes
  }, [beatKey, reduceMotion, enabled])

  // A new scene object only when the state changes (the timeline restarts then).
  return useMemo(() => ({ ...scene, beatKey }), [beatKey, scene.kind])
}
