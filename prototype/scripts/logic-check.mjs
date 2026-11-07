// Logic checks for the game core (no browser). Run: npm run check:logic
// Replays rounds through the reducer and compares the numbers with the Figma
// level frames (472:7862 … 473:1307, 474:2008, 474:2175, 660:5112).
import { createInitialState, gameReducer as R, selectDerived as D, EVENTS as E, STATES } from '../src/game/machine.js'
import { formatMoney as f } from '../src/game/money.js'
import { exchangeCount, fightScript, HOME, STEP } from '../src/game/fightScript.js'
const go = (s, ...evs) => evs.reduce((st, e) => R(st, typeof e === 'string' ? { type: e } : e), s)
const fightWin = (s) => go(s, { type: E.FORCE_NEXT, value: 'win' }, E.FIGHT, E.ANIM_DONE, E.ANIM_DONE, E.ANIM_DONE, E.ENTER_DONE)
let ok = true; const check = (name, a, b) => { const pass = a === b; ok &&= pass; console.log((pass ? 'ok  ' : 'FAIL') + ' ' + name + ': ' + a + (pass ? '' : ' expected ' + b)) }

// Figma level frames (medium, bet 5): after N wins -> AT RISK / NEXT / IF WON
let s = go(createInitialState(1), E.PLAY, E.ENTER_DONE)
check('balance after PLAY', s.balance, 35)
check('L0 atRisk', f(D(s).atRisk), '0.00'); check('L0 ifWon', f(D(s).ifWon), '6.00'); check('L0 canTake', D(s).canTake, false)
const exp = [['6.00','1.6','8.00'],['8.00','2.4','12.00'],['12.00','3.9','19.50'],['19.50','6.8','34.00'],['34.00','11.5','57.50'],['57.50','19','95.00']]
for (let i = 0; i < 6; i++) { s = fightWin(s); const d = D(s); check('L'+(i+1)+' atRisk', f(d.atRisk), exp[i][0]); check('L'+(i+1)+' next', String(d.nextMultiplier), exp[i][1]); check('L'+(i+1)+' ifWon', f(d.ifWon), exp[i][2]) }
check('L6 isBoss', D(s).isBoss, true)
// Block A: enemy per gate. Gates 1–5 vovkulak, 6 the old boss, 7 Baba Yaga (final).
{
  let r = go(createInitialState(1), E.PLAY, E.ENTER_DONE)
  const kinds = []
  for (let i = 0; i < 7; i++) { kinds.push(D(r).enemy); if (i < 6) r = fightWin(r) }
  check('enemy per gate', kinds.join(','), 'vovkulak,vovkulak,vovkulak,vovkulak,vovkulak,vovkulakBoss,babaYaga')
  check('only gate 7 is final', [0, 1, 2, 3, 4, 5, 6].map((p) => D({ ...r, passed: p, phase: STATES.DECISION }).isFinal).join(), 'false,false,false,false,false,false,true')
  // Winning gate 6 (the old boss) is a normal win: banner, round continues.
  let b = go(createInitialState(1), E.PLAY, E.ENTER_DONE); for (let i = 0; i < 5; i++) b = fightWin(b)
  check('gate 6 enemy', D(b).enemy, 'vovkulakBoss')
  b = go(b, { type: E.FORCE_NEXT, value: 'win' }, E.FIGHT, E.ANIM_DONE, E.ANIM_DONE)
  check('gate 6 win -> WIN_BANNER (round continues)', b.phase, STATES.WIN_BANNER)
  check('win banner shows the boss just beaten', D(b).enemy, 'vovkulakBoss')
  // Defeat pose by enemy: vovkulak and boss kill the hero, Baba Yaga cages him.
  check('defeat pose at gate 1', D(go(createInitialState(1), E.PLAY, E.ENTER_DONE)).heroDefeat, 'dead')
  check('defeat pose at gate 6', D({ ...b, phase: STATES.DECISION, passed: 5 }).heroDefeat, 'dead')
  const y = go({ ...r, phase: STATES.DECISION }, { type: E.FORCE_NEXT, value: 'lose' }, E.FIGHT, E.SKIP)
  check('lose to Baba Yaga -> DEFEAT, hero caged', y.phase + ' ' + D(y).heroDefeat, 'DEFEAT caged')
  // Path: only reached gates, the last one Current.
  check('path at L6', D({ ...r, passed: 6 }).path.reached.map((g) => g.state[0]).join(''), 'pppppc')
}
// Boss win -> MAX WIN +95, balance 130 (Figma 660:5112)
let m = go(s, { type: E.FORCE_NEXT, value: 'win' }, E.FIGHT, E.ANIM_DONE, E.ANIM_DONE)
check('boss -> MAX_WIN', m.phase, STATES.MAX_WIN); check('max win amount', f(m.lastResult.amount), '95.00'); check('balance after max win', m.balance, 130)
// Cash out at level 3 -> +12, balance 47 (Figma 474:2175)
let c = go(createInitialState(1), E.PLAY, E.ENTER_DONE); c = fightWin(fightWin(fightWin(c)))
c = go(c, E.TAKE); check('TAKE -> CASHED_OUT', c.phase, STATES.CASHED_OUT); check('cash out amount', f(c.lastResult.amount), '12.00'); check('balance 47', c.balance, 47)
// Victory banner delta L3 -> L4 = +7.50 (Figma 474:2008)
let v = go(createInitialState(1), E.PLAY, E.ENTER_DONE); v = fightWin(fightWin(fightWin(v)))
v = go(v, { type: E.FORCE_NEXT, value: 'win' }, E.FIGHT, E.ANIM_DONE, E.ANIM_DONE); check('victory delta', f(v.lastResult.amount), '7.50')
// Defeat -> bet lost, balance stays 35; NEW_ROUND keeps bet/difficulty
let d = go(createInitialState(1), E.PLAY, E.ENTER_DONE, { type: E.FORCE_NEXT, value: 'lose' }, E.FIGHT, E.SKIP)
check('SKIP -> DEFEAT', d.phase, STATES.DEFEAT); check('defeat balance', d.balance, 35)
d = go(d, { type: E.SET_DIFFICULTY, value: 'high' }); check('difficulty locked after round', d.difficulty, 'medium')
d = go(d, E.NEW_ROUND); check('NEW_ROUND -> SETUP', d.phase, STATES.SETUP); check('bet kept', d.bet, 5)
// Guards
let g = go(createInitialState(1), E.TAKE, E.FIGHT); check('FIGHT/TAKE ignored in SETUP', g.phase, STATES.SETUP)
g = go(createInitialState(1), E.PLAY, E.ENTER_DONE, { type: E.SET_BET, value: 10 }); check('bet locked in round', g.bet, 5)
g = go(createInitialState(1), E.PLAY, E.ENTER_DONE, E.TAKE); check('TAKE before first win ignored', g.phase, STATES.DECISION)
g = go({ ...createInitialState(1), balance: 3 }, E.PLAY); check('PLAY blocked when balance < bet', g.phase + ' ' + g.insufficientBalance, 'SETUP true')
g = go({ ...createInitialState(1), balance: 7 }, { type: E.SET_BET, value: 'max' }); check('MAX chip = min(maxBet, balance)', g.bet, 7)
// Determinism: same seed -> same outcomes
const run = (seed) => { let r = createInitialState(seed); const out = []; for (let i = 0; i < 30; i++) { r = go(r, E.PLAY, E.ENTER_DONE, E.FIGHT); out.push(r.outcome); r = go(r, E.SKIP, E.NEW_ROUND); r = { ...r, balance: 40 } } return out.join('') }
check('seed 123 deterministic', run(123), run(123)); check('different seeds differ', run(123) === run(456), false)
// Win rate sanity over many fights
for (const [k, p] of [['easy', .8], ['medium', .65], ['high', .45]]) { let r = { ...createInitialState(99), difficulty: k }; let w = 0; for (let i = 0; i < 20000; i++) { r = go({ ...r, phase: STATES.DECISION, passed: 0 }, E.FIGHT); if (r.outcome === 'win') w++ } console.log('     ' + k + ' win rate ' + (w / 20000).toFixed(3) + ' (target ' + p + ')') }
{ const e = D(m); check('MAX_WIN derived atRisk 0', e.atRisk, 0); check('MAX_WIN next null', e.nextMultiplier, null); check('MAX_WIN ifWon null', e.ifWon, null) }
{ const e = D(d.phase === STATES.SETUP ? go(createInitialState(1), E.PLAY, E.ENTER_DONE, { type: E.FORCE_NEXT, value: 'lose' }, E.FIGHT, E.SKIP) : d); check('DEFEAT next null', e.nextMultiplier, null) }
{ const e = D(createInitialState(1)); check('SETUP shows next x1.2 / ifWon 6 (474:2256)', e.nextMultiplier + '/' + e.ifWon, '1.2/6') }
{ check('maxWin delta (95 - 57.50)', f(m.lastResult.delta), '37.50'); check('maxWin from/to', m.lastResult.from + '→' + m.lastResult.to, '11.5→19'); check('balance before payout', D(m).balanceBeforePayout, 35); check('cashed to', c.lastResult.to, 2.4); check('cashed before payout', D(c).balanceBeforePayout, 35) }

