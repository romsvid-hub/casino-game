import { assets } from '../assets.js'

// CTA / Fight 347:4215, CTA / Take 347:4245, CTA / Play (instance 587:5038 =
// Fight in Highlight). 308x120. Real hover / active / disabled come from CSS
// (components.css); `state` forces a visual state for /kit.
const SKINS = {
  fight: {
    default: assets.cta.skinFightDefault.src,
    hover: assets.cta.skinFightHover.src,
    disabled: assets.cta.skinFightDisabled.src,
  },
  take: {
    default: assets.cta.skinTake.src,
    hover: assets.cta.skinTake.src,
    disabled: assets.cta.skinTake.src,
  },
}

export default function CtaButton({
  variant = 'fight',
  label,
  amount,
  state, // 'default' | 'hover' | 'pressed' | 'disabled' | 'highlight' (forced, for /kit)
  highlight = false,
  disabled = false,
  onClick,
  className = '',
  ...rest
}) {
  const skins = SKINS[variant === 'take' ? 'take' : 'fight']
  const isDisabled = disabled || state === 'disabled'

  return (
    <button
      type="button"
      className={`cta ${variant === 'take' ? 'cta--take' : ''} ${className}`}
      data-state={state}
      data-forced={state ? '' : undefined}
      data-highlight={highlight || variant === 'play' ? '' : undefined}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        '--cta-skin-default': `url(${skins.default})`,
        '--cta-skin-hover': `url(${skins.hover})`,
        '--cta-skin-disabled': `url(${skins.disabled})`,
      }}
      {...rest}
    >
      <span className="cta__halo" aria-hidden />
      <span className="cta__plate" aria-hidden />
      <span className="cta__shade" aria-hidden />
      <span className="cta__content">
        <span className="cta__label type-button-l">{label}</span>
        {amount != null && <span className="cta__amount type-number-s">{amount}</span>}
      </span>
    </button>
  )
}
