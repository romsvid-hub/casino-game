import { forwardRef } from 'react'
import { assets } from '../../assets.js'
import CtaButton from '../CtaButton.jsx'
import SkinSide from '../SkinSide.jsx'

// Popup/Actions 479:3045 (966x168): NEW ROUND (Fight style) and MENU (Take style
// with the bag icon covered by a menu icon). Equal weight on purpose (Figma note).
const PopupActions = forwardRef(function PopupActions({ betLabel, onNewRound, onMenu, className = '' }, newRoundRef) {
  return (
    <div className={`relative h-[168px] w-[966px] ${className}`}>
      <div className="absolute inset-0 isolate flex items-start" aria-hidden>
        <div className="relative z-[3] shrink-0">
          <SkinSide styleName="towel" side="left" size="L" />
        </div>
        <div
          className="relative z-[2] h-full min-w-0 flex-1"
          style={{
            backgroundImage: `url(${assets.dock.tile.src})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            margin: '0 -2px',
          }}
        />
        <div className="relative z-[1] shrink-0">
          <SkinSide styleName="towel" side="right" size="L" />
        </div>
      </div>
      <CtaButton
        ref={newRoundRef}
        variant="fight"
        label="NEW ROUND"
        amount={betLabel}
        onClick={onNewRound}
        className="absolute top-[24px] left-[64px] w-[411px]"
      />
      <CtaButton
        variant="take"
        label="MENU"
        amount="lobby · settings"
        onClick={onMenu}
        className="absolute top-[24px] left-[491px] w-[411px]"
      />
      <img
        src={assets.vectors.results.iconCover.src}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-[55px] left-[522px] block size-[58px]"
      />
      <img
        src={assets.vectors.results.iconMenu.src}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-[551px] block size-[33.8px] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  )
})

export default PopupActions
