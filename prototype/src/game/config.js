// Game numbers. ALL values are placeholders until the client confirms them
// (see docs/open-questions.md). Change numbers here only, never in components.

export const config = {
  startingBalance: 40, // PLACEHOLDER - pending client (Figma 587:5125 shows 40.00)
  defaultBet: 5, // PLACEHOLDER - pending client (Figma 587:5125)
  minBet: 1, // PLACEHOLDER - pending client
  maxBet: 20, // PLACEHOLDER - pending client (value of the "MAX" chip)
  displayRtp: 96, // PLACEHOLDER - pending client (shown in the lobby, Figma 885:10856)
  // Chips from Figma 587:5125: 1 / 2 / 5 / 10 / MAX. 'max' = min(maxBet, balance).
  betOptions: [1, 2, 5, 10, 'max'], // PLACEHOLDER - pending client
  defaultDifficulty: 'medium',

  // Who you fight at each gate (index = gate − 1), the same for every difficulty
  // (Figma 04.11: gates 1–5 vovkulak, 6 the old boss, 7 Baba Yaga). The round ends
  // with MAX WIN only after the enemy marked `final`. `defeat` is the hero's pose
  // when that enemy wins: the vovkulaks kill him, Baba Yaga puts him in a cage.
  enemyByGate: ['vovkulak', 'vovkulak', 'vovkulak', 'vovkulak', 'vovkulak', 'vovkulakBoss', 'babaYaga'],
  enemies: {
    vovkulak: { name: 'Vovkulak', defeat: 'dead', final: false },
    vovkulakBoss: { name: 'Vovkulak Boss', defeat: 'dead', final: false },
    babaYaga: { name: 'Baba Yaga', defeat: 'caged', final: true },
  },

  // gates: multiplier reached after each won fight. Winning the last gate (Baba
  // Yaga, the `final` enemy) ends the round with MAX WIN.
  difficulties: {
    easy: {
      label: 'Easy',
      winChance: 0.8, // PLACEHOLDER - pending client (old prototype)
      // PLACEHOLDER - pending client: medium curve scaled by risk, m^0.518 (see decisions.md)
      gates: [1.1, 1.3, 1.55, 2.0, 2.7, 3.55, 4.6],
    },
    medium: {
      label: 'Medium',
      winChance: 0.65, // PLACEHOLDER - pending client (old prototype, Figma "win ~65%")
      // PLACEHOLDER - pending client: Figma level frames 472:7862..473:1307 and boss 473:1397
      gates: [1.2, 1.6, 2.4, 3.9, 6.8, 11.5, 19.0],
    },
    high: {
      label: 'High',
      winChance: 0.45, // PLACEHOLDER - pending client (old prototype)
      // PLACEHOLDER - pending client: medium curve scaled by risk, m^1.854 (see decisions.md)
      gates: [1.4, 2.4, 5.05, 12.45, 34.95, 92.5, 234.6],
    },
  },

  // UI beats in ms (used by the scene / UI from Level 6).
  timings: {
    resultBanner: 1500,
    // "FINAL BATTLE · MAX WIN" banner before Baba Yaga (gate 7) enters.
    bossIntro: 1200,
    crossfade: 150,
    countUp: 400,
    countUpLong: 600,
  },
}

export const DIFFICULTY_KEYS = Object.keys(config.difficulties)
