import { formatMoney, formatMultiplier } from '../../game/money.js'
import ResultBanner from './ResultBanner.jsx'
import RoundEndModal from './RoundEndModal.jsx'

const plus = (n) => `+${formatMoney(n)}`
const minus = (n) => `−${formatMoney(Math.abs(n))}`

export default function ResultsLayer({ state, actions, stage }) {
  const result = state.lastResult
  if (!stage || !result) return null

  if (stage === 'banner') {
    const banner =
      result.type === 'defeat' ? (
        <ResultBanner
          type="defeat"
          amount={result.amount}
          formatAmount={minus}
          note={result.from ? `bet lost · ${formatMultiplier(result.from)}` : 'bet lost'}
        />
      ) : (
        <ResultBanner
          type="victory"
          amount={result.type === 'maxWin' ? result.delta : result.amount}
          formatAmount={plus}
          noteFrom={result.from ? formatMultiplier(result.from) : ''}
          noteTo={formatMultiplier(result.to)}
        />
      )
    return (
      <div key={`${state.phase}-${state.passed}`} className="absolute top-[150px] left-[560px]">
        {banner}
      </div>
    )
  }

  const bet = formatMoney(state.bet)
  const modal = {
    defeat: {
      amount: result.amount,
      format: minus,
      note: result.from ? `bet lost  ·  reached ${formatMultiplier(result.from)}` : 'bet lost',
    },
    cashedOut: { amount: result.amount, format: plus, note: `${formatMultiplier(result.to)}  ·  bet ${bet}` },
    maxWin: { amount: result.amount, format: plus, note: `${formatMultiplier(result.to)}  ·  bet ${bet}` },
  }[result.type]

  return (
    <RoundEndModal
      key={state.phase}
      type={result.type}
      amount={modal.amount}
      formatAmount={modal.format}
      note={modal.note}
      betLabel={`bet ${bet}`}
      onNewRound={actions.newRound}
      onMenu={actions.menu}
    />
  )
}
