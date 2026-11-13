import { config } from '../../game/config.js'
import { formatMoney, formatMultiplier } from '../../game/money.js'
import InfoFact from './InfoFact.jsx'
import RulesStep from './RulesStep.jsx'

// Modal/How to play 992:6990 (UI Kit 987:7365), lobby 885:10856 at (548, 24), 824 wide.
// Vertical, centred: padding 48 / 40 / 24 / 40, gap 48. The logo sits exactly where
// the splash logo is (701, 74), so splash → lobby is "the logo stays, the card
// appears around it". `Story/Intro` is hidden (Show story = false): the story is
// the crowd's speech bubble. Facts read game/config.js; the max multiplier follows
// the difficulty selected in the dock.
const RULES = [
  ['Choose your bet', 'Pick a bet and a difficulty, then press PLAY.'],
  ['Beat the enemy', 'Each enemy shows a multiplier. Win and it grows.'],
  ['Take or fight', 'After every victory: TAKE the win, or FIGHT a stronger enemy.'],
  ['Lose and the bet is gone', 'Lose a fight and the bet for this round is lost.'],
  ['Pure chance', 'Every fight is random. Skill does not change the odds.'],
]

export default function RulesCard({ logo, difficulty, showRgLine = true }) {
  const d = config.difficulties[difficulty]
  const max = d.gates[d.gates.length - 1]
  return (
    <section
      aria-label="How to play"
      data-i="card"
      data-qa="rules-card"
      className="absolute top-[24px] left-[548px] flex w-[824px] flex-col items-center gap-[48px] rounded-[12px] border-2 border-solid border-neutral-iron bg-neutral-ink px-[40px] pt-[48px] pb-[24px]"
      style={{ boxShadow: 'var(--fx-modal-shadow)' }}
    >
      <img src={logo.src} alt="WITCHBOUND" data-i="card-logo" draggable={false} className="block h-[292px] w-[519px] max-w-none" />
      <div className="flex w-[636px] flex-col items-start gap-[16px]">
        <h2 className="type-title-m m-0 pl-[52px] text-text-parchment">HOW TO PLAY</h2>
        <ol className="m-0 flex w-full list-none flex-col gap-[8px] p-0">
          {RULES.map(([title, copy], i) => (
            <RulesStep key={title} n={i + 1} title={title}>
              {copy}
            </RulesStep>
          ))}
        </ol>
      </div>
      <div className="flex items-start justify-center gap-[79px]">
        <InfoFact label="Return to player (RTP)" value={`${config.displayRtp.toFixed(2)}%`} qa="fact-rtp" />
        <InfoFact label="Bet range" value={`${formatMoney(config.minBet)} – ${formatMoney(config.maxBet)}`} qa="fact-bet" />
        <InfoFact label="Max multiplier" value={formatMultiplier(max)} qa="fact-max" />
      </div>
      {showRgLine && (
        <p className="type-body-s m-0 text-center whitespace-pre text-text-muted">
          {'18+  ·  Set your limits before you play  ·  Demo balance has no cash value'}
        </p>
      )}
    </section>
  )
}
