import { useEffect, useRef } from 'react'
import FX from './fx.json'
import { bake, pivotOf, RIGS } from './rig.js'
import {
  ATTACK_MS,
  attackMotion,
  FALL_MS,
  fallMotion,
  HIT_MS,
  hitMotion,
  IDLE_LOOP_MS,
  idleMotion,
  VICTORY_MS,
  victoryMotion,
  walkMotion,
} from './motions.js'
import SPRITES from './sprites.json'
import { SHADOW_Y } from './stage.js'

// Poses each character has. Every pose is a cut-out rig of Figma parts
// (scene/rigs.json: part boxes in pose px, z order, parent, pivot at the joint);
// ax/ay = shadow centre inside the pose box, in 1x px. sprites.json keeps the
// shadow ellipse per pose.
const POSES = {
  hero: ['walk', 'idle', 'attack', 'hit', 'dead', 'caged', 'victory'],
  vovkulak: ['idle', 'attack', 'hit', 'dead', 'victory'],
  vovkulakBoss: ['idle', 'attack', 'hit', 'dead', 'victory'],
  babaYaga: ['idle', 'attack', 'hit', 'dead', 'victory'],
}

export function spriteUrls(set) {
  return POSES[set].flatMap((p) => RIGS[`${set}.${p}`].parts.map((part) => part.src))
}

// ?rig=1 draws every part outline, its pivot and the line to its parent's pivot.
const RIG_DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('rig') === '1'

// Hit flash: white, then red, back to normal (~180 ms), on the rig root. Played
// with the Web Animations API so nothing remounts (a remount would restart the
// Dead darkening).
const FLASH = [
  { filter: 'brightness(1)' },
  { filter: 'brightness(2.4) saturate(0.4)', offset: 0.25 },
  { filter: 'brightness(1.3) sepia(1) saturate(4) hue-rotate(-30deg)', offset: 0.55 },
  { filter: 'brightness(1)' },
]

function RigDebug({ rig }) {
  const byName = Object.fromEntries(rig.parts.map((p) => [p.name, p]))
  return (
    <svg className="rig-debug pointer-events-none absolute top-0 left-0 overflow-visible" width={rig.w} height={rig.h} aria-hidden>
      {rig.parts.map((p) => {
        const [px, py] = pivotOf(p)
        const parent = p.parent && byName[p.parent]
        const [qx, qy] = parent ? pivotOf(parent) : [px, py]
        return (
          <g key={p.name} data-part={p.name}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} className="rig-debug__box" />
            {parent && <line x1={px} y1={py} x2={qx} y2={qy} className="rig-debug__bone" />}
            <circle cx={px} cy={py} r={parent ? 4 : 6} className={parent ? 'rig-debug__pivot' : 'rig-debug__root'} />
          </g>
        )
      })}
    </svg>
  )
}

// One pose: its parts as flat images in Figma order. Each part's transform works in
// pose px (transform-origin at the pose's top-left), so the rig engine can give it
// a world matrix without nesting the DOM.
function RigPose({ rig, rootRef, className, orb, light, released }) {
  // The orb rides on the part it sits on (the top-most part under it).
  const orbPos = orb && [rig.ax + orb[0], rig.ay + orb[1]]
  const orbHost =
    orbPos &&
    [...rig.parts]
      .reverse()
      .find((p) => p.name !== 'shadow' && orbPos[0] >= p.x && orbPos[0] <= p.x + p.w && orbPos[1] >= p.y && orbPos[1] <= p.y + p.h)?.name
  return (
    <div ref={rootRef} className={`rig-root absolute inset-0 ${className}`}>
      {/* Baba Yaga's cage light sits behind her and follows the part that holds the cage. */}
      {light && (
        <div className="absolute top-0 left-0" data-follow={light.part} data-qa="char-light" style={{ transformOrigin: '0 0' }} aria-hidden>
          <div className={released ? 'cage-light--released' : ''}>
            {FX.cageLight.layers.map((l) => (
              <img
                key={l.name}
                src={l.src}
                alt=""
                className="absolute block max-w-none"
                style={{ left: rig.ax + light.offset[0] + l.x, top: rig.ay + light.offset[1] + l.y, width: l.w, height: l.h, mixBlendMode: l.blend }}
                draggable={false}
              />
            ))}
          </div>
        </div>
      )}
      {rig.parts.map((p) => (
        <img
          key={p.name}
          src={p.src}
          srcSet={`${p.src} 1x, ${p.src2x} 2x`}
          alt=""
          data-part={p.name}
          className="rig-part absolute block max-w-none"
          style={{ left: p.x, top: p.y, width: p.w, height: p.h, transformOrigin: `${-p.x}px ${-p.y}px` }}
          draggable={false}
        />
      ))}
      {/* FX/Light orb 947:6377: the light amulet each enemy wears. */}
      {orbPos && (
        <img
          src={FX.lightOrb.src}
          alt=""
          aria-hidden
          data-qa="light-orb"
          data-follow={orbHost}
          className="absolute block max-w-none"
          style={{
            left: orbPos[0] - FX.lightOrb.w / 2,
            top: orbPos[1] - FX.lightOrb.h / 2,
            width: FX.lightOrb.w,
            height: FX.lightOrb.h,
            transformOrigin: `${-(orbPos[0] - FX.lightOrb.w / 2)}px ${-(orbPos[1] - FX.lightOrb.h / 2)}px`,
          }}
          draggable={false}
        />
      )}
      {RIG_DEBUG && <RigDebug rig={rig} />}
    </div>
  )
}

