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
  // Debug only
  FORCE_NEXT: 'FORCE_NEXT',
}

const ROUND_END = [STATES.DEFEAT, STATES.CASHED_OUT, STATES.MAX_WIN]

export function createInitialState(seed = initialSeed()) {
  return {
    phase: STATES.SETUP,
    balance: config.startingBalance,
    bet: config.defaultBet,
    difficulty: config.defaultDifficulty,
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
      lastResult: { type: 'maxWin', amount: win, from: gates[passed - 1], to: null },
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
          lastResult: { type: 'cashedOut', amount, from: gatesOf(state)[state.passed - 1], to: null },
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
    canTake: phase === STATES.DECISION && passed > 0,
    canFight: phase === STATES.DECISION,
    canPlay: phase === STATES.SETUP && state.balance >= bet,
    canSkip: [STATES.ENTERING, STATES.FIGHTING, STATES.RESOLVING, STATES.WIN_BANNER].includes(phase),
    winChance: config.difficulties[state.difficulty].winChance,
    maxBet: maxAllowedBet(state),
  }
}
