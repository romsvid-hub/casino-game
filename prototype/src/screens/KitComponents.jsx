import { useState } from 'react'
import { assets } from '../assets.js'
import { formatMoney } from '../game/money.js'
import CtaButton from '../ui/CtaButton.jsx'
import SkipButton from '../ui/SkipButton.jsx'
import Stepper, { StepperArrow } from '../ui/Stepper.jsx'
import BetChip from '../ui/BetChip.jsx'
import DifficultySegment from '../ui/DifficultySegment.jsx'
import ModeBadge from '../ui/ModeBadge.jsx'
import MultiplierPlate from '../ui/MultiplierPlate.jsx'
import SkinSide from '../ui/SkinSide.jsx'
import Skin3Slice from '../ui/Skin3Slice.jsx'

// Figma reference screenshots (docs/figma-refs), shown on /kit only.
const REFS = import.meta.glob('../../../docs/figma-refs/*.png', { eager: true, query: '?url', import: 'default' })
const ref = (name) => REFS[`../../../docs/figma-refs/${name}.png`]

const STATES = ['default', 'hover', 'pressed', 'disabled', 'highlight']

// One comparison: the Figma frame screenshot and our render in a box of the
// same size, with items placed at the same coordinates as in the Figma frame.
function Compare({ title, node, refName, w, h, refW = w, refOffset = [0, 0], items }) {
  const [overlay, setOverlay] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <h3 className="type-title-s m-0 text-text-parchment">{title}</h3>
        <code className="font-mono text-[12px] text-text-muted">{node}</code>
        <label className="ml-auto flex items-center gap-1 font-mono text-[12px] text-text-muted">
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
          overlay Figma at 50%
        </label>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <figure className="m-0 flex flex-col gap-1">
          <div className="relative bg-neutral-char" style={{ width: w, height: h }}>
            <img
              src={ref(refName)}
              alt={`Figma ${title}`}
              className="absolute block max-w-none"
              style={{ left: refOffset[0], top: refOffset[1], width: refW }}
            />
          </div>
          <figcaption className="font-mono text-[11px] text-text-muted">Figma</figcaption>
        </figure>
        <figure className="m-0 flex flex-col gap-1">
          <div className="relative bg-neutral-char" style={{ width: w, height: h }}>
            {items.map(({ x, y, el }, i) => (
              <div key={i} className="absolute" style={{ left: x, top: y }}>
                {el}
              </div>
            ))}
            {overlay && (
              <img
                src={ref(refName)}
                alt=""
                className="pointer-events-none absolute block max-w-none opacity-50"
                style={{ left: refOffset[0], top: refOffset[1], width: refW }}
              />
            )}
          </div>
          <figcaption className="font-mono text-[11px] text-text-muted">App (live, hover / click / Tab work)</figcaption>
        </figure>
      </div>
    </div>
  )
}

function InteractiveDemo() {
  const [bet, setBet] = useState(5)
  const [level, setLevel] = useState('medium')
  const balance = 7
  const chips = [1, 2, 5, 10, 'MAX']
  return (
    <div className="flex flex-wrap items-center gap-8 rounded-md border border-neutral-iron bg-neutral-char p-6">
      <div className="flex items-center gap-3">
        <span className="type-number-l text-text-parchment">{formatMoney(bet)}</span>
        <Stepper
          onUp={() => setBet((b) => Math.min(balance, b + 1))}
          onDown={() => setBet((b) => Math.max(1, b - 1))}
          upDisabled={bet >= balance}
          downDisabled={bet <= 1}
        />
      </div>
      <div className="flex gap-[5px]">
        {chips.map((c) => {
          const value = c === 'MAX' ? balance : c
          return (
            <BetChip
              key={c}
              value={c}
              selected={bet === value}
              disabled={value > balance}
              onClick={() => setBet(value)}
            />
          )
        })}
      </div>
      <div className="flex gap-[6px]">
        {['easy', 'medium', 'high'].map((l) => (
          <DifficultySegment key={l} level={l} selected={level === l} onClick={() => setLevel(l)} />
        ))}
      </div>
      <ModeBadge level={level} />
      <CtaButton variant="play" label="PLAY" amount={`bet ${formatMoney(bet)} · ${level[0].toUpperCase()}${level.slice(1)}`} />
      <p className="m-0 w-full font-mono text-[12px] text-text-muted">
        Interactive demo: balance {formatMoney(balance)}. Chip 10 is disabled (above balance), the stepper stops at 1 and at the balance.
      </p>
    </div>
  )
}

