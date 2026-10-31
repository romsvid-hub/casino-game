import { assets } from '../../assets.js'
import { formatMultiplier } from '../../game/money.js'
import Skin3Slice from '../Skin3Slice.jsx'
import SkinSide from '../SkinSide.jsx'

const { results } = assets.vectors

// Boss intro (L12): Popup/Result 337:3924 skin in the Counter/Win zone,
// "FINAL BATTLE · MAX WIN ×19.00", shown before the boss enters.
// The multiplier comes from derived.finalMultiplier.
export default function FinalBattleBanner({ multiplier, className = '' }) {
  return (
    <div className={`banner-in relative h-[120px] w-[800px] ${className}`} role="status" aria-live="polite" data-qa="final-banner">
      <img
        src={results.bannerGlowVictory.src}
        alt=""
        aria-hidden
        className="absolute block max-w-none"
        style={{ left: -40, top: -50, width: 880, height: 220 }}
      />
      <Skin3Slice
        className="absolute top-0 -left-[2px]"
        height={120}
        width={800}
        left={<SkinSide styleName="plain" side="left" size="M" />}
        center={{ src: assets.dock.tile.src, mode: 'tile' }}
        right={<SkinSide styleName="plain" side="right" size="M" />}
      />
      <div className="absolute inset-x-[101px] top-[69px] flex -translate-y-1/2 items-center justify-center gap-[28px] whitespace-nowrap">
        <span className="type-title-m text-accent-amber" style={{ textShadow: 'var(--fx-banner-title-glow), var(--fx-text-shadow)' }}>
          FINAL BATTLE
        </span>
        <span className="type-number-m text-text-muted" aria-hidden>
          ·
        </span>
        <span className="type-title-m text-accent-amber" style={{ textShadow: 'var(--fx-banner-title-glow), var(--fx-text-shadow)' }}>
          MAX WIN
        </span>
        <span className="type-number-xl text-accent-amber" style={{ textShadow: 'var(--fx-banner-title-glow), var(--fx-text-shadow)' }}>
          {formatMultiplier(multiplier)}
        </span>
      </div>
    </div>
  )
}
