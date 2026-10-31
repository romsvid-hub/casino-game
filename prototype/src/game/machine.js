// Round state machine for useReducer. The fight result is decided at FIGHT, so
// animations only play an outcome that is already known.
import { config } from './config.js'
import { initialSeed, rollFight } from './rng.js'
import { addMoney, atRisk, ifWon, payout, subtractMoney } from './money.js'

export const STATES = {
  SETUP: 'SETUP',
  ENTERING: 'ENTERING',
  DECISION: 'DECISION',
  FIGHTING: 'FIGHTING',
  RESOLVING: 'RESOLVING',
  WIN_BANNER: 'WIN_BANNER',
  DEFEAT: 'DEFEAT',
  CASHED_OUT: 'CASHED_OUT',
  MAX_WIN: 'MAX_WIN',
}

export const EVENTS = {
  SET_BET: 'SET_BET',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  PLAY: 'PLAY',
  ENTER_DONE: 'ENTER_DONE',
  FIGHT: 'FIGHT',
  ANIM_DONE: 'ANIM_DONE',
  TAKE: 'TAKE',
  SKIP: 'SKIP',
  NEW_ROUND: 'NEW_ROUND',
  MENU: 'MENU',
  RESET_BALANCE: 'RESET_BALANCE', // demo only: back to config.startingBalance (SETUP)
  // Debug only
  FORCE_NEXT: 'FORCE_NEXT',
}

const ROUND_END = [STATES.DEFEAT, STATES.CASHED_OUT, STATES.MAX_WIN]

// ?difficulty=easy|medium|high preselects the difficulty (used by demo links,
// docs/demo-seeds.md); anything else falls back to the default.
function initialDifficulty() {
  if (typeof window === 'undefined') return config.defaultDifficulty
  const value = new URLSearchParams(window.location.search).get('difficulty')
  return config.difficulties[value] ? value : config.defaultDifficulty
}

export function createInitialState(seed = initialSeed(), difficulty = initialDifficulty()) {
  return {
    phase: STATES.SETUP,
    balance: config.startingBalance,
    bet: config.defaultBet,
    difficulty,
    passed: 0, // gates won this round
    outcome: null, // 'win' | 'lose' of the fight in progress
    lastResult: null, // { type, amount, from, to } of the last beat, for result UI
    insufficientBalance: false,
    seed,
    rngState: seed,
    forceNext: null, // debug: 'win' | 'lose' | null, applies to the next fight only
  }
}

const gatesOf = (state) => config.difficulties[state.difficulty].gates

export function maxAllowedBet(state) {
  return Math.max(config.minBet, Math.min(config.maxBet, state.balance))
}

function clampBet(value, state) {
  const bet = value === 'max' ? maxAllowedBet(state) : Number(value)
  if (!Number.isFinite(bet)) return state.bet
  return Math.min(config.maxBet, Math.max(config.minBet, bet))
}

// Applies the known fight outcome: next beat after FIGHTING / RESOLVING.
function resolveFight(state) {
  const gates = gatesOf(state)

  if (state.outcome === 'lose') {
    return {
      ...state,
      phase: STATES.DEFEAT,
      outcome: null,
      lastResult: {
        type: 'defeat',
        amount: -state.bet,
        from: state.passed > 0 ? gates[state.passed - 1] : null,
        to: null,
      },
    }
  }

  const passed = state.passed + 1
  const before = atRisk(state.bet, gates, state.passed)

  if (passed === gates.length) {
    const win = payout(state.bet, gates[passed - 1])
    return {
      ...state,
      phase: STATES.MAX_WIN,
      passed,
      outcome: null,
      balance: addMoney(state.balance, win),
      // amount = total payout (MAX WIN popup); delta = growth shown on the victory banner.
      lastResult: {
        type: 'maxWin',
        amount: win,
        delta: subtractMoney(win, before),
        from: state.passed > 0 ? gates[state.passed - 1] : null,
        to: gates[passed - 1],
      },
    }
  }

  return {
    ...state,
    phase: STATES.WIN_BANNER,
    passed,
    outcome: null,
    lastResult: {
      type: 'victory',
      amount: subtractMoney(atRisk(state.bet, gates, passed), before),
      from: state.passed > 0 ? gates[state.passed - 1] : null,
      to: gates[passed - 1],
    },
  }
}

