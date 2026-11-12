// One easing set for every move on the stage (block E of the 12.11 brief).
// CSS strings for transitions and the Web Animations API, plus the same curves
// as functions for animations that are baked into keyframes (scene/rig.js).

export const EASE = {
  quickOut: 'cubic-bezier(.2,.8,.2,1)', // a move that starts fast and lands soft
  overshoot: 'cubic-bezier(.34,1.56,.64,1)', // a short move that settles past its end and back
  softInOut: 'cubic-bezier(.45,0,.55,1)', // a calm move in both directions
  linear: 'linear', // loops only
}

// cubic-bezier(x1,y1,x2,y2) as a function of progress 0..1.
function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sx = (t) => ((ax * t + bx) * t + cx) * t
  const sy = (t) => ((ay * t + by) * t + cy) * t
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    let t = x
    for (let i = 0; i < 6; i++) {
      const d = dx(t)
      if (Math.abs(d) < 1e-6) break
      t -= (sx(t) - x) / d
    }
    return sy(Math.min(1, Math.max(0, t)))
  }
}

export const ease = {
  quickOut: bezier(0.2, 0.8, 0.2, 1),
  overshoot: bezier(0.34, 1.56, 0.64, 1),
  softInOut: bezier(0.45, 0, 0.55, 1),
  linear: (x) => x,
}

// A damped spring from 1 back to 0 (settle after a sharp hit): value at t in ms.
export function damped(t, { ms = 320, cycles = 1.5 } = {}) {
  if (t <= 0) return 1
  if (t >= ms) return 0
  const p = t / ms
  return Math.exp(-4.5 * p) * Math.cos(cycles * 2 * Math.PI * p) * (1 - p)
}

// Stage moves (CSS transitions on the character wrapper).
export const MOVE_EASE = {
  step: EASE.quickOut,
  back: EASE.softInOut,
  home: EASE.softInOut,
  enemyIn: EASE.overshoot,
  walkIn: EASE.softInOut,
}