// Which part holds Baba Yaga's cage in each pose (the cage light follows it).
const CAGE_PART = { idle: 'arm R + cage', hit: 'arm R + cage', attack: 'leg R + cage', dead: 'cage', victory: 'arm R + cage' }

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Plays a baked motion on a pose root: every part, plus the elements that follow a part.
function play(root, rig, motion, duration, opts) {
  const frames = bake(rig, motion, duration)
  const anims = []
  root.querySelectorAll('[data-part]').forEach((el) => anims.push(el.animate(frames[el.dataset.part], { duration, easing: 'linear', fill: 'both', ...opts })))
  root.querySelectorAll('[data-follow]').forEach((el) => {
    const f = frames[el.dataset.follow]
    if (f) anims.push(el.animate(f, { duration, easing: 'linear', fill: 'both', ...opts }))
  })
  return anims
}

// Drives the active pose: walk, idle life, and the action motions (blocks B–D).
function useRigMotion(roots, set, pose, move, released) {
  useEffect(() => {
    const root = roots.current[pose]
    const key = `${set}.${pose}`
    const rig = RIGS[key]
    if (!root || !rig || reduceMotion()) return
    let anims = []
    let timer
    const idle = (name = key) => {
      const m = idleMotion(name)
      if (!m) return
      const loop = play(root, rig, m, IDLE_LOOP_MS, { iterations: Infinity })
      // A random start in the loop, so two characters never breathe in step.
      const start = Math.random() * IDLE_LOOP_MS
      loop.forEach((a) => (a.currentTime = start))
      anims.push(...loop)
    }
    const once = (motion, ms, then) => {
      anims.push(...play(root, rig, motion, ms, { iterations: 1 }))
      if (then) timer = setTimeout(then, ms)
    }
    const hero = set === 'hero'
    const root0 = rig.parts.find((p) => p.name !== 'shadow' && !p.parent)?.name
    if (pose === 'walk') once(walkMotion(move?.ms ?? 1300), move?.ms ?? 1300)
    else if (pose === 'idle') idle()
    else if (pose === 'attack') once(attackMotion(key, hero ? 1 : -1), ATTACK_MS)
    else if (pose === 'hit') once(hitMotion(key, hero ? -1 : 1), HIT_MS)
    else if (pose === 'victory') once(victoryMotion(key), VICTORY_MS, () => idle())
    else if (pose === 'dead') once(fallMotion(root0, -24), FALL_MS)
    else if (pose === 'caged') once(fallMotion(root0, -60), FALL_MS)
    const onVis = () => anims.forEach((a) => (document.hidden ? a.pause() : a.play()))
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVis)
      anims.forEach((a) => a.cancel())
    }
    // a pose (and a new walk) restarts its motion
  }, [set, pose, move?.ms, released])
}