export default function KitComponents() {
  const ctaItems = (variant, label, amount) =>
    STATES.map((s, i) => ({ x: 40 + i * 348, y: 40, el: <CtaButton variant={variant} label={label} amount={amount} state={s} /> }))

  const arrowItems = ['up', 'down'].flatMap((dir, row) =>
    ['default', 'hover', 'pressed', 'disabled'].map((s, i) => ({
      x: 24 + i * 56,
      y: 24 + row * 48,
      el: <StepperArrow direction={dir} state={s} />,
    })),
  )

  const segmentItems = ['easy', 'medium', 'high'].flatMap((l, row) => [
    { x: 17, y: 17 + row * 60, el: <DifficultySegment level={l} state="default" /> },
    { x: 119, y: 17 + row * 60, el: <DifficultySegment level={l} selected state="selected" /> },
    { x: 221, y: 17 + row * 60, el: <DifficultySegment level={l} disabled state="disabled" /> },
  ])

  const sideItems = ['towel', 'plain'].flatMap((st, row) =>
    [
      ['left', 'L'],
      ['left', 'M'],
      ['right', 'L'],
      ['right', 'M'],
    ].map(([side, size], i) => ({ x: 24 + i * 120, y: 24 + row * 200, el: <SkinSide styleName={st} side={side} size={size} /> })),
  )

  return (
    <div className="flex flex-col gap-10">
      <InteractiveDemo />

      <Compare title="CTA / Fight" node="347:4215" refName="cta-fight" w={1780} h={200} items={ctaItems('fight', 'FIGHT', 'up to 680.00')} />
      <Compare title="CTA / Take" node="347:4245" refName="cta-take" w={1780} h={200} items={ctaItems('take', 'TAKE', '240.00')} />
      <Compare
        title="CTA / Play"
        node="587:5038"
        refName="cta-play"
        w={364}
        h={176}
        items={[{ x: 28, y: 28, el: <CtaButton variant="play" label="PLAY" amount="bet 5.00 · Medium" state="highlight" /> }]}
      />
      <Compare
        title="CTA / Skip"
        node="466:2071"
        refName="cta-skip"
        w={262}
        h={169}
        items={[
          { x: 24, y: 24, el: <SkipButton state="default" /> },
          { x: 147, y: 24, el: <SkipButton state="hover" /> },
        ]}
      />
      <div className="flex flex-wrap gap-10">
        <Compare title="Stepper / Arrow" node="536:1900" refName="stepper-arrow" w={248} h={136} items={arrowItems} />
        <Compare
          title="Chip / Bet · S"
          node="585:4702"
          refName="chip-bet-s"
          w={204}
          h={60}
          items={[
            { x: 17, y: 17, el: <BetChip value={5} state="default" /> },
            { x: 79, y: 17, el: <BetChip value={5} selected state="selected" /> },
            { x: 141, y: 17, el: <BetChip value={5} disabled state="disabled" /> },
          ]}
        />
        <Compare title="Segment / Difficulty" node="585:4757" refName="segment-difficulty" w={340} h={198} items={segmentItems} />
        <Compare
          title="Badge / Mode"
          node="585:4776"
          refName="badge-mode"
          w={398}
          h={60}
          items={[
            { x: 17, y: 17, el: <ModeBadge level="easy" /> },
            { x: 139, y: 17, el: <ModeBadge level="medium" /> },
            { x: 285, y: 17, el: <ModeBadge level="high" /> },
          ]}
        />
        <Compare
          title="Plate / Multiplier"
          node="554:4220"
          refName="plate-multiplier"
          w={196}
          h={64}
          items={[{ x: 0, y: 0, el: <MultiplierPlate multiplier={3.9} /> }]}
        />
      </div>
      <Compare title="Skin / Side" node="540:2099" refName="skin-side" w={504} h={424} items={sideItems} />
      <div className="flex flex-wrap gap-10">
        <Compare
          title="Skin3Slice · stretch (HUD/Balance skin)"
          node="302:3760"
          refName="hud-balance"
          w={337}
          h={104}
          items={[
            {
              x: 10,
              y: 10,
              el: (
                <Skin3Slice
                  height={84}
                  width={317}
                  left={<img src={assets.hud.balanceL.src} alt="" width={129} height={84} className="block" />}
                  center={{ src: assets.hud.balanceC.src, mode: 'stretch' }}
                  right={<img src={assets.hud.balanceR.src} alt="" width={39} height={84} className="block" />}
                />
              ),
            },
          ]}
        />
        <Compare
          title="Skin3Slice · tile (Counter/Win skin)"
          node="349:4258"
          refName="counter-win"
          w={808}
          h={120}
          items={[
            {
              x: 0,
              y: 0,
              el: (
                <Skin3Slice
                  height={120}
                  width={808}
                  left={<SkinSide styleName="plain" side="left" size="M" />}
                  center={{ src: assets.dock.tile.src, mode: 'tile' }}
                  right={<SkinSide styleName="plain" side="right" size="M" />}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