export function gameReducer(state, event) {
  const { type } = event

  if (type === EVENTS.FORCE_NEXT) return { ...state, forceNext: event.value ?? null }

  switch (state.phase) {
    case STATES.SETUP:
      if (type === EVENTS.SET_BET) {
        return { ...state, bet: clampBet(event.value, state), insufficientBalance: false }
      }
      if (type === EVENTS.SET_DIFFICULTY && config.difficulties[event.value]) {
        return { ...state, difficulty: event.value }
      }
      if (type === EVENTS.RESET_BALANCE) {
        return { ...state, balance: config.startingBalance, insufficientBalance: false }
      }
      if (type === EVENTS.PLAY) {
        if (state.balance < state.bet) return { ...state, insufficientBalance: true }
        return {
          ...state,
          phase: STATES.ENTERING,
          balance: subtractMoney(state.balance, state.bet),
          passed: 0,
          outcome: null,
          lastResult: null,
          insufficientBalance: false,
        }
      }
      return state

    case STATES.ENTERING:
      if (type === EVENTS.ENTER_DONE || type === EVENTS.SKIP) {
        return { ...state, phase: STATES.DECISION }
      }
      return state

    case STATES.DECISION:
      if (type === EVENTS.FIGHT) {
        const { winChance } = config.difficulties[state.difficulty]
        const { won, rngState } = rollFight(state.rngState, winChance, state.forceNext)
        return {
          ...state,
          phase: STATES.FIGHTING,
          outcome: won ? 'win' : 'lose',
          rngState,
          forceNext: null,
        }
      }
      if (type === EVENTS.TAKE && state.passed > 0) {
        const amount = atRisk(state.bet, gatesOf(state), state.passed)
        return {
          ...state,
          phase: STATES.CASHED_OUT,
          balance: addMoney(state.balance, amount),
          lastResult: { type: 'cashedOut', amount, from: null, to: gatesOf(state)[state.passed - 1] },
        }
      }
      return state

    case STATES.FIGHTING:
      if (type === EVENTS.ANIM_DONE) return { ...state, phase: STATES.RESOLVING }
      if (type === EVENTS.SKIP) return resolveFight(state)
      return state

    case STATES.RESOLVING:
      if (type === EVENTS.ANIM_DONE || type === EVENTS.SKIP) return resolveFight(state)
      return state

    case STATES.WIN_BANNER:
      if (type === EVENTS.ANIM_DONE) return { ...state, phase: STATES.ENTERING }
      if (type === EVENTS.SKIP) return { ...state, phase: STATES.DECISION }
      return state

    default:
      if (ROUND_END.includes(state.phase) && (type === EVENTS.NEW_ROUND || type === EVENTS.MENU)) {
        // Same bet and difficulty are kept for the next round.
        return { ...state, phase: STATES.SETUP, passed: 0, outcome: null }
      }
      return state
  }
}

