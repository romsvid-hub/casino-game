// The splash → lobby timeline (≈7 s, 12.11 brief), built with the Web Animations
// API on `transform` and `opacity` only. Paths (Baba Yaga's flight, the stolen
// lights) are cubic beziers sampled into keyframes. Pure helpers + one `playIntro`
// that returns the animations, so SKIP can speed them up ×4 or finish them.
import { EASE, ease } from '../../scene/motion.js'

export const T = {
  fadeIn: 800,
  yagaIn: 800,
  yagaApex: 2400,
  yagaOut: 4000,
  theftFrom: 1400,
  theftTo: 3600,
  logo: 4000,
  toLobby: 5000,
  lobbyIn: 800,
  emotions: 5800,
}
export const SKIP_RATE = 4

// Deterministic randomness, so every run (and every test) looks the same.
function rng(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t
  return [0, 1].map((i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i])
}

// Baba Yaga's flight: arc 1 from the left edge to the top centre (ease in-out),
// arc 2 up and out through the top-right corner. Position = top-left of her image.
const ARC1 = [[-430, 330], [-120, 430], [430, 70], [770, 40]]
const ARC2 = [[770, 40], [1100, 20], [1650, -120], [2060, -420]]
export function yagaAt(t) {
  if (t <= T.yagaIn) return { p: ARC1[0], s: 1 }
  if (t <= T.yagaApex) {
    const k = ease.softInOut((t - T.yagaIn) / (T.yagaApex - T.yagaIn))
    return { p: bez(...ARC1, k), s: 1 }
  }
  const k = ease.softInOut(Math.min(1, (t - T.yagaApex) / (T.yagaOut - T.yagaApex)))
  return { p: bez(...ARC2, k), s: 1 - 0.15 * k }
}
// The mortar's mouth inside her image (the lights gather there, under her layer).
export const MORTAR = [150, 175]

function yagaFrames(dur) {
  const frames = []
  const n = 64
  for (let i = 0; i <= n; i++) {
    const t = T.yagaIn + (i / n) * dur
    const a = yagaAt(t), b = yagaAt(t + 40)
    const tilt = Math.max(-10, Math.min(10, (Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]) * 180) / Math.PI / 4))
    const bob = 2.5 * Math.sin((t / 600) * Math.PI * 2)
    frames.push({
      transform: `translate(${a.p[0].toFixed(1)}px, ${(a.p[1] + bob).toFixed(1)}px) rotate(${tilt.toFixed(2)}deg) scale(${a.s.toFixed(3)})`,
      opacity: Math.min(1, (t - T.yagaIn) / 400),
      offset: i / n,
    })
  }
  return frames
}

