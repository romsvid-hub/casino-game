import { assets } from '../../assets.js'
import SkinSide from '../SkinSide.jsx'

// Dock/Decision panel 336:3939 (1500x168): towel caps, tiled fill, two dividers
// at x396 / right 396 and the gem in the centre (hidden when PLAY or SKIP sit there).
export default function DockSkin({ gem = true }) {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute inset-0 isolate flex items-start">
        <div className="relative z-[3] shrink-0">
          <SkinSide styleName="towel" side="left" size="L" />
        </div>
        <div
          className="relative z-[2] h-full min-w-0 flex-1"
          style={{
            backgroundImage: `url(${assets.dock.tile.src})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            // Figma fill-image overhangs the slot by 2 px on each side.
            margin: '0 -2px',
          }}
        />
        <div className="relative z-[1] shrink-0">
          <SkinSide styleName="towel" side="right" size="L" />
        </div>
      </div>
      {gem && (
        <img
          src={assets.dock.gem.src}
          alt=""
          className="absolute top-0 left-1/2 block h-[168px] w-[125.85px] max-w-none -translate-x-1/2"
        />
      )}
      <img src={assets.dock.divider.src} alt="" className="absolute top-0 left-[396px] block h-[168px] w-[30px]" />
      <img src={assets.dock.divider.src} alt="" className="absolute top-0 right-[396px] block h-[168px] w-[30px]" />
    </div>
  )
}
