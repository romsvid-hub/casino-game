// All money math. Amounts are numbers in currency units; rounding to cents
// happens only here, in toCents / fromCents.

export const toCents = (amount) => Math.round(amount * 100)
export const fromCents = (cents) => cents / 100

// bet x multiplier, rounded to cents once.
export function payout(bet, multiplier) {
  return fromCents(toCents(bet * multiplier))
}

// What TAKE pays now: bet x multiplier of the last passed gate (0 before the first win).
export function atRisk(bet, gates, passed) {
  return passed > 0 ? payout(bet, gates[passed - 1]) : 0
}

// What the next fight pays if won: bet x multiplier of the next gate.
export function ifWon(bet, gates, passed) {
  return passed < gates.length ? payout(bet, gates[passed]) : 0
}

export function addMoney(a, b) {
  return fromCents(toCents(a) + toCents(b))
}

export function subtractMoney(a, b) {
  return fromCents(toCents(a) - toCents(b))
}

const moneyFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(amount) {
  return moneyFormat.format(amount)
}

export function formatMultiplier(multiplier) {
  return `×${moneyFormat.format(multiplier)}`
}
