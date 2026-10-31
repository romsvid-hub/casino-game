import Digits from '../Digits.jsx'

const COLORS = {
  parchment: 'text-text-parchment',
  blood: 'text-accent-blood',
  teal: 'text-accent-teal',
  amber: 'text-accent-amber',
}

// Dock slot (BET / AT RISK / NEXT / IF WON): label 12 px above a Kurale 30 value,
// column centred on its content; label at y73, value at y91 (Figma 336:3939).
// `qa` keeps a stable test id when the label changes (IF WON → MAX WIN on the boss).
export default function DockSlot({ label, value, color = 'parchment', qa = label, className = '', style }) {
  return (
    <div className={`absolute top-[73px] flex flex-col items-center whitespace-nowrap ${className}`} style={style} data-qa={`slot-${qa}`}>
      <span className="type-label-xs text-text-muted">{label}</span>
      <span className={`type-number-l ${COLORS[color]}`} style={{ textShadow: 'var(--fx-text-shadow)' }}>
        <Digits text={value} />
      </span>
    </div>
  )
}
