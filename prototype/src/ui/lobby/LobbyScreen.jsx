import { config } from '../../game/config.js'
import { formatMoney, formatMultiplier } from '../../game/money.js'
import { EnvLayer, layerStyle } from '../../scene/Environment.jsx'
import env from '../../scene/env.json'

// Lobby 885:10856: village background, HOW TO PLAY panel, knight portrait and crowd.
// The background and crowd stay separate layers because the animated splash
// (885:10802) will reuse them. Rules text is a draft from the Figma frame.
const RULES = [
  'Choose your bet and difficulty, then press PLAY.',
  'Each enemy shows a multiplier. Beat it and the multiplier grows.',
  'After every victory decide: TAKE the win now or FIGHT the next, stronger enemy.',
  'Lose a fight and the bet for this round is lost.',
  'The result of every fight is random. Skill does not change the odds.',
]

function Fact({ label, value }) {
  return (
    <div className="flex flex-col items-start gap-[4px] whitespace-nowrap">
      <span className="type-label-xs text-text-muted">{label}</span>
      <span className="lobby-fact text-text-parchment">{value}</span>
    </div>
  )
}

export default function LobbyScreen({ visible, difficulty }) {
  const d = config.difficulties[difficulty]
  const maxMultiplier = d.gates[d.gates.length - 1]
  const { layers, logo, crowd, hero } = env.lobby

  return (
    <div data-qa="lobby" aria-hidden={!visible} className={`lobby absolute inset-0 ${visible ? 'lobby--visible' : ''}`}>
      {layers.map((layer) => (
        <EnvLayer key={layer.name} layer={layer} />
      ))}

      <section
        aria-label="How to play"
        className="absolute top-[93px] left-[548px] flex h-[765px] w-[824px] flex-col items-start gap-[20px] overflow-hidden rounded-[12px] border-2 border-solid border-neutral-iron bg-neutral-ink px-[40px] pt-[24px] pb-[36px]"
        style={{ boxShadow: 'var(--fx-modal-shadow)', textShadow: 'var(--fx-text-shadow-soft)' }}
      >
        <div className="flex w-[680px] flex-col items-center gap-[16px]">
          <img src={logo.src} alt="WITCHBOUND" draggable={false} className="block h-[292px] w-[519px] max-w-none" />
          <h2 className="type-title-m m-0 h-[24px] w-full text-center text-accent-amber">HOW TO PLAY</h2>
        </div>
        <ol className="m-0 flex w-full list-none flex-col gap-[20px] p-0">
          {RULES.map((text, i) => (
            <li key={i} className="flex h-[28px] w-full items-start gap-[20px]">
              <span className="type-number-m w-[32px] shrink-0 text-center text-accent-amber">{i + 1}</span>
              <span className="lobby-rule min-w-0 flex-1 text-text-parchment">{text}</span>
            </li>
          ))}
        </ol>
        <div className="h-px w-full shrink-0 bg-neutral-iron" />
        <div className="flex w-full items-center gap-[99px]">
          <Fact label="RTP" value={`[${config.displayRtp.toFixed(2)}%]`} />
          <Fact label="BET" value={`[${formatMoney(config.minBet)} – ${formatMoney(config.maxBet)}]`} />
          <Fact label="MAX MULTIPLIER" value={`[${formatMultiplier(maxMultiplier)}]`} />
        </div>
        <p className="type-label-xs m-0 w-full text-center whitespace-pre text-text-muted">
          {'18+  ·  Set your limits before you play  ·  Demo balance has no cash value'}
        </p>
      </section>

      {crowd.map((layer) => (
        <EnvLayer key={layer.name} layer={layer} />
      ))}
      <img src={hero.src} alt="" aria-hidden draggable={false} className="absolute block max-w-none" style={layerStyle(hero)} />
    </div>
  )
}
