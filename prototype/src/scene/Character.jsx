import { useEffect, useRef } from 'react'
import FX from './fx.json'
import SPRITES from './sprites.json'
import { SHADOW_Y } from './stage.js'

// Poses each character has (Figma sprites, exported with the shadow removed;
// ax/ay = shadow centre inside the trimmed image, in 1x px).
const POSES = {
  hero: ['walk', 'idle', 'attack', 'hit', 'dead', 'caged', 'victory'],
  vovkulak: ['idle', 'attack', 'hit', 'dead', 'victory'],
  vovkulakBoss: ['idle', 'attack', 'hit', 'dead', 'victory'],
  babaYaga: ['idle', 'attack', 'hit', 'dead', 'victory'],
}

export function spriteUrls(set) {
  return POSES[set].flatMap((p) => {
    const s = SPRITES[`${set}.${p}`]
    return [s.src]
  })
}

// Hit flash: white, then red, back to normal (~180 ms). Played with the Web
// Animations API so the image is never remounted (a remount would restart the
// Dead darkening).
const FLASH = [
  { filter: 'brightness(1)' },
  { filter: 'brightness(2.4) saturate(0.4)', offset: 0.25 },
  { filter: 'brightness(1.3) sepia(1) saturate(4) hue-rotate(-30deg)', offset: 0.55 },
  { filter: 'brightness(1)' },
]

// One character on the stage, anchored at its shadow centre (x, SHADOW_Y).
// Every pose is mounted once and only the current one is visible, so a pose swap
// is instant and in place (no reload, no jump). The wrapper slides between x
// positions with a CSS transition (`move`).
//   set    'hero' | 'vovkulak' | 'vovkulakBoss' | 'babaYaga'    pose   see POSES
//   flash  a new value → hit flash on the pose
//   enter  fade in on mount (next enemy)
export default function Character({ set, pose, x, move, flash, enter = false, qa }) {
  const imgs = useRef({})
  // Fade-in on mount is a CSS animation (rAF-based state would not run in a hidden tab).
  const fadeIn = useRef(enter).current
  useEffect(() => {
    if (flash) imgs.current[pose]?.animate(FLASH, { duration: 180, easing: 'ease-out' })
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
            shadows are baked into her sprites (several feet / broom shadows per pose). */}
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
          const s = SPRITES[`${set}.${p}`]
          const active = p === pose
          return (
            <div
              key={p}
              className="absolute"
              style={{ left: -s.ax, top: SHADOW_Y - s.ay, width: s.w, height: s.h, visibility: active ? 'visible' : 'hidden' }}
              aria-hidden
            >
              <div className={`absolute inset-0 ${active && p === 'idle' ? 'char-breathe' : ''}`}>
                <img
                  ref={(el) => (imgs.current[p] = el)}
                  src={s.src}
                  srcSet={`${s.src} 1x, ${s.src2x} 2x`}
                  alt=""
                  className={`absolute inset-0 block size-full max-w-none ${active && p === 'dead' ? 'char-dead' : ''} ${p === 'caged' ? 'char-caged' : ''}`}
                  draggable={false}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Baba Yaga's cage light (group `cage light`, 843:7754 / 843:7762), drawn behind
// both characters as the Figma layers with their own blend modes. The group sits
// on the cage: one offset per pose (fx.json). It is gold in every frame, including
// her win (DEFEAT). The cage holds the village's stolen light; `released` fades it
// out on MAX WIN.
export function CharacterLight({ set, pose, x, move, released = false }) {
  const offset = set === 'babaYaga' ? FX.cageLight.poses[pose] : null
  if (!offset) return null
  return (
    <div
      className="absolute top-0 left-0"
      style={{ transform: `translateX(${x}px)`, transition: move ? `transform ${move.ms}ms ${move.ease}` : 'none' }}
      data-qa="char-light"
      aria-hidden
    >
      <div className={released ? 'cage-light--released' : ''}>
        {FX.cageLight.layers.map((l) => (
          <img
            key={l.name}
            src={l.src}
            alt=""
            className="absolute block max-w-none"
            style={{ left: offset[0] + l.x, top: SHADOW_Y + offset[1] + l.y, width: l.w, height: l.h, mixBlendMode: l.blend }}
            draggable={false}
          />
        ))}
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
