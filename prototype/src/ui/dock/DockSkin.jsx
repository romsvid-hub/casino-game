import { assets } from '../../assets.js'
import SkinSide from '../SkinSide.jsx'

// Dock/Shell 771:6134 (1500x168): towel caps and tiled fill, the one skin of every
// dock state. No gem and no dividers.
export default function DockSkin() {
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
            backgroundSize: '50.488px 168.293px',
            // Figma fill-image overhangs the slot by 2 px on each side.
            margin: '0 -2px',
          }}
        />
        <div className="relative z-[1] shrink-0">
          <SkinSide styleName="towel" side="right" size="L" />
        </div>
      </div>
    </div>
  )
}
