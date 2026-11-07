import { assets } from '../../assets.js'
import { formatMultiplier } from '../../game/money.js'
import Skin3Slice from '../Skin3Slice.jsx'
import SkinSide from '../SkinSide.jsx'

const { results } = assets.vectors

// Boss intro: Popup/Result 337:3924 skin in the Counter/Win zone, shown before a
// boss enters (config.timings.bossIntro).
//   gate 6, vovkulak boss: "BOSS BATTLE · ×11.50" (normal win, no MAX WIN wording)
//   gate 7, Baba Yaga:     "FINAL BATTLE · MAX WIN ×19.00"
// Both use the brighter boss glow (client 07.11: "like the old boss, a bit brighter").
// The multiplier comes from derived (nextMultiplier / finalMultiplier).
// Positioning comes from the caller (`absolute` in the HUD); defaults to relative.
export default function BossIntroBanner({ final = false, multiplier, className = 'relative' }) {
  const glow = { textShadow: 'var(--fx-boss-banner-glow), var(--fx-text-shadow)' }
  return (
    <div
      className={`banner-in h-[120px] w-[800px] ${className}`}
      role="status"
      aria-live="polite"
      data-qa="boss-banner"
    >
      {/* Victory glow twice + a little brightness: the "brighter" boss signal. */}
      {[0, 1].map((i) => (
        <img
          key={i}
          src={results.bannerGlowVictory.src}
          alt=""
          aria-hidden
          className="absolute block max-w-none mix-blend-screen"
          style={{ left: -40, top: -50, width: 880, height: 220 }}
        />
      ))}
      <Skin3Slice
        className="absolute top-0 -left-[2px]"
        height={120}
        width={800}
        left={<SkinSide styleName="plain" side="left" size="M" />}
        center={{ src: assets.dock.tile.src, mode: 'tile' }}
        right={<SkinSide styleName="plain" side="right" size="M" />}
      />
      <div
        className="absolute inset-x-[101px] top-[69px] flex -translate-y-1/2 items-center justify-center gap-[28px] whitespace-nowrap"
        style={{ filter: 'brightness(1.15)' }}
      >
        <span className="type-title-m text-accent-amber" style={glow}>
          {final ? 'FINAL BATTLE' : 'BOSS BATTLE'}
        </span>
        <span className="type-number-m text-text-muted" aria-hidden>
          ·
        </span>
        {final && (
          <span className="type-title-m text-accent-amber" style={glow}>
            MAX WIN
          </span>
        )}
        <span className="type-number-xl text-accent-amber" style={glow}>
          {formatMultiplier(multiplier)}
        </span>
      </div>
    </div>
  )
}
