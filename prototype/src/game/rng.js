// Seeded RNG (mulberry32). Pure: the state lives in the game state, so the
// reducer stays deterministic and the same ?seed= replays the same round.

export function nextRandom(state) {
  let t = (state + 0x6d2b79f5) >>> 0
  let r = Math.imul(t ^ (t >>> 15), t | 1)
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
  return { value: ((r ^ (r >>> 14)) >>> 0) / 4294967296, state: t }
}

// Seed from ?seed=123, otherwise a random 32-bit seed.
export function initialSeed(search = window.location.search) {
  const param = new URLSearchParams(search).get('seed')
  const seed = Number.parseInt(param, 10)
  if (Number.isFinite(seed)) return seed >>> 0
  return Math.floor(Math.random() * 4294967296) >>> 0
}

// Rolls one fight. forceNext ('win' | 'lose') overrides the roll for debugging
// but still advances the RNG, so forcing one fight does not shift later ones.
export function rollFight(rngState, winChance, forceNext) {
  const { value, state } = nextRandom(rngState)
  const won = forceNext ? forceNext === 'win' : value < winChance
  return { won, rngState: state }
}
