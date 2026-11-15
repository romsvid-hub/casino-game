// Info/Fact (UI Kit): a sentence-case label (UI/Body S, muted) over a value in
// Kurale. Values come from game/config.js, never typed in here.
export default function InfoFact({ label, value, qa }) {
  return (
    <div className="flex flex-col items-center gap-[4px] whitespace-nowrap" data-qa={qa}>
      <span className="type-body-s text-text-muted">{label}</span>
      <span className="type-number-m text-text-parchment">{value}</span>
    </div>
  )
}