// Demo seeds from docs/demo-seeds.md must keep their story.
{
  const fightOut = (seed, diff, n) => { let s = go(createInitialState(seed, diff), E.PLAY, E.SKIP); const out = []; for (let i = 0; i < n && s.phase === STATES.DECISION; i++) { s = go(s, E.FIGHT); out.push(s.outcome); s = go(s, E.SKIP); if (s.phase === STATES.WIN_BANNER) s = go(s, E.SKIP) } return { out, s } }
  const seeds = { easy: [4, 1, 3], medium: [2, 1, 13], high: [1, 52, 29] }
  for (const [diff, [defeat, cash3, boss]] of Object.entries(seeds)) {
    check(`demo ${diff} seed ${defeat}: first fight lost`, fightOut(defeat, diff, 1).out.join(), 'lose')
    check(`demo ${diff} seed ${cash3}: first 3 fights won`, fightOut(cash3, diff, 3).out.join(), 'win,win,win')
    check(`demo ${diff} seed ${boss}: boss beaten`, fightOut(boss, diff, 7).s.phase, STATES.MAX_WIN)
  }
}
// Block C+B: the exchange of blows (presentation only, ticket #93).
{
  const allowedX = { hero: [HOME.hero, HOME.hero + STEP], enemy: [HOME.enemy, HOME.enemy - STEP] }
  let bad = 0
  for (const seed of [1, 2, 13, 42, 99, 123, 2026]) {
    let s = go(createInitialState(seed), E.PLAY, E.ENTER_DONE, E.FIGHT)
    const n = exchangeCount(s.rngState)
    const script = fightScript({ outcome: s.outcome, exchanges: n, defeat: D(s).heroDefeat })
    const attacks = script.steps.filter((st) => st.hero?.pose === 'attack' && st.t === Math.round(st.t / 700) * 700 || st.enemy?.pose === 'attack' && st.t === Math.round(st.t / 700) * 700)
    const last = script.steps[script.steps.length - 1]
    const winner = s.outcome === 'win' ? 'hero' : 'enemy'
    const loser = winner === 'hero' ? 'enemy' : 'hero'
    const xs = script.steps.flatMap((st) => ['hero', 'enemy'].filter((w) => st[w]).map((w) => [w, st[w].x]))
    if (!(n === 2 || n === 3)) bad++
    if (last[winner].pose !== 'victory' || last[loser].pose !== 'dead') bad++
    if (last[winner].x !== allowedX[winner][1] || last[loser].x !== allowedX[loser][0]) bad++
    if (xs.some(([w, x]) => !allowedX[w].includes(x))) bad++
    if (script.duration < 2000 || script.duration > 4000) bad++
    // Same seed → same script; the game RNG is not advanced by the script.
    if (exchangeCount(s.rngState) !== n) bad++
    check(`fight script seed ${seed}: ${n} exchanges, final blow by ${winner}, ${script.duration} ms`, attacks.length >= n + 1, true)
  }
  check('fight scripts: 2–3 exchanges, winner ends on its step in Victory, loser down at home, only home/step x', bad, 0)
  // Baba Yaga cages the hero instead of killing him.
  const caged = fightScript({ outcome: 'lose', exchanges: 2, defeat: 'caged' })
  check('fight script vs Baba Yaga: hero caged at home', caged.steps[caged.steps.length - 1].hero.pose + '@' + caged.steps[caged.steps.length - 1].hero.x, 'caged@565')
}
console.log(ok ? 'ALL PASS' : 'SOME FAILED')
process.exitCode = ok ? 0 : 1
