// Review links: `?go=<scenario>` opens the game at one exact moment, so every
// screen can be checked from a link (12.11). Presentation only: it replays the
// normal actions (PLAY, forced wins, SKIP), never touches the math.
//   lobby                 the lobby without the splash
//   g<N>-enter            gate N (1–7): the enemy comes in
//   g<N>-wait             gate N: waiting for FIGHT / TAKE
//   g<N>-win | g<N>-lose  gate N: the fight, won or lost (g7-win = MAX WIN)
//   g<N>-take             gate N (2–7): TAKE, round cashed out
export const GO = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('go')

const GATE = /^g([1-7])-(enter|wait|win|lose|take)$/

export function parseScenario(go) {
  if (go === 'lobby') return { gate: 0, step: 'lobby' }
  const m = GATE.exec(go ?? '')
  if (!m) return null
  const gate = Number(m[1])
  if (m[2] === 'take' && gate < 2) return null
  return { gate, step: m[2] }
}

// Runs a scenario with the game actions: the reducer handles them in order.
// Returns a cleanup for the delayed fight.
export function runScenario(go, actions) {
  const s = parseScenario(go)
  if (!s || s.step === 'lobby') return () => {}
  actions.play()
  // Win every gate before the target one, jumping over the animations.
  for (let g = 1; g < s.gate; g++) {
    if (g === 1) actions.skip() // ENTERING → DECISION
    actions.forceNext('win')
    actions.fight()
    actions.skip() // FIGHTING → WIN_BANNER
    if (g < s.gate - 1 || s.step !== 'enter') actions.skip() // WIN_BANNER → DECISION
    else actions.animDone() // WIN_BANNER → ENTERING: the next enemy comes in
  }
  if (s.step === 'enter') return () => {}
  if (s.gate === 1) actions.skip()
  if (s.step === 'wait') return () => {}
  if (s.step === 'take') {
    actions.take()
    return () => {}
  }
  // A short look at the decision, then the fight plays at normal speed.
  const id = setTimeout(() => {
    actions.forceNext(s.step === 'win' ? 'win' : 'lose')
    actions.fight()
  }, 1200)
  return () => clearTimeout(id)
}
