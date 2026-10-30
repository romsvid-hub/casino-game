import { assets } from '../../assets.js'
import { formatMultiplier } from '../../game/money.js'

const SKINS = {
  passed: assets.gates.passed.src,
  current: assets.gates.current.src,
  next: assets.gates.next.src,
  locked: assets.gates.locked.src,
  final: assets.gates.final.src,
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
}
const MAX_VISIBLE = 6

// Path/Gate 335:3892 (96x113): tag with the multiplier, gate skin, glow.
export function PathGate({ multiplier, state = 'passed', className = '' }) {
  const glow = GLOWS[state]
  return (
    <div className={`relative h-[113px] w-[96px] shrink-0 ${className}`}>
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

// Progress/Path · Levels 473:943: fixed 800 px slot, row centered.
// Shows only reached levels: (N−1) Passed + 1 Current. 0 = empty.
// 7+ = "…" + the last 6 levels.
export default function ProgressPath({ gates, passed, className = '' }) {
  const reached = gates.slice(0, passed).map((multiplier, index) => ({
    index,
    multiplier,
    state: index === passed - 1 ? 'current' : 'passed',
  }))
  const truncated = reached.length > MAX_VISIBLE
  const visible = truncated ? reached.slice(-MAX_VISIBLE) : reached

  return (
    <div
      className={`flex h-[113px] w-[800px] items-center justify-center ${className}`}
      role="list"
      aria-label={`Gates passed: ${passed}`}
    >
      {visible.length > 0 && (
        <div className="relative flex items-center">
          <div className="absolute -inset-x-[40px] -inset-y-[25px] rounded-[90px] bg-shade-60 blur-[20px]" aria-hidden />
          {truncated && (
            <span
              className="type-number-xl relative mr-[-8px] text-text-parchment"
              style={{ textShadow: 'var(--fx-ellipsis-text)' }}
            >
              …
            </span>
          )}
          {visible.map((g, i) => (
            <div key={g.index} className="relative flex items-center" role="listitem">
              <PathGate multiplier={g.multiplier} state={g.state} className={i < visible.length - 1 ? 'mr-[-8px]' : ''} />
              {i < visible.length - 1 && (
                <div className="mr-[-8px]">
                  <PathChain />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
