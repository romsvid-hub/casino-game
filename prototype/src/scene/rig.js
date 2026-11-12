// Cut-out rig: every pose is a set of Figma parts (scene/rigs.json) with a parent
// and a pivot at the joint. Motion is a function of time that returns local
// rotations / offsets / squash per part; it is baked into keyframes of world
// matrices, so each part is one flat <img> animated on `transform` only (GPU,
// no React render per frame) and the Figma stacking order stays as it is.
import RIGS from './rigs.json'

export { RIGS }

const DEG = Math.PI / 180

// 2D affine matrix [a, b, c, d, e, f] (CSS matrix order).
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
]
const IDENTITY = [1, 0, 0, 1, 0, 0]

// Local transform of a part about its pivot (px, py in sprite px):
// translate(t) · translate(pivot) · rotate(r) · scale(sx, sy) · translate(-pivot)
function local({ r = 0, tx = 0, ty = 0, sx = 1, sy = 1 }, px, py) {
  const c = Math.cos(r * DEG), s = Math.sin(r * DEG)
  const a = c * sx, b = s * sx, cc = -s * sy, d = c * sy
  return [a, b, cc, d, px + tx - (a * px + cc * py), py + ty - (b * px + d * py)]
}

export function pivotOf(part) {
  return [part.x + part.pivot[0], part.y + part.pivot[1]]
}

// World matrices of every part for one frame. `pose` maps part name → local values.
export function worldMatrices(rig, pose) {
  const out = {}
  const byName = Object.fromEntries(rig.parts.map((p) => [p.name, p]))
  const solve = (name) => {
    if (out[name]) return out[name]
    const p = byName[name]
    const [px, py] = pivotOf(p)
    const m = mul(p.parent && byName[p.parent] ? solve(p.parent) : IDENTITY, local(pose[name] ?? {}, px, py))
    out[name] = m
    return m
  }
  rig.parts.forEach((p) => solve(p.name))
  return out
}

const css = (m) => `matrix(${m.map((v, i) => (i < 4 ? v.toFixed(5) : v.toFixed(2))).join(',')})`

// Bake `motion(t)` (t in ms, 0..duration) into Web Animations keyframes per part.
export function bake(rig, motion, duration, fps = 30) {
  const n = Math.max(2, Math.round((duration / 1000) * fps) + 1)
  const frames = Object.fromEntries(rig.parts.map((p) => [p.name, []]))
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * duration
    const m = worldMatrices(rig, motion(t) ?? {})
    for (const p of rig.parts) frames[p.name].push({ transform: css(m[p.name]) })
  }
  return frames
}

// The rig of a sprite key ('hero.idle'), or null.
export const rigOf = (set, pose) => RIGS[`${set}.${pose}`] ?? null
