const COLORS = {
  parchment: 'text-text-parchment',
  risk: 'text-accent-risk',
  teal: 'text-accent-teal',
  amber: 'text-accent-amber',
  leaf: 'text-accent-leaf',
}

// Dock/Main value column (941:6560 …): Inter label 13 Semi Bold above a 22 px value,
// centred in a 72 px column. Left-side columns align right, right-side ones align
// left (mirrored around the CTAs). `qa` keeps a stable test id.
export default function DockSlot({ label, value, color = 'parchment', align = 'left', width = 120, weight = 'semibold', qa = label, className = '' }) {
  return (
    <div
      className={`flex h-[72px] shrink-0 flex-col justify-center font-ui whitespace-nowrap ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} ${className}`}
      style={{ width }}
      data-qa={`slot-${qa}`}
    >
      <span className="dock-label text-text-muted">{label}</span>
      <span className={`dock-value ${weight === 'regular' ? 'font-normal' : 'font-semibold'} ${COLORS[color]}`}>{value}</span>
    </div>
  )
}
