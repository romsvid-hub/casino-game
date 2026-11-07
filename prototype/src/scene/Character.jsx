import { useEffect, useRef } from 'react'
import SPRITES from './sprites.json'
import { RIM, SHADOW_Y } from './stage.js'

// Poses each character has (Figma sprites, exported with the shadow removed;
// ax/ay = shadow centre inside the trimmed image, in 1x px).
const POSES = {
  hero: ['walk', 'idle', 'attack', 'hit', 'dead', 'caged', 'victory'],
  vovkulak: ['idle', 'attack', 'hit', 'dead', 'victory'],
  vovkulakBoss: ['idle', 'attack', 'hit', 'dead', 'victory'],
}

export function spriteUrls(set) {
  return POSES[set].flatMap((p) => {
    const s = SPRITES[`${set}.${p}`]
    return [s.src, s.rim?.src].filter(Boolean)
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
//   set    'hero' | 'vovkulak' | 'vovkulakBoss'    pose   see POSES
//   flash  a new value → hit flash on the pose     scene  'forest' | 'field' | 'hut' (hero rim light)
//   enter  fade in on mount (next enemy)
export default function Character({ set, pose, x, move, flash, scene, enter = false, qa }) {
  const imgs = useRef({})
  // Fade-in on mount is a CSS animation (rAF-based state would not run in a hidden tab).
  const fadeIn = useRef(enter).current
  useEffect(() => {
    if (flash) imgs.current[pose]?.animate(FLASH, { duration: 180, easing: 'ease-out' })
    // only a new flash value plays the flash
  }, [flash])

  const rim = set === 'hero' && scene ? RIM[scene] : null
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
        {/* Shadow under the feet: multiply, density from Figma (0.55–0.75). */}
        <div
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
        />
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
                {rim && s.rim && (
                  // Upper-body copy under the art; only its coloured offset shadow peeks out.
                  <img
                    src={s.rim.src}
                    srcSet={`${s.rim.src} 1x, ${s.rim.src2x} 2x`}
                    alt=""
                    className="absolute block max-w-none"
                    style={{
                      left: s.rim.x,
                      top: s.rim.y,
                      width: s.rim.w,
                      height: s.rim.h,
                      filter: `drop-shadow(${rim.x}px ${rim.y}px 1px ${rim.color}) drop-shadow(${rim.x}px ${rim.y}px 2px ${rim.color})`,
                    }}
                    draggable={false}
                  />
                )}
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