export function playIntro(root, dock, { orbs, reduced }) {
  const q = (sel) => root.querySelector(`[data-i="${sel}"]`)
  const qa = (sel) => [...root.querySelectorAll(`[data-i="${sel}"]`)]
  const anims = []
  const add = (el, frames, opts) => el && anims.push(el.animate(frames, { fill: 'both', ...opts }))
  const rand = rng(1107)

  if (reduced) {
    // No flight, no swarm: lit → dark village, the logo, then the lobby.
    add(q('cover'), [{ opacity: 1 }, { opacity: 0 }], { duration: 500 })
    add(q('lit'), [{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 600 })
    add(q('logo-big'), [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1100 })
    lobbyIn(1900)
    return anims
  }

  add(q('cover'), [{ opacity: 1 }, { opacity: 0 }], { duration: T.fadeIn, easing: EASE.softInOut })

  // Baba Yaga crosses the sky.
  add(q('yaga'), yagaFrames(T.yagaOut - T.yagaIn), { duration: T.yagaOut - T.yagaIn, delay: T.yagaIn, easing: 'linear' })

  // The stolen lights: each window light flies to the mortar on its own curve,
  // in random order, then shrinks and fades behind her.
  const order = orbs.map((_, i) => i).sort(() => rand() - 0.5)
  const arrivals = []
  order.forEach((i, n) => {
    const o = orbs[i]
    const dur = 700 + rand() * 600
    const start = T.theftFrom + (n / orbs.length) * (T.theftTo - T.theftFrom - dur)
    const end = start + dur
    arrivals.push(end)
    const y = yagaAt(end)
    const to = [y.p[0] + MORTAR[0] * y.s, y.p[1] + MORTAR[1] * y.s]
    const from = [o.x + o.w / 2, o.y + o.h / 2]
    const side = (rand() - 0.5) * 360
    const c1 = [from[0] + side * 0.4, from[1] - 160 - rand() * 120]
    const c2 = [to[0] - side, to[1] + 120]
    const frames = []
    for (let k = 0; k <= 20; k++) {
      const [x, yy] = bez(from, c1, c2, to, ease.softInOut(k / 20))
      frames.push({ transform: `translate(${(x - from[0]).toFixed(1)}px, ${(yy - from[1]).toFixed(1)}px) scale(${(1 - 0.35 * (k / 20)).toFixed(3)})`, offset: k / 20 })
    }
    const el = root.querySelector(`[data-i="orb"][data-index="${i}"]`)
    add(el, frames, { duration: dur, delay: start, easing: 'linear' })
    add(el?.firstElementChild, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.2)' }], { duration: 300, delay: end, easing: EASE.quickOut })
  })
  // One global darkening of the village, smooth over the whole theft, with a gust
  // of fog sweeping across (as if the wind blew the lights out).
  arrivals.sort((x, y) => x - y)
  const first = T.theftFrom, last = arrivals[arrivals.length - 1]
  add(q('lit'), [{ opacity: 1 }, { opacity: 0 }], { duration: last - first, delay: first, easing: EASE.softInOut })
  add(
    q('gust'),
    [
      { opacity: 0, transform: 'translateX(-420px) scaleY(0.9)' },
      { opacity: 0.85, transform: 'translateX(-60px) scaleY(1.05)', offset: 0.45 },
      { opacity: 0.55, transform: 'translateX(200px) scaleY(1)', offset: 0.7 },
      { opacity: 0, transform: 'translateX(460px) scaleY(0.95)' },
    ],
    { duration: last - first + 600, delay: first - 200, easing: EASE.softInOut },
  )

  // The logo rises with a short warm pulse behind it (the stolen light).
  add(q('logo-big'), [{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 900, delay: T.logo, easing: EASE.overshoot })
  add(q('glow'), [{ opacity: 0, transform: 'scale(0.7)' }, { opacity: 0.85, transform: 'scale(1)', offset: 0.35 }, { opacity: 0, transform: 'scale(1.25)' }], { duration: 1000, delay: T.logo, easing: EASE.quickOut })

  lobbyIn(T.toLobby)
  return anims

  // Splash → lobby (800 ms): the big logo moves into the rules card, the card,
  // knight and crowd come in, SKIP gives way to PLAY, then the crowd's faces.
  function lobbyIn(at) {
    // The big logo already sits where the card's logo is: it hands over when the card has landed.
    add(q('logo-move'), [{ opacity: 1 }, { opacity: 1, offset: 0.99 }, { opacity: 0 }], { duration: T.lobbyIn, delay: at, easing: 'linear' })
    add(q('card'), [{ opacity: 0 }, { opacity: 1 }], { duration: T.lobbyIn, delay: at, easing: EASE.quickOut })
    add(q('hero'), [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: T.lobbyIn, delay: at, easing: EASE.quickOut })
    add(q('crowd'), [{ opacity: 0, transform: 'translate(24px, 12px)' }, { opacity: 1, transform: 'translate(0, 0)' }], { duration: T.lobbyIn, delay: at, easing: EASE.quickOut })
    add(q('skip'), [{ opacity: 1 }, { opacity: 0 }], { duration: T.lobbyIn / 2, delay: at, easing: EASE.softInOut })
    add(dock, [{ opacity: 0 }, { opacity: 1 }], { duration: T.lobbyIn, delay: at, easing: EASE.softInOut })
    if (reduced) return
    // All three villagers in sync: body → emotion 1 → emotion 2 (hold) → emotion 1 → body.
    const e = at + T.lobbyIn
    const step = 300, x = 120
    const total = step * 4 + 260
    const k = (t) => t / total
    const e1 = [
      { opacity: 0, offset: 0 }, { opacity: 0, offset: k(step - x / 2) }, { opacity: 1, offset: k(step + x / 2) },
      { opacity: 1, offset: k(2 * step - x / 2) }, { opacity: 0, offset: k(2 * step + x / 2) },
      { opacity: 0, offset: k(3 * step + 260 - x / 2) }, { opacity: 1, offset: k(3 * step + 260 + x / 2) },
      { opacity: 1, offset: k(4 * step + 260 - x / 2) }, { opacity: 0, offset: 1 },
    ]
    const e2 = [
      { opacity: 0, offset: 0 }, { opacity: 0, offset: k(2 * step - x / 2) }, { opacity: 1, offset: k(2 * step + x / 2) },
      { opacity: 1, offset: k(3 * step + 260 - x / 2) }, { opacity: 0, offset: k(3 * step + 260 + x / 2) }, { opacity: 0, offset: 1 },
    ]
    qa('emotion-1').forEach((el) => add(el, e1, { duration: total, delay: e, easing: 'linear' }))
    qa('emotion-2').forEach((el) => add(el, e2, { duration: total, delay: e, easing: 'linear' }))
  }
}
