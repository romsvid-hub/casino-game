import { RIGS } from '../scene/rig.js'

// #/rig — every pose rig at rest on a flat background, one box per pose
// (scripts/visual-qa.mjs compares each box with the flat sprite it replaced,
// docs/qa/rig-ref). Add ?rig=1 to see pivots and bones.
export default function RigCheckPage() {
  return (
    <div className="flex min-h-screen flex-wrap content-start gap-[24px] bg-neutral-ink p-[24px]">
      {Object.entries(RIGS).map(([key, rig]) => (
        <figure key={key} className="m-0 flex flex-col gap-[6px]">
          <div data-rig-check={key} className="relative bg-neutral-char" style={{ width: rig.w, height: rig.h }}>
            {rig.parts.map((p) => (
              <img
                key={p.name}
                src={p.src}
                alt=""
                className="absolute block max-w-none"
                style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
              />
            ))}
          </div>
          <figcaption className="font-mono text-[12px] text-text-muted">
            {key} · {rig.parts.length} parts{rig.merged ? ' · merged parts' : ''}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
