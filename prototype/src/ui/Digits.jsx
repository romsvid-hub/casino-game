// Kurale has proportional digits only, so counters would jitter while they
// count. Each digit gets a fixed 0.7em cell (Figma note on HUD/Balance 302:3760);
// separators keep their natural width.
export default function Digits({ text, className = '', ...rest }) {
  return (
    <span className={`inline-flex whitespace-nowrap ${className}`} aria-label={text} {...rest}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="inline-block w-[0.7em] text-center">
            {ch}
          </span>
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  )
}
