// Speech/Bubble 988:6924, variant Tail=Left: parchment fill, 3 px ink outline,
// radius 20, drop shadow 0/6/14 55 %, UI/Body M ink text, 287 wide. The tail
// leaves the bottom edge near the left corner and points down-left; its tip
// (`tip`, stage px) sits on the speaker's head and is the pop-in's transform origin.
const TAIL = { dx: -38, dy: 96 } // tip offset from the bubble's bottom-left corner

export default function SpeechBubble({ children, tip, width = 287, className = '', style, ...rest }) {
  return (
    <div
      className={`speech-bubble absolute z-[1] ${className}`}
      style={{
        width,
        left: tip.x - TAIL.dx,
        bottom: 1080 - (tip.y - TAIL.dy),
        transformOrigin: `${TAIL.dx}px calc(100% + ${TAIL.dy}px)`,
        ...style,
      }}
      aria-live="off"
      data-qa="speech-bubble"
      {...rest}
    >
      <p className="type-body-m relative m-0 rounded-[20px] border-[3px] border-solid border-neutral-ink bg-text-parchment px-[18px] py-[14px] text-neutral-ink">
        {children}
      </p>
      <svg className="absolute" width="90" height="104" viewBox="0 0 90 104" style={{ left: -42, bottom: -100 }} aria-hidden>
        {/* Drawn over the box so its fill hides the outline where the tail joins. */}
        <path d="M56 0 L4 100 L86 0" className="speech-bubble__tail-fill" />
        <path d="M56 1 L4 100 L86 1" className="speech-bubble__tail-line" />
      </svg>
    </div>
  )
}
