import { useEffect, useMemo } from 'react'
import { assets } from '../assets.js'
import { config } from '../game/config.js'
import { STATES } from '../game/machine.js'

const L = assets.lottie
const ms = (clip) => Math.round(clip.duration * 1000)

const HERO = {
  enter: L.heroEnter,
  idle: L.heroIdle,
  attack: L.heroAttack,
  dead: L.heroDead,
  victory: L.heroVictory,
}
const ENEMY = {
  enter: L.enemyEnter,
  idle: L.enemyIdle,
  attack: L.enemyAttack,
  dead: L.enemyDead,
  victory: L.enemyVictory,
  impact: 270, // hit lands ~0.27 s into the attack (docs/lottie.md)
}
const BOSS = {
  enter: L.bossEnter,
  idle: L.bossIdle,
  attack: L.bossAttack,
  dead: L.bossDead,
  victory: L.bossVictory,
  impact: 380,
}

// Round start: the enemy enters 0.7 s after the hero (roadmap L8).
const ENEMY_ENTER_DELAY = 700
// Boss landing: CSS shake of the stage at 0.9 s, 0.35 s long (docs/lottie.md).
export const BOSS_SHAKE = { at: 900, duration: 350 }

const cue = (key, clip, extra = {}) => ({ key, src: clip.src, loop: clip.mode === 'loop', ...extra })

// What the scene shows for a game state. Pure: the same state always gives the
// same scene, so SKIP (which jumps the reducer to the end state) simply shows
// the end poses. Returns cues per slot, the focus light, and timed game events
// (`beats`, ms after the state starts).
export function sceneFor(state, derived) {
  const { phase, passed, outcome } = state
  const E = derived.isBoss && phase !== STATES.WIN_BANNER && phase !== STATES.MAX_WIN ? BOSS : ENEMY
  const heroIdle = cue('hero-idle', HERO.idle)
  const enemyIdle = cue(`enemy-idle-${passed}`, E.idle)
  const fight = `fight-${passed}`

  switch (phase) {
    case STATES.SETUP:
      return { hero: heroIdle, enemy: null, focus: 'hero', beats: [] }

    case STATES.ENTERING: {
      const enemyEnter = cue(`enemy-enter-${passed}`, E.enter, { then: enemyIdle })
      if (passed === 0) {
        // Round start: hero walks in, then the first enemy jumps in.
        const enemy = { ...enemyEnter, delay: ENEMY_ENTER_DELAY }
        const done = Math.max(ms(HERO.enter), ENEMY_ENTER_DELAY + ms(E.enter))
        return {
          hero: cue(`hero-enter-${state.seed}-${state.rngState}`, HERO.enter, { then: heroIdle }),
          enemy,
          focus: 'hero',
          beats: [{ at: done, action: 'enterDone' }],
        }
      }
      const boss = E === BOSS
      return {
        hero: heroIdle,
        enemy: enemyEnter,
        fx: boss ? cue(`boss-land-${passed}`, L.bossLandShake) : null,
        shake: boss,
        focus: 'enemy',
        beats: [{ at: ms(E.enter), action: 'enterDone' }],
      }
    }

    case STATES.DECISION:
      return { hero: heroIdle, enemy: enemyIdle, focus: 'hero', beats: [] }

    case STATES.FIGHTING:
      // The attacker swings; at the impact frame the game moves to RESOLVING.
      if (outcome === 'win') {
        return {
          hero: cue(`${fight}-hero-attack`, HERO.attack, { then: heroIdle }),
          enemy: enemyIdle,
          focus: 'hero',
          beats: [{ at: ENEMY.impact, action: 'animDone' }],
        }
      }
      return {
        hero: heroIdle,
        enemy: cue(`${fight}-enemy-attack`, E.attack, { then: enemyIdle }),
        focus: 'enemy',
        beats: [{ at: E.impact, action: 'animDone' }],
      }

    case STATES.RESOLVING:
      // Same attack cue keys as FIGHTING, so the swing keeps playing; the victim
      // reacts. Enemies always die in one fight in this prototype.
      if (outcome === 'win') {
        return {
          hero: cue(`${fight}-hero-attack`, HERO.attack, { then: heroIdle }),
          enemy: cue(`${fight}-enemy-dead`, E.dead),
          focus: 'clash',
          beats: [{ at: ms(E.dead), action: 'animDone' }],
        }
      }
      return {
        hero: cue(`${fight}-hero-dead`, HERO.dead),
        enemy: cue(`${fight}-enemy-attack`, E.attack, { then: enemyIdle }),
        focus: 'clash',
        beats: [{ at: ms(HERO.dead), action: 'animDone' }],
      }

    case STATES.WIN_BANNER:
      // Victory beat while the result banner shows, then the next enemy enters.
      return {
        hero: cue('hero-victory', HERO.victory),
        enemy: null,
        focus: 'hero',
        beats: [{ at: config.timings.resultBanner, action: 'animDone' }],
      }

    case STATES.CASHED_OUT:
      return { hero: cue('hero-victory', HERO.victory), enemy: enemyIdle, focus: 'hero', beats: [] }

    case STATES.MAX_WIN:
      return { hero: cue('hero-victory', HERO.victory), enemy: null, focus: 'hero', beats: [] }

    case STATES.DEFEAT:
      return { hero: null, enemy: cue(`enemy-victory-${passed}`, E.victory), focus: 'enemy', beats: [] }

    default:
      return { hero: heroIdle, enemy: null, focus: 'hero', beats: [] }
  }
}

// Lottie JSON is loaded in three batches instead of all 8.8 MB at start-up:
// the setup screen, the clips of a normal round (on PLAY), and the boss + MAX WIN
// clips once the round gets close to the boss. ClipSlot waits for a clip's first
// frame before fading it in, so a late load never shows a blank frame.
export const CLIP_BATCHES = {
  setup: [L.bgScene, L.focusHero, L.focusEnemy, L.focusClash, L.heroIdle],
  round: [L.heroEnter, L.heroAttack, L.heroDead, L.heroVictory, L.enemyEnter, L.enemyIdle, L.enemyAttack, L.enemyDead, L.enemyVictory],
  boss: [L.bossEnter, L.bossLandShake, L.bossIdle, L.bossAttack, L.bossDead, L.bossVictory, L.popupMaxWin],
}
// Start loading the boss batch this many gates before the boss.
export const BOSS_PRELOAD_GATES = 3

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

  return useMemo(() => scene, [beatKey, scene.hero?.key, scene.enemy?.key, scene.fx?.key, scene.focus])
}
