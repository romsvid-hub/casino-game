import { useEffect, useState } from 'react'
import { assets } from '../../assets.js'
import Digits from '../Digits.jsx'
import Skin3Slice from '../Skin3Slice.jsx'
import SkinSide from '../SkinSide.jsx'
import { useCountUp } from '../useCountUp.js'

const { results } = assets.vectors
const COUNT_MS = 600

// Popup/Result 337:3924 (800x120, in the Counter/Win zone at x560 y150).
// Victory: amount counts 0 → +amount in 0.6 s (ease-out), then the multiplier
// step "×old → ×new" appears. Defeat: shown at once with a 200 ms shake.
// `formatAmount` and the note texts come from the caller; no money math here.
export default function ResultBanner({ type = 'victory', amount, formatAmount, noteFrom, noteTo, note, className = '' }) {
  const victory = type === 'victory'
  const shown = useCountUp(amount, victory ? COUNT_MS : 0, victory ? 0 : amount)
  const [stepShown, setStepShown] = useState(!victory)

  useEffect(() => {
    if (!victory) return
    const id = setTimeout(() => setStepShown(true), COUNT_MS)
    return () => clearTimeout(id)
  }, [victory])

  return (
    <div
      className={`relative h-[120px] w-[800px] ${victory ? 'banner-in' : 'banner-in banner-shake'} ${className}`}
      role="status"
      aria-live="polite"
    >
      <img
        src={victory ? results.bannerGlowVictory.src : results.bannerGlowDefeat.src}
        alt=""
        aria-hidden
        className="absolute block max-w-none"
        style={victory ? { left: -40, top: -50, width: 880, height: 220 } : { left: 0, top: -50, width: 800, height: 220 }}
      />
      <Skin3Slice
        className="absolute top-0 -left-[2px]"
        height={120}
        width={800}
        left={<SkinSide styleName="plain" side="left" size="M" />}
        center={{ src: assets.dock.tile.src, mode: 'tile' }}
        right={<SkinSide styleName="plain" side="right" size="M" />}
      />
      {!victory && (
        <div
          className="absolute rounded-[4px] border-2 border-accent-blood opacity-55"
          style={{ inset: '26px 61px 14px 61px' }}
          aria-hidden
        />
      )}
      <span
        className={`type-title-m absolute left-[101px] w-[170px] -translate-y-1/2 ${victory ? 'text-accent-amber' : 'text-accent-blood opacity-85'}`}
        style={{
          top: 72,
          textShadow: victory ? 'var(--fx-banner-title-glow), var(--fx-text-shadow)' : 'var(--fx-text-shadow)',
        }}
      >
        {victory ? 'VICTORY' : 'DEFEAT'}
      </span>
      <span
        className={`type-number-xl absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${victory ? 'text-accent-teal' : 'text-text-parchment'}`}
        style={{
          top: 69,
          textShadow: victory ? 'var(--fx-banner-amount-glow), var(--fx-text-shadow)' : 'var(--fx-text-shadow)',
        }}
      >
        <Digits text={formatAmount(shown)} data-qa="banner-amount" />
      </span>
      <span
        className={`type-number-m absolute right-[101px] text-right whitespace-nowrap ${victory ? 'text-accent-amber' : 'text-text-muted'}`}
        style={{ top: 55, textShadow: 'var(--fx-text-shadow)' }}
      >
        {victory ? (
          <>
            {noteFrom}
            <span className="transition-opacity duration-200" style={{ opacity: stepShown ? 1 : 0 }}>
              {noteFrom ? ' → ' : '→ '}
              {noteTo}
            </span>
          </>
        ) : (
          note
        )}
      </span>
    </div>
  )
}
