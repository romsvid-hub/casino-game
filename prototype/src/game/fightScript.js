// Fight script: the exchange of blows shown after FIGHT (client ticket #93).
// Presentation only. The outcome is rolled when FIGHT is pressed (rng.js); this
// file only decides how the fight *looks*, and never changes the result: no HP,
// no damage, no skill.
//
// A fight = 2–3 exchanges, then the decisive blow by the winner. One exchange is
// one blow: the attacker steps 160 px forward, attacks, the defender takes the
// hit at home, the attacker returns home. The hero strikes first, then they
// alternate. The final blow stays on its step: the winner turns to Victory there,
// the loser goes down at home (Dead, or Caged by Baba Yaga).
//
// Steps are { t, hero: { pose, x }, enemy: { pose, x }, flash? } in ms from the
// start of the fight and stage px (x = shadow centre, see scene/stage.js). Tune
// the tempo here; wind-up frames and sound can be added as extra steps later.
import { nextRandom } from './rng.js'

export const TEMPO = {
  step: 200, // attacker slides 160 px forward (CSS transition, ease-out)
  impact: 270, // the blow lands (defender: Hit + flash)
  recover: 250, // attacker back home after the impact
  blow: 700, // one blow, start to start (brief: 600–700 ms)
  settle: 600, // final blow: impact → winner's Victory pose (fight ≈ 2.3–3 s)
}

export const HOME = { hero: 565, enemy: 1340 }
export const STEP = 160

// 2 or 3 exchanges before the decisive blow. Derived from the fight's RNG state
// with a fixed salt, so ?seed= replays it, but it never advances the game RNG:
// the demo seeds keep their outcomes.
export function exchangeCount(rngState) {
  return nextRandom((rngState ^ 0x9e3779b9) >>> 0).value < 0.5 ? 2 : 3
}

const at = (side) => ({ home: HOME[side], step: side === 'hero' ? HOME.hero + STEP : HOME.enemy - STEP })

// outcome: 'win' | 'lose'; defeat: the hero's pose when he loses ('dead' | 'caged').
export function fightScript({ outcome, exchanges, defeat = 'dead' }) {
  const steps = []
  const idle = (t) => ({ t, hero: { pose: 'idle', x: HOME.hero }, enemy: { pose: 'idle', x: HOME.enemy } })
  steps.push(idle(0))

  let t = 0
  for (let i = 0; i < exchanges; i++) {
    const attacker = i % 2 === 0 ? 'hero' : 'enemy'
    const defender = attacker === 'hero' ? 'enemy' : 'hero'
    steps.push({ t, [attacker]: { pose: 'attack', x: at(attacker).step }, [defender]: { pose: 'idle', x: at(defender).home } })
    steps.push({ t: t + TEMPO.impact, [attacker]: { pose: 'attack', x: at(attacker).step }, [defender]: { pose: 'hit', x: at(defender).home }, flash: defender })
    steps.push({ ...idle(t + TEMPO.impact + TEMPO.recover) })
    t += TEMPO.blow
  }

  // The decisive blow always belongs to the winner and stays on its step.
  const winner = outcome === 'win' ? 'hero' : 'enemy'
  const loser = winner === 'hero' ? 'enemy' : 'hero'
  const down = loser === 'hero' ? defeat : 'dead'
  steps.push({ t, [winner]: { pose: 'attack', x: at(winner).step }, [loser]: { pose: 'idle', x: at(loser).home } })
  const impactAt = t + TEMPO.impact
  steps.push({ t: impactAt, [winner]: { pose: 'attack', x: at(winner).step }, [loser]: { pose: down, x: at(loser).home }, flash: loser })
  steps.push({ t: impactAt + TEMPO.settle, [winner]: { pose: 'victory', x: at(winner).step }, [loser]: { pose: down, x: at(loser).home } })

  return { steps, exchanges, winner, impactAt, duration: impactAt + TEMPO.settle }
}

// Poses at the end of a fight (what SKIP jumps to).
export function finalPoses(script) {
  return script.steps[script.steps.length - 1]
}
