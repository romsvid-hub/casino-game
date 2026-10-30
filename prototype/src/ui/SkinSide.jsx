import { assets } from '../assets.js'

// Skin/Side 540:2099: end-cap of 3-slice skins.
// Style Towel (towel + leaves) | Plain (forged corner). Size L = 168 high, M = 120.
const SIZES = {
  towel: { L: [99, 168], M: [71, 120] },
  plain: { L: [40, 168], M: [29, 120] },
}

export default function SkinSide({ styleName = 'towel', side = 'left', size = 'L', className = '' }) {
  const [w, h] = SIZES[styleName][size]
  const mirror = side === 'right' ? '-scale-x-100' : ''

  if (styleName === 'towel') {
    return (
      <img
        src={assets.sides.towel.src}
        alt=""
        width={w}
        height={h}
        draggable={false}
        className={`block shrink-0 object-cover ${mirror} ${className}`}
        style={{ width: w, height: h }}
      />
    )
  }

  // Plain art overflows its slot by 15% on each side (Figma inset 0 -15%).
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: w, height: h }}>
      <img
        src={assets.sides.plain.src}
        alt=""
        draggable={false}
        className={`absolute top-0 block h-full max-w-none ${mirror}`}
        style={{ left: '-15%', width: '130%' }}
      />
    </div>
  )
}
