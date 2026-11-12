// Character motion as functions of time (ms) → local part values
// { r: degrees, tx, ty: px, sx, sy: scale } about each part's pivot. scene/rig.js
// bakes them into keyframes. Blocks B (walk), C (idle life) and D (actions) of the
// 12.11 brief. Amplitudes are deliberately small: the numbers and the
// FIGHT / TAKE decision stay the focus.
import { damped, ease } from './motion.js'

const TAU = Math.PI * 2
const sin = (t, period, phase = 0) => Math.sin((t / period) * TAU + phase)

// Idle loops share one 12 s timeline; every period divides it, so the loop is seamless.
export const IDLE_LOOP_MS = 12000

// A stable pseudo-random phase per part name, so nothing pulses in step.
function phaseOf(name) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 9973
  return (h / 9973) * TAU
}

// Breathing: scale Y on the torso about its lower joint (1–2 %).
const breathe = (t, name, period = 3000, amount = 0.015) => ({ sy: 1 + amount * (0.5 + 0.5 * sin(t, period, phaseOf(name))) })
const sway = (t, name, deg, period) => ({ r: deg * sin(t, period, phaseOf(name)) })
// Follow-through: the same sway a little later, so a child trails its parent.
const trail = (t, name, deg, period, lagMs = 100) => ({ r: deg * sin(t - lagMs, period, phaseOf(name)) })

// Idle per pose key. Only parts named here move; the rest ride on their parent.
const IDLE = {
  'hero.idle': (t) => ({
    torso: breathe(t, 'torso', 3000, 0.012),
    head: sway(t, 'head', 1, 4000),
    'fist L + sword': sway(t, 'sword', 1.5, 6000),
    'cape back': trail(t, 'cape back', 1.5, 4000, 120),
    'cape front': trail(t, 'cape front', 2, 4000, 90),
  }),
  'hero.victory': (t) => ({
    torso: breathe(t, 'torso', 3000, 0.012),
    head: sway(t, 'head', 1, 4000),
    'arm + sword': sway(t, 'sword', 1.2, 6000),
    cape: trail(t, 'cape', 1.5, 4000, 110),
  }),
  'vovkulak.idle': (t) => ({
    body: breathe(t, 'body', 3000, 0.015),
    head: sway(t, 'head', 1.5, 4000),
    jaw: sway(t, 'jaw', 1.5, 2400),
    'arm L': sway(t, 'arm L', 2, 3000),
    'arm R': sway(t, 'arm R', 2, 4000),
  }),
  'vovkulak.victory': (t) => ({
    body: breathe(t, 'body', 3000, 0.015),
    head: sway(t, 'head', 1.5, 4000),
    'arm L': sway(t, 'arm L', 2, 3000),
    'arm R': sway(t, 'arm R', 2, 4000),
  }),
  'vovkulakBoss.idle': (t) => ({
    body: breathe(t, 'body', 3000, 0.015),
    head: sway(t, 'head', 1.5, 4000),
    jaw: sway(t, 'jaw', 1.5, 2400),
    'arm L': sway(t, 'arm L', 2, 3000),
    'arm R + club': sway(t, 'arm R', 1.5, 4000),
    'club ribbon R': trail(t, 'ribbon R', 3, 2400, 110),
    'club ribbon L': trail(t, 'ribbon L', 3, 3000, 90),
  }),
  'vovkulakBoss.victory': (t) => ({
    body: breathe(t, 'body', 3000, 0.015),
    head: sway(t, 'head', 1.5, 4000),
    'arm R': sway(t, 'arm R', 2, 3000),
    'shoulder L': sway(t, 'shoulder L', 1.5, 4000),
    'ribbon lower L': trail(t, 'ribbon lower', 3, 2400, 110),
    'ribbon upper R': trail(t, 'ribbon upper', 3, 3000, 90),
    cape: trail(t, 'cape', 1.5, 4000, 120),
  }),
  'babaYaga.idle': (t) => ({
    body: breathe(t, 'body', 3000, 0.012),
    head: sway(t, 'head', 1.5, 4000),
    // The cage is drawn on her hand: the arm swings from the shoulder like a pendulum.
    'arm R + cage': { r: 3 * sin(t, 2000) },
    'arm L + broom': sway(t, 'broom', 2, 4000),
  }),
  'babaYaga.victory': (t) => ({
    body: breathe(t, 'body', 3000, 0.012),
    head: sway(t, 'head', 1.5, 4000),
    'arm R + cage': { r: 3 * sin(t, 2000) },
    'arm L + broom': sway(t, 'broom', 2, 4000),
  }),
}

export const idleMotion = (key) => IDLE[key] ?? null

