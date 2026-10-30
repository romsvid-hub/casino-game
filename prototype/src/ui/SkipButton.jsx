import { assets } from '../assets.js'

const { skipIcon, skipIconHover, skipGlow, skipRim } = assets.vectors

// CTA / Skip 466:2071 (91x120.8): medallion + fast-forward icon + SKIP label.
// Jumps an animation to its result; never changes the outcome.
export default function SkipButton({ state, onClick, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label="Skip animation"
      className={`skip ui-focus ${className}`}
      data-state={state}
      data-forced={state ? '' : undefined}
      onClick={onClick}
      {...rest}
    >
      {/* fx/glow sits behind the medallion, inset 9.21% / 5.71% with an outset of 15.83% / 19.35% */}
      <span className="skip__glow absolute" style={{ inset: '9.21% 5.71%' }} aria-hidden>
        <img src={skipGlow.src} alt="" className="absolute block max-w-none" style={{ inset: '-15.83% -19.35%' }} />
      </span>
      <img
        src={assets.hud.medalEmpty.src}
        alt=""
        aria-hidden
        draggable={false}
        className="skip__medallion absolute inset-0 block size-full object-cover"
        style={{ filter: 'drop-shadow(var(--fx-medallion-shadow))' }}
      />
      <img
        src={skipRim.src}
        alt=""
        aria-hidden
        className="skip__rim absolute block mix-blend-screen"
        style={{ left: 9.1 - 2.6, top: 26 - 2.6, width: 78, height: 78 }}
      />
      {/* icon/fast-forward 29.9x20.8 at 31.85,52; the SVGs include their glow padding */}
      <img
        src={skipIcon.src}
        alt=""
        aria-hidden
        className="skip__icon--default absolute block max-w-none"
        style={{ left: 31.85 - 1.95, top: 52 - 1.28, width: 34.26, height: 25.95 }}
      />
      <img
        src={skipIconHover.src}
        alt=""
        aria-hidden
        className="skip__icon--hover absolute block max-w-none"
        style={{ left: 31.85 - 11.05, top: 52 - 11.68, width: 52.46, height: 44.15 }}
      />
      <span
        className="absolute rounded-[4px] border border-label-border bg-neutral-ink/90"
        style={{ left: 18, top: 96.8, width: 55, height: 21 }}
        aria-hidden
      />
      <span
        className="type-label-s absolute -translate-x-1/2 whitespace-nowrap text-text-parchment"
        style={{ left: 45, top: 98.8, textShadow: 'var(--fx-text-shadow-label)' }}
      >
        SKIP
      </span>
    </button>
  )
}
