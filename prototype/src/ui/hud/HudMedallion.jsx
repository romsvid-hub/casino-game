import { assets } from '../../assets.js'

const { medal } = assets.vectors

// Icon placement inside the 26x26 icon box (hover SVGs include their glow).
const ICONS = {
  rules: {
    label: 'Rules',
    src: medal.rules.src,
    hover: medal.rulesHover.src,
    hoverBox: { left: 0, top: -5.32, width: 26, height: 36.88 },
  },
  menu: {
    label: 'Menu',
    src: medal.menu.src,
    hover: medal.menuHover.src,
    hoverBox: { left: -4.75, top: -2.72, width: 35.5, height: 31.44 },
  },
}

// HUD/Medallion 302:3800 (70x76): Rules / Menu, Default / Hover (teal glow + teal icon).
// Sound is not rendered: the prototype has no audio.
export default function HudMedallion({ icon = 'rules', state, onClick, className = '' }) {
  const cfg = ICONS[icon]
  return (
    <button
      type="button"
      aria-label={cfg.label}
      className={`medallion ui-focus ${className}`}
      data-state={state}
      data-forced={state ? '' : undefined}
      onClick={onClick}
    >
      <span className="medallion__glow absolute" style={{ inset: '9.21% 5.71%' }} aria-hidden>
        <img src={medal.glow.src} alt="" className="absolute block max-w-none" style={{ inset: '-19.35%' }} />
      </span>
      <img
        src={assets.hud.medalEmpty.src}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 block size-full object-cover"
        style={{ filter: 'drop-shadow(var(--fx-hud-medallion))' }}
      />
      <img
        src={medal.rim.src}
        alt=""
        aria-hidden
        className="medallion__glow absolute block mix-blend-screen"
        style={{ left: 5, top: 8, width: 60, height: 60 }}
      />
      <span className="absolute top-1/2 left-1/2 size-[26px] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <img src={cfg.src} alt="" className="medallion__icon absolute inset-0 block size-full" />
        <img src={cfg.hover} alt="" className="medallion__icon--hover absolute block max-w-none" style={cfg.hoverBox} />
      </span>
    </button>
  )
}