// Derived values for the UI. Components display these, never compute money.
export function selectDerived(state) {
  const gates = gatesOf(state)
  const { passed, phase, bet } = state
  const ended = ROUND_END.includes(phase)
  const inRound = phase !== STATES.SETUP && !ended
  const last = gates.length - 1

  return {
    level: passed,
    gates: gates.map((multiplier, i) => {
      let status = 'locked'
      if (i < passed - 1 || (i === passed - 1 && phase === STATES.MAX_WIN)) status = 'passed'
      else if (i === passed - 1) status = 'current'
      else if (i === passed) status = 'next'
      if (i === last && status !== 'passed') status = status === 'locked' ? 'final' : status
      return { index: i, multiplier, status, isBoss: i === last }
    }),
    // Round-end frames in Figma (474:2089, 474:2175, 660:5112) show AT RISK 0.00 and NEXT / IF WON "—".
    atRisk: inRound ? atRisk(bet, gates, passed) : 0,
    // Counter/Win value: during the win banner it keeps the previous AT RISK, so the
    // counter counts up to the new value when it comes back (Figma note 337:3925).
    counterWin: !inRound ? 0 : atRisk(bet, gates, phase === STATES.WIN_BANNER ? passed - 1 : passed),
    ifWon: ended ? null : ifWon(bet, gates, passed),
    nextMultiplier: !ended && passed < gates.length ? gates[passed] : null,
    isBoss: passed === last,
    // The boss fight is the last one and pays the maximum (review fix, L12).
    finalMultiplier: gates[last],
    maxWin: payout(bet, gates[last]),
    path: pathOf(gates, passed, phase),
    canTake: phase === STATES.DECISION && passed > 0,
    canFight: phase === STATES.DECISION,
    canPlay: phase === STATES.SETUP && state.balance >= bet,
    // Below the minimum bet no bet is possible: show the low-balance notice (555:5220).
    belowMinBet: state.balance < config.minBet,
    minBet: config.minBet,
    canSkip: [STATES.ENTERING, STATES.FIGHTING, STATES.RESOLVING, STATES.WIN_BANNER].includes(phase),
    winChance: config.difficulties[state.difficulty].winChance,
    maxBet: maxAllowedBet(state),
    // Balance before the round's payout was added: the HUD shows it until the
    // payout popup appears (L9: "balance updates when the payout is shown").
    balanceBeforePayout:
      (phase === STATES.CASHED_OUT || phase === STATES.MAX_WIN) && state.lastResult
        ? subtractMoney(state.balance, state.lastResult.amount)
        : state.balance,
    ...betControls(state),
  }
}

// Progress path (Path/Gate 335:3892): the reached gates, plus the boss gate at
// the end so the player always sees how far the final fight is. Before the boss
// level it is a locked "final" marker; on the boss level and after MAX WIN it is
// the lit Final gate. `remaining` = fights still to win before the boss.
function pathOf(gates, passed, phase) {
  const last = gates.length - 1
  const bossReached = passed >= last
  const reachedCount = Math.min(passed, last)
  const reached = gates.slice(0, reachedCount).map((multiplier, index) => ({
    index,
    multiplier,
    // Before the boss level the newest gate is Current; once the boss is next,
    // the lit Final gate takes over and every earlier gate reads as Passed.
    state: !bossReached && index === reachedCount - 1 ? 'current' : 'passed',
  }))
  const final = {
    index: last,
    multiplier: gates[last],
    state: bossReached ? 'final' : 'finalLocked',
    won: phase === STATES.MAX_WIN,
  }
  return { reached, final, remaining: Math.max(0, last - passed) }
}

// Bet chips and stepper targets for the setup dock (Figma note 536:1900:
// down disabled at the minimum bet, up disabled above the balance / max bet).
function betControls(state) {
  const limit = Math.min(config.maxBet, state.balance)
  const chips = config.betOptions.map((option) => {
    const value = option === 'max' ? maxAllowedBet(state) : option
    return { label: option === 'max' ? 'MAX' : String(option), value, disabled: value > state.balance }
  })
  // Steps are the chip values plus the current limit, so ↑ can always reach MAX.
  const steps = [...new Set([...config.betOptions.filter((o) => o !== 'max'), limit])].sort((a, b) => a - b)
  const betUp = steps.find((s) => s > state.bet && s <= limit) ?? null
  const betDown = [...steps].reverse().find((s) => s < state.bet && s >= config.minBet) ?? null
  return { chips, betUp, betDown }
}
