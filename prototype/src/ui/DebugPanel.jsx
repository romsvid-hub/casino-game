import { useEffect, useState } from 'react'
import { config, DIFFICULTY_KEYS } from '../game/config.js'
import { formatMoney, formatMultiplier } from '../game/money.js'

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-parchment tabular-nums">{value}</span>
    </div>
  )
}

function Btn({ onClick, children, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded border px-2 py-0.5 ${
        active
          ? 'border-accent-teal text-accent-teal'
          : 'border-neutral-iron text-text-parchment hover:border-text-muted'
      }`}
    >
      {children}
    </button>
  )
}

// Debug panel for the game state machine, toggled with the "D" key.
// Lives outside the scaled stage so it stays readable at any window size.
export default function DebugPanel({ state, actions, derived }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'd' || e.key === 'D') setVisible((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!visible) return null

  const next = derived.nextMultiplier ? formatMultiplier(derived.nextMultiplier) : '—'

  return (
    <div className="fixed top-3 right-3 z-50 flex w-72 flex-col gap-2 rounded-md border border-neutral-iron bg-neutral-ink/90 p-3 font-mono text-[12px]">
      <div className="flex justify-between">
        <span className="text-accent-amber">{state.phase}</span>
        <span className="text-text-muted">D to hide</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <Row label="balance" value={formatMoney(state.balance)} />
        <Row label="bet" value={formatMoney(state.bet)} />
        <Row label="difficulty" value={`${state.difficulty} (${derived.winChance * 100}%)`} />
        <Row label="level" value={`${derived.level} / ${derived.gates.length}`} />
        <Row label="next" value={`${next}${derived.isBoss ? ' BOSS' : ''}`} />
        <Row label="atRisk" value={formatMoney(derived.atRisk)} />
        <Row label="ifWon" value={derived.ifWon == null ? '—' : formatMoney(derived.ifWon)} />
        <Row label="outcome" value={state.outcome ?? '—'} />
        <Row
          label="last"
          value={state.lastResult ? `${state.lastResult.type} ${formatMoney(state.lastResult.amount)}` : '—'}
        />
        <Row label="seed" value={state.seed} />
        {state.insufficientBalance && <Row label="!" value="insufficient balance" />}
      </div>

      <div className="flex flex-wrap gap-1">
        {config.betOptions.map((b) => (
          <Btn key={b} onClick={() => actions.setBet(b)} active={state.bet === (b === 'max' ? derived.maxBet : b)}>
            {b === 'max' ? 'MAX' : b}
          </Btn>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {DIFFICULTY_KEYS.map((d) => (
          <Btn key={d} onClick={() => actions.setDifficulty(d)} active={state.difficulty === d}>
            {d}
          </Btn>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        <Btn onClick={actions.play}>PLAY</Btn>
        <Btn onClick={actions.enterDone}>ENTER_DONE</Btn>
        <Btn onClick={actions.fight}>FIGHT</Btn>
        <Btn onClick={actions.animDone}>ANIM_DONE</Btn>
        <Btn onClick={actions.take}>TAKE</Btn>
        <Btn onClick={actions.skip}>SKIP</Btn>
        <Btn onClick={actions.newRound}>NEW_ROUND</Btn>
        <Btn onClick={actions.menu}>MENU</Btn>
      </div>
      <div className="flex flex-wrap gap-1">
        <Btn onClick={() => actions.forceNext('win')} active={state.forceNext === 'win'}>
          force win
        </Btn>
        <Btn onClick={() => actions.forceNext('lose')} active={state.forceNext === 'lose'}>
          force lose
        </Btn>
        <Btn onClick={() => actions.forceNext(null)}>clear</Btn>
      </div>
    </div>
  )
}
