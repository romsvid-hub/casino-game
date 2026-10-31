import { useRef } from 'react'
import { assets } from '../../assets.js'
import LottieLayer from '../../scene/LottieLayer.jsx'
import Digits from '../Digits.jsx'
import SkinSide from '../SkinSide.jsx'
import { useCountUp } from '../useCountUp.js'
import { useFocusTrap } from '../useFocusTrap.js'
import PopupActions from './PopupActions.jsx'

const { results } = assets.vectors

// fx/coins in Figma 474:2006 (30 px coins, the SVG adds a shadow margin).
const COINS = [
  [250, 70],
  [740, 64],
  [195, 190],
  [800, 200],
  [310, 30],
  [680, 24],
  [140, 110],
  [850, 120],
]
const RAY_ANGLES = Array.from({ length: 12 }, (_, i) => i * 15)

const VARIANTS = {
  cashedOut: { title: 'CASHED OUT', titleColor: 'text-accent-amber', amountColor: 'text-text-parchment', border: 'border-popup-border-gold' },
  maxWin: { title: 'MAX WIN', titleColor: 'text-accent-amber', amountColor: 'text-text-parchment', border: 'border-popup-border-gold' },
  defeat: { title: 'DEFEAT', titleColor: 'text-defeat-title', amountColor: 'text-defeat-amount', border: 'border-popup-border-blood' },
}

// Popup/Round end 475:2904 (1000x540 at x460 y250) over Overlay/Modal scrim 475:2895.
// Cashed out (474:1921): gold glow, rays, coins. Defeat (475:2905): muted.
// MAX WIN (660:5112): same panel titled MAX WIN, with popup_maxwin.json rays /
// glow behind and its coins in front (its baked panel layer is dropped).
// Amount, note and buttons are always HTML.
export default function RoundEndModal({ type, amount, formatAmount, note, betLabel, onNewRound, onMenu }) {
  const v = VARIANTS[type]
  const shown = useCountUp(amount, type === 'maxWin' ? 800 : 0, type === 'maxWin' ? 0 : amount)
  const containerRef = useRef(null)
  const newRoundRef = useRef(null)
  useFocusTrap(containerRef, newRoundRef)

  return (
    <div ref={containerRef} className="absolute inset-0 z-40" role="dialog" aria-modal="true" aria-label={v.title}>
      {/* Overlay/Modal scrim 475:2895 + effect style "Overlay/Backdrop blur" (8 px) */}
      <div className="popup-scrim fx-backdrop-blur absolute inset-0 bg-scrim" />

      {type === 'maxWin' && (
        <LottieLayer
          src={assets.lottie.popupMaxWin.src}
          markerSequence={['intro', 'loop']}
          keepLayer={(name) => name.startsWith('fx')}
        />
      )}

      <div className="popup-in absolute top-[250px] left-[460px] h-[540px] w-[1000px]">
        {type === 'defeat' ? (
          <img src={results.popupGlowDefeat.src} alt="" aria-hidden className="absolute block max-w-none" style={{ left: 30, top: -50, width: 940, height: 600 }} />
        ) : (
          // Gold glow above the scrim (z-order scrim → glow → panel). MAX WIN uses it too
          // so its halo reads as in 660:5112 instead of being dimmed by the scrim (L12).
          <img src={results.popupGlowGold.src} alt="" aria-hidden className="absolute block max-w-none mix-blend-screen" style={{ left: -40, top: -100, width: 1080, height: 700 }} />
        )}

        {type === 'cashedOut' && (
          <div className="absolute top-0 left-[100px] h-[540px] w-[800px]" aria-hidden>
            {RAY_ANGLES.map((deg) => (
              <div
                key={deg}
                className="absolute top-[-70px] left-[395px] h-[640px] w-[10px] bg-ray mix-blend-screen blur-[3px]"
                style={{ transform: `rotate(${-deg}deg)` }}
              />
            ))}
          </div>
        )}

        {/* bg/body */}
        <div
          className={`absolute top-[110px] left-[74px] h-[300px] w-[851px] rounded-[14px] border-2 bg-popup-body ${v.border}`}
          style={{ boxShadow: 'var(--fx-popup-shadow)' }}
        />
        {/* skin/header: plain sides + tile, x61–939, y60, 120 high */}
        <div className="absolute top-[60px] right-[61px] left-[61px] isolate flex h-[120px] items-start" aria-hidden>
          <div className="relative z-[3] shrink-0">
            <SkinSide styleName="plain" side="left" size="M" />
          </div>
          <div
            className="relative z-[2] h-full min-w-0 flex-1"
            style={{ backgroundImage: `url(${assets.dock.tile.src})`, backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', margin: '0 -2px' }}
          />
          <div className="relative z-[1] shrink-0">
            <SkinSide styleName="plain" side="right" size="M" />
          </div>
        </div>

        {type === 'cashedOut' &&
          COINS.map(([x, y], i) => (
            <img key={i} src={results.coin.src} alt="" aria-hidden className="absolute block max-w-none" style={{ left: x - 4, top: y - 1, width: 38, height: 38 }} />
          ))}

        <p className={`type-title-l absolute top-[111px] left-[500px] m-0 w-[600px] -translate-x-1/2 text-center ${v.titleColor}`} style={{ textShadow: 'var(--fx-popup-text)' }}>
          {v.title}
        </p>
        <p data-qa="popup-amount" className={`type-number-hero absolute top-[196px] left-[500px] m-0 w-[600px] -translate-x-1/2 text-center ${v.amountColor}`} style={{ textShadow: 'var(--fx-popup-text)' }}>
          {/* Fixed digit cells only while counting (MAX WIN); static amounts keep Kurale's natural spacing. */}
          {type === 'maxWin' ? <Digits text={formatAmount(shown)} /> : formatAmount(shown)}
        </p>
        <p className="type-number-s absolute top-[320px] left-[500px] m-0 w-[600px] -translate-x-1/2 text-center whitespace-pre text-text-muted" style={{ textShadow: 'var(--fx-popup-text)' }}>
          {note}
        </p>

        <PopupActions ref={newRoundRef} betLabel={betLabel} onNewRound={onNewRound} onMenu={onMenu} className="absolute top-[352px] left-[17px]" />
      </div>

      {type === 'maxWin' && (
        <LottieLayer
          src={assets.lottie.popupMaxWin.src}
          markerSequence={['intro', 'loop']}
          keepLayer={(name) => name === 'coin'}
        />
      )}
    </div>
  )
}
