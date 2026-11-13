// Rules/Step (UI Kit, Modal/How to play 987:7365): a 36 px number badge, a title
// (UI/Body M Strong) and one line of copy (UI/Body S, muted).
export default function RulesStep({ n, title, children }) {
  return (
    <li className="flex w-full items-center gap-[16px]">
      <span
        aria-hidden
        className="type-number-s flex size-[36px] shrink-0 items-center justify-center rounded-full border-2 border-solid border-accent-amber bg-neutral-ink text-accent-amber"
      >
        {n}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-body-m-strong text-text-parchment">{title}</span>
        <span className="type-body-s text-text-muted">{children}</span>
      </span>
    </li>
  )
}
