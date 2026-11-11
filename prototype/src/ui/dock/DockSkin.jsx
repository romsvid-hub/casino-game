import { assets } from '../../assets.js'
import SkinSide from '../SkinSide.jsx'

const fill = {
  backgroundImage: `url(${assets.dock.tile.src})`,
  backgroundRepeat: 'repeat-x',
  backgroundSize: '50.488px 168.293px',
}

// Dock/Shell · Top=Plain 926:6471 (1500x168): towel caps and tiled fill, no top
// ornament band. The band is covered by a patch: the same skin shifted up 64 px,
// clipped to x74..1426, y36..80, so the inner area starts at y36.
export default function DockSkin() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="absolute inset-0 isolate flex items-start">
        <div className="relative z-[3] shrink-0">
          <SkinSide styleName="towel" side="left" size="L" />
        </div>
        <div
          className="relative z-[2] h-full min-w-0 flex-1"
          // Figma fill-image overhangs the slot by 2 px on each side.
          style={{ ...fill, margin: '0 -2px' }}
        />
        <div className="relative z-[1] shrink-0">
          <SkinSide styleName="towel" side="right" size="L" />
        </div>
      </div>
      <div className="absolute top-[36px] right-[74px] left-[74px] h-[44px] overflow-hidden">
        <div className="absolute top-[-64px] left-[-74px]">
          <SkinSide styleName="towel" side="left" size="L" />
        </div>
        <div className="absolute top-[-64px] right-[25px] left-[25px] h-[168px]" style={{ ...fill, margin: '0 -2px' }} />
        <div className="absolute top-[-64px] right-[-74px]">
          <SkinSide styleName="towel" side="right" size="L" />
        </div>
      </div>
    </div>
  )
}