// ── Walk cycle (block B): a puppet walk from the hero.walk parts ─────────────
// One step = half a stride cycle (~520 ms). The number of steps follows the
// duration of the move, the first step ramps in and the last settles.
export const STEP_MS = 520

export function walkMotion(duration) {
  const steps = Math.max(1, Math.round(duration / STEP_MS))
  const cycle = (duration / steps) * 2 // two steps per full cycle
  const rampIn = Math.min(260, duration / 3)
  const settle = Math.min(320, duration / 3)
  return (t) => {
    const amp = Math.min(1, t / rampIn) * Math.min(1, (duration - t) / settle)
    const k = ease.softInOut(Math.max(0, amp))
    const ph = (t / cycle) * TAU
    const swing = Math.sin(ph)
    const lift = Math.max(0, Math.cos(ph)) // passing position
    return {
      // Down on contact, up on the pass; a slight lean forward.
      body: { ty: k * (2 - 4 * Math.abs(Math.cos(ph))), r: k * 1.5 },
      'leg L': { r: k * 20 * swing, ty: -k * 3 * lift },
      'leg R': { r: -k * 20 * swing, ty: -k * 3 * Math.max(0, -Math.cos(ph)) },
      arm: { r: -k * 7 * swing },
      shield: { r: k * 4 * swing },
      head: { r: -k * 1 * swing },
      cape: { r: k * 3 * Math.sin(ph - (100 / cycle) * TAU) * 1.15 },
    }
  }
}

// ── Actions (block D): sharp start, damped settle ────────────────────────────
// Weapon part and the "body" root per pose key.
const WEAPON = {
  'hero.attack': 'arm + sword',
  'vovkulak.attack': 'arm R',
  'vovkulakBoss.attack': 'arm L + club',
  'babaYaga.attack': 'arms + broom',
}
const ROOT = {
  'hero.attack': 'hips',
  'hero.hit': 'body',
  'hero.victory': 'hips',
  'vovkulak.attack': 'body',
  'vovkulak.hit': 'hips + legs',
  'vovkulak.victory': 'body',
  'vovkulakBoss.attack': 'body',
  'vovkulakBoss.hit': 'hips + legs',
  'vovkulakBoss.victory': 'body',
  'babaYaga.attack': 'body',
  'babaYaga.hit': 'body',
  'babaYaga.victory': 'body',
}
const TORSO = { 'vovkulak.hit': 'torso', 'vovkulakBoss.hit': 'torso' }

// Attack: wind-up 140 ms (weapon back, body leans back), strike 100 ms, settle
// 320 ms with a 5° overshoot. `dir` = +1 when attacking to the right (hero).
export const ATTACK_MS = 560
export function attackMotion(key, dir) {
  const weapon = WEAPON[key], root = ROOT[key]
  return (t) => {
    let w, lean
    if (t < 140) {
      const p = ease.softInOut(t / 140)
      w = -14 * p; lean = -3 * p
    } else if (t < 240) {
      const p = ease.quickOut((t - 140) / 100)
      w = -14 + 19 * p; lean = -3 + 4 * p
    } else {
      const d = damped(t - 240, { ms: 320, cycles: 1.25 })
      w = 5 * d; lean = 1 * d
    }
    return { [weapon]: { r: w * dir }, [root]: { r: lean * dir } }
  }
}

// Hit: a 70 ms jolt away from the attacker (6 px, 4° tilt), eased recovery 280 ms.
export const HIT_MS = 350
export function hitMotion(key, away) {
  const root = ROOT[key], torso = TORSO[key] ?? root
  return (t) => {
    const k = t < 70 ? ease.quickOut(t / 70) : 1 - ease.softInOut((t - 70) / 280)
    return { [root]: { tx: 6 * away * k }, [torso]: { r: 4 * away * k } }
  }
}

// Victory: quick raise (150 ms), small bounce settling over 400 ms.
export const VICTORY_MS = 550
export function victoryMotion(key) {
  const root = ROOT[key]
  return (t) => {
    if (t < 150) {
      const p = ease.quickOut(t / 150)
      return { [root]: { ty: 14 * (1 - p), sy: 0.97 + 0.03 * p } }
    }
    return { [root]: { ty: -4 * damped(t - 150, { ms: 400, cycles: 1 }) } }
  }
}

// Dead / caged: quick fall (200 ms), one small bounce, then still.
export const FALL_MS = 520
export function fallMotion(rootName, from = -24) {
  return (t) => {
    if (t < 200) return { [rootName]: { ty: from * (1 - (t / 200) ** 2) } }
    return { [rootName]: { ty: -5 * Math.max(0, damped(t - 200, { ms: 320, cycles: 0.5 })) } }
  }
}
