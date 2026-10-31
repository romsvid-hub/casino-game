import { assets } from '../../assets.js'
import { formatMultiplier } from '../../game/money.js'

const SKINS = {
  passed: assets.gates.passed.src,
  current: assets.gates.current.src,
  next: assets.gates.next.src,
  locked: assets.gates.locked.src,
  final: assets.gates.final.src,
  finalLocked: assets.gates.final.src,
}
const GLOWS = {
  passed: assets.vectors.gateGlow.passed.src,
  current: assets.vectors.gateGlow.current.src,
  final: assets.vectors.gateGlow.final.src,
}
const TEXT = {
  passed: 'text-accent-amber',
  final: 'text-accent-amber',
  current: 'text-accent-teal',
  next: 'text-text-parchment',
  locked: 'text-text-muted',
  finalLocked: 'text-text-muted',
}
const MAX_VISIBLE = 6

// Path/Gate 335:3892 (96x113): tag with the multiplier, gate skin, glow.
// `finalLocked` (our addition, decisions.md L12): the boss gate shown ahead of
// time, Final skin dimmed and without glow.
export function PathGate({ multiplier, state = 'passed', className = '' }) {
  const glow = GLOWS[state]
  return (
    <div
      className={`relative h-[113px] w-[96px] shrink-0 ${state === 'final' ? 'gate-final-pulse' : ''} ${className}`}
      style={state === 'finalLocked' ? { opacity: 0.6, filter: 'saturate(0.45)' } : undefined}
    >
      {glow && (
        <img
          src={glow}
          alt=""
          aria-hidden
          // Remount on state change so the glow fades in (Figma note 335:3934: 200 ms).
          key={state}
          className="gate-glow-in absolute block max-w-none"
          style={{ left: -11.2, top: 5.8, width: 118.4, height: 118.4 }}
        />
      )}
      <img
        src={SKINS[state]}
        alt=""
        aria-hidden
        className="absolute top-[17px] left-0 block size-[96px] object-cover"
        style={{ filter: 'drop-shadow(var(--fx-gate-shadow))' }}
      />
      <img src={assets.gates.tag.src} alt="" aria-hidden className="absolute top-0 left-[18px] block h-[28px] w-[60px]" />
      <span
        className={`type-number-xs absolute top-[2px] left-1/2 -translate-x-1/2 whitespace-nowrap ${TEXT[state]}`}
        style={{ textShadow: 'var(--fx-gate-text)' }}
      >
        {formatMultiplier(multiplier)}
      </span>
    </div>
  )
}

// Path/Chain 335:3893 (40x113, chain 40x26 at y52).
function PathChain() {
  return (
    <div className="relative h-[113px] w-[40px] shrink-0" aria-hidden>
      <img src={assets.gates.chain.src} alt="" className="absolute top-[52px] left-0 block h-[26px] w-[40px]" />
    </div>
  )
}

// Gap to the boss gate: a dimmed chain with the number of fights left.
function PathGap({ remaining }) {
  return (
    <div className="relative h-[113px] w-[56px] shrink-0" aria-label={`${remaining} fights to the boss`}>
      <img src={assets.gates.chain.src} alt="" aria-hidden className="absolute top-[52px] left-[8px] block h-[26px] w-[40px] opacity-40" />
      <span
        className="type-number-xs absolute top-[84px] left-1/2 -translate-x-1/2 whitespace-nowrap text-text-muted"
        style={{ textShadow: 'var(--fx-gate-text)' }}
      >
        +{remaining}
      </span>
    </div>
  )
}

// Progress/Path · Levels 473:943: fixed 800 px slot, row centered.
// Reached levels (N−1 Passed + 1 Current), then the boss gate at the end:
// locked Final marker before the boss level, lit Final gate on it (L12).
// More than 6 gates in all = "…" + the last ones. Values come from derived.path.
export default function ProgressPath({ path, className = '' }) {
  const { reached, final, remaining } = path
  const room = MAX_VISIBLE - 1
  const truncated = reached.length > room
  const visible = truncated ? reached.slice(-room) : reached

  return (
    <div
      className={`flex h-[113px] w-[800px] items-center justify-center ${className}`}
      role="list"
      aria-label={`Gates passed: ${reached.length}${final.state === 'final' ? ', final fight' : `, ${remaining + 1} to the boss`}`}
    >
      <div className="relative flex items-center">
        {/* fx/shade 349:4288: black 60 %, layer blur 40, 40 px past the row left/right, 25 top / 35 bottom. */}
        <div className="absolute -inset-x-[40px] -top-[25px] -bottom-[35px] rounded-[90px] bg-shade-60 blur-[20px]" aria-hidden />
        {truncated && (
          <span
            className="type-number-xl relative mr-[-8px] text-text-parchment"
            style={{ textShadow: 'var(--fx-ellipsis-text)' }}
          >
            …
          </span>
        )}
        {visible.map((g) => (
          <div key={g.index} className="relative flex items-center" role="listitem">
            <PathGate multiplier={g.multiplier} state={g.state} className="mr-[-8px]" />
            <div className="mr-[-8px]">
              {remaining > 0 && g === visible[visible.length - 1] ? <PathGap remaining={remaining} /> : <PathChain />}
            </div>
          </div>
        ))}
        {visible.length === 0 && remaining > 0 && <PathGap remaining={remaining} />}
        <div className="relative flex items-center" role="listitem">
          <PathGate key={final.state} multiplier={final.multiplier} state={final.state} />
        </div>
      </div>
    </div>
  )
}