// One character on the stage, anchored at its shadow centre (x, SHADOW_Y).
// Every pose is mounted once and only the current one is visible, so a pose swap
// is instant and in place (no reload, no jump). The wrapper slides between x
// positions with a CSS transition (`move`).
//   set    'hero' | 'vovkulak' | 'vovkulakBoss' | 'babaYaga'    pose   see POSES
//   flash  a new value → hit flash on the pose
//   enter  fade in on mount (next enemy)
export default function Character({ set, pose, x, move, flash, enter = false, released = false, qa }) {
  const roots = useRef({})
  useRigMotion(roots, set, pose, move, released)
  // Fade-in on mount is a CSS animation (rAF-based state would not run in a hidden tab).
  const fadeIn = useRef(enter).current
  useEffect(() => {
    if (flash) roots.current[pose]?.animate(FLASH, { duration: 180, easing: 'ease-out' })
    // only a new flash value plays the flash
  }, [flash])

  const current = SPRITES[`${set}.${pose}`]
  const down = pose === 'dead'

  return (
    <div
      className={`char absolute top-0 left-0 ${fadeIn ? 'char-enter' : ''}`}
      style={{
        transform: `translateX(${x}px)`,
        transition: move ? `transform ${move.ms}ms ${move.ease}` : 'none',
      }}
      data-qa={qa}
      data-pose={pose}
      data-x={x}
    >
      {/* Dead: the body darkens, then fades out with its shadow (ash FX comes later). */}
      <div className={down ? 'char-down' : ''}>
        {/* Shadow under the feet: multiply, density from Figma (0.55–0.75). Baba Yaga's
            shadows are parts of her rig (several feet / broom shadows per pose). */}
        {current.shadow && <div
          className="char-shadow absolute rounded-[50%] mix-blend-multiply"
          style={{
            left: -current.shadow.w / 2,
            top: SHADOW_Y - current.shadow.h / 2,
            width: current.shadow.w,
            height: current.shadow.h,
            background: 'var(--color-shadow)',
            opacity: current.shadow.a,
            filter: `blur(${current.shadow.blur}px)`,
          }}
          aria-hidden
        />}
        {POSES[set].map((p) => {
          const rig = RIGS[`${set}.${p}`]
          const active = p === pose
          return (
            <div
              key={p}
              className="absolute"
              data-rig-pose={p}
              // Pose swap: a 100 ms crossfade, never a hard cut (block D).
              className={`rig-pose absolute ${active ? 'rig-pose--active' : ''}`}
              style={{ left: -rig.ax, top: SHADOW_Y - rig.ay, width: rig.w, height: rig.h }}
              aria-hidden
            >
              <RigPose
                rig={rig}
                rootRef={(el) => (roots.current[p] = el)}
                className={`${active && p === 'dead' ? 'char-dead' : ''} ${p === 'caged' ? 'char-caged' : ''}`}
                orb={FX.lightOrb.poses[set]?.[p]}
                light={set === 'babaYaga' && FX.cageLight.poses[p] ? { offset: FX.cageLight.poses[p], part: CAGE_PART[p] } : null}
                released={released}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// MAX WIN over Baba Yaga: the cage opens and the light it held goes free: a burst
// from the cage, sparks rising, the scene brightening. The cage core of the Dead
// pose sits 5 px left of her anchor at y580 (cage light offset of that pose).
const RELEASE_SPARKS = 12

export function CageLightRelease({ x }) {
  return (
    <div className="cage-release pointer-events-none absolute inset-0" data-qa="cage-light-release" aria-hidden>
      <div className="cage-release__brighten absolute inset-0" style={{ '--cx': `${x - 5}px`, '--cy': '580px' }} />
      <div className="absolute" style={{ left: x - 5, top: 580 }}>
        <span className="cage-release__burst absolute" />
        {Array.from({ length: RELEASE_SPARKS }, (_, i) => (
          <span
            key={i}
            className="cage-release__spark absolute"
            style={{
              '--dx': `${((i * 37) % 160) - 80}px`,
              '--rise': `${-260 - ((i * 53) % 180)}px`,
              animationDelay: `${300 + i * 170}ms`,
              animationDuration: `${1800 + ((i * 131) % 900)}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// FX / Enemy red light: red halo and ground pool under the winning enemy on its
// step, in every DEFEAT (460:2019). Against Baba Yaga it only supports her gold
// cage light (847:6304: halo 0.18, ground pool 0.20).
export function DefeatRedLight({ x, set }) {
  const red = FX.redLight
  const src = (red[set] ?? red.vovkulak).src
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      data-qa="red-light"
      className="pointer-events-none absolute block max-w-none"
      style={{ left: x + red.x, top: SHADOW_Y + red.y, width: red.w, height: red.h, animation: 'fade-in 300ms ease-out both' }}
      draggable={false}
    />
  )
}

// Victory over a vovkulak or the boss: the beaten enemy's light orb leaves its body
// and flies to the win amount in the result banner (x960, y219), then fades into it.
// The two axes ease differently, so the path curves; two faint copies trail it.
export const ORB_TARGET = { x: 960, y: 219 }

export function LightOrbFlight({ set, x }) {
  const start = FX.lightOrb.poses[set]?.hit
  if (!start) return null
  const from = { x: x + start[0], y: SHADOW_Y + start[1] }
  const style = { '--dx': `${ORB_TARGET.x - from.x}px`, '--dy': `${ORB_TARGET.y - from.y}px` }
  return (
    <div className="pointer-events-none absolute" style={{ left: from.x, top: from.y }} data-qa="light-orb-flight" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="orb-fly-x absolute" style={{ ...style, animationDelay: `${200 + i * 45}ms` }}>
          <div className="orb-fly-y" style={{ ...style, animationDelay: `${200 + i * 45}ms`, opacity: i ? 0.45 / i : 1 }}>
            <img
              src={FX.lightOrb.src}
              alt=""
              className="absolute block max-w-none"
              style={{ left: -FX.lightOrb.w / 2, top: -FX.lightOrb.h / 2, width: FX.lightOrb.w, height: FX.lightOrb.h }}
              draggable={false}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
