import { useRef } from 'react'
import { assets } from '../../assets.js'
import SkinSide from '../SkinSide.jsx'
import { useFocusTrap } from '../useFocusTrap.js'

// Panel/Header 554:4743: towel caps (M) + tiled fill, title UI/Title M amber.
function PanelHeader({ title }) {
  return (
    <div className="absolute top-0 right-0 left-0 h-[120px]">
      <div className="absolute inset-0 isolate flex items-start" aria-hidden>
        <div className="relative z-[3] shrink-0">
          <SkinSide styleName="towel" side="left" size="M" />
        </div>
        <div
          className="relative z-[2] h-full min-w-0 flex-1"
          style={{ backgroundImage: `url(${assets.dock.tile.src})`, backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', margin: '0 -2px' }}
        />
        <div className="relative z-[1] shrink-0">
          <SkinSide styleName="towel" side="right" size="M" />
        </div>
      </div>
      <h2
        className="type-title-m absolute top-[56px] right-[100px] left-[100px] m-0 text-center text-accent-amber"
        style={{ textShadow: 'var(--fx-text-shadow-soft)' }}
      >
        {title}
      </h2>
    </div>
  )
}

// Lobby-style modal (How to play 555:4998, Settings 555:5155): scrim with
// backdrop blur, Panel/Header on top of a dark body (28 px inset, 96 px down).
export default function ModalPanel({ title, x, y, width, initialFocusRef, onClose, children }) {
  const containerRef = useRef(null)
  useFocusTrap(containerRef, initialFocusRef, onClose)

  return (
    <div ref={containerRef} className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="popup-scrim fx-backdrop-blur absolute inset-0 bg-scrim" onClick={onClose} />
      <div className="popup-in absolute" style={{ left: x, top: y, width }}>
        <div
          className="relative mx-[28px] mt-[96px] flex flex-col items-start gap-[20px] rounded-[12px] border-2 border-neutral-iron bg-neutral-ink px-[40px] pt-[48px] pb-[36px]"
          style={{ boxShadow: 'var(--fx-modal-shadow)' }}
        >
          {children}
        </div>
        <PanelHeader title={title} />
      </div>
    </div>
  )
}
