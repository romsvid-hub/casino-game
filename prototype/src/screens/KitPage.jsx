import { useEffect, useState } from 'react'
import { assets } from '../assets.js'

// Token names only: values are read from tokens.css at runtime so hex never lives outside it.
const COLOR_GROUPS = [
  { title: 'color/accent', tokens: ['accent-teal', 'accent-amber', 'accent-blood'] },
  { title: 'color/neutral', tokens: ['neutral-ink', 'neutral-char', 'neutral-iron'] },
  { title: 'color/text', tokens: ['text-parchment', 'text-muted', 'text-disabled'] },
  { title: 'app', tokens: ['stage-letterbox'] },
]

// Every UI/* text style from Figma, mapped to its utility class in tokens.css.
const TYPE_STYLES = [
  { figma: 'UI/Display XL', className: 'type-display-xl', spec: 'Ruslan Display 72/76 · 3%' },
  { figma: 'UI/Title L', className: 'type-title-l', spec: 'Ruslan Display 40/44 · 4%' },
  { figma: 'UI/Button L', className: 'type-button-l', spec: 'Ruslan Display 34/38 · 4%' },
  { figma: 'UI/Title M', className: 'type-title-m', spec: 'Ruslan Display 26/30 · 4%' },
  { figma: 'UI/Button M', className: 'type-button-m', spec: 'Ruslan Display 24/28 · 4%' },
  { figma: 'UI/Title S', className: 'type-title-s', spec: 'Ruslan Display 18/22 · 4%' },
  { figma: 'UI/Label S', className: 'type-label-s', spec: 'Ruslan Display 14/18 · 8%' },
  { figma: 'UI/Label XS', className: 'type-label-xs', spec: 'Ruslan Display 12/18 · 12%' },
  { figma: 'UI/Number Hero', className: 'type-number-hero', spec: 'Kurale 96/100 · tabular' },
  { figma: 'UI/Number XL', className: 'type-number-xl', spec: 'Kurale 46/50 · tabular' },
  { figma: 'UI/Number L', className: 'type-number-l', spec: 'Kurale 30/34 · tabular' },
  { figma: 'UI/Number M', className: 'type-number-m', spec: 'Kurale 24/28 · tabular' },
  { figma: 'UI/Number S', className: 'type-number-s', spec: 'Kurale 18/22 · tabular' },
  { figma: 'UI/Number XS', className: 'type-number-xs', spec: 'Kurale 14/18 · tabular' },
]

const EFFECTS = [
  { name: '--fx-text-shadow', className: 'fx-text-shadow text-text-parchment' },
  { name: 'fx-glow-teal (CTA Fight)', className: 'fx-glow-teal text-accent-teal' },
  { name: 'fx-glow-amber (CTA Take)', className: 'fx-glow-amber text-accent-amber' },
  { name: 'fx-glow-win (Counter/Win)', className: 'fx-glow-win text-accent-amber' },
]

const SAMPLE = 'FIGHT 1,234.50 x2.40'

function readToken(name) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`)
  return value.trim()
}

function Swatch({ token }) {
  const [value, setValue] = useState('')
  useEffect(() => setValue(readToken(token)), [token])

  return (
    <div className="flex w-44 flex-col gap-2">
      <div
        className="h-20 rounded-md border border-neutral-iron"
        style={{ background: `var(--color-${token})` }}
      />
      <code className="font-mono text-[13px] text-text-parchment">--color-{token}</code>
      <code className="font-mono text-[13px] text-text-muted">{value}</code>
    </div>
  )
}

const IMAGE_GROUPS = Object.entries(assets).filter(([group]) => group !== 'lottie')

// Checkerboard behind each image so transparent edges are visible.
const CHECKER = {
  backgroundColor: 'var(--color-neutral-char)',
  backgroundImage:
    'conic-gradient(var(--color-neutral-iron) 25%, transparent 0 50%, var(--color-neutral-iron) 0 75%, transparent 0)',
  backgroundSize: '16px 16px',
}

function AssetTile({ name, asset }) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        className="flex items-center justify-center rounded-md border border-neutral-iron p-2"
        style={{ ...CHECKER, minWidth: 120, minHeight: 120 }}
      >
        <img
          src={asset.src}
          alt={name}
          width={asset.w}
          height={asset.h}
          className="h-auto max-h-[240px] w-auto max-w-[480px]"
        />
      </div>
      <figcaption className="flex flex-col font-mono text-[12px]">
        <span className="text-text-parchment">{asset.src.replace('/assets/ui/', '')}</span>
        <span className="text-text-muted">
          {asset.w}×{asset.h} · {asset.figma}
        </span>
      </figcaption>
    </figure>
  )
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-6 border-t border-neutral-iron pt-8">
      <h2 className="type-title-m text-accent-amber">{title}</h2>
      {children}
    </section>
  )
}

export default function KitPage() {
  return (
    <div className="h-full overflow-y-auto bg-neutral-ink">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-10 py-12">
        <header className="flex items-baseline justify-between">
          <h1 className="type-title-l text-text-parchment">UI Kit · tokens</h1>
          <a href="#/" className="type-label-s text-accent-teal hover:underline">
            ← Back to game
          </a>
        </header>

        <Section title="Colors">
          {COLOR_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="type-label-xs text-text-muted">{group.title}</h3>
              <div className="flex flex-wrap gap-6">
                {group.tokens.map((t) => (
                  <Swatch key={t} token={t} />
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Type">
          <div className="flex flex-col gap-6">
            {TYPE_STYLES.map((s) => (
              <div key={s.figma} className="grid grid-cols-[220px_1fr] items-baseline gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[13px] text-text-parchment">{s.figma}</span>
                  <span className="font-mono text-[12px] text-text-muted">.{s.className}</span>
                  <span className="font-mono text-[12px] text-text-muted">{s.spec}</span>
                </div>
                <p className={`${s.className} m-0 min-w-0 text-text-parchment`}>{SAMPLE}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Effects">
          <div className="flex flex-wrap gap-10">
            {EFFECTS.map((e) => (
              <div key={e.name} className="flex flex-col gap-2">
                <span className={`type-number-xl ${e.className}`}>680.00</span>
                <code className="font-mono text-[13px] text-text-muted">{e.name}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Assets">
          {IMAGE_GROUPS.map(([group, items]) => (
            <div key={group} className="flex flex-col gap-3">
              <h3 className="type-label-xs text-text-muted">{group}</h3>
              <div className="flex flex-wrap items-end gap-6">
                {Object.entries(items).map(([name, asset]) => (
                  <AssetTile key={name} name={name} asset={asset} />
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <h3 className="type-label-xs text-text-muted">lottie (public/lottie)</h3>
            <ul className="m-0 grid grid-cols-3 gap-x-6 gap-y-1 p-0 font-mono text-[12px]">
              {Object.values(assets.lottie).map((l) => (
                <li key={l.src} className="list-none text-text-parchment">
                  {l.src.replace('/lottie/', '')}{' '}
                  <span className="text-text-muted">
                    {l.duration}s · {l.mode}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>
    </div>
  )
}
