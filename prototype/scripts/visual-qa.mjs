// Visual + money QA (Level 11).
//   npm run qa            (from prototype/)
// Builds the app, serves it with `vite preview`, drives it through the key
// states at 1920x1080 (?debug=1 exposes window.__casino), screenshots each one,
// checks money consistency and long tasks, and writes docs/qa/report.html with
// the matching Figma frame (docs/qa/figma/) next to every app screenshot.
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS_QA = join(ROOT, '..', 'docs', 'qa')
const APP_DIR = join(DOCS_QA, 'app')
const PORT = 4174
const BASE = `http://localhost:${PORT}/`

// State → Figma frame (file LXMHPQWUYxLjZiYVTfbx5X), saved in docs/qa/figma/.
const SHOTS = [
  ['01-setup', 'SETUP', '587:5125'],
  ['02-decision-l1', 'DECISION level 1', '472:7862'],
  ['03-decision-l2', 'DECISION level 2', '473:1037'],
  ['04-decision-l3', 'DECISION level 3', '473:1127'],
  ['05-decision-l4', 'DECISION level 4', '473:1217'],
  ['06-decision-l5', 'DECISION after 5 wins: gate 6, Vovkulak Boss (L6 reference)', '756:6539'],
  ['07-hero-attacks', 'Hero attacks (level 3)', '457:7257'],
  ['08-enemy-attacks', 'Enemy attacks (level 3)', '456:7095'],
  ['09-victory-banner', 'Victory banner L3 → L4', '474:2008'],
  ['10-defeat', 'Defeat after level 3', '474:2089'],
  ['11-cashed-out', 'Cashed out at level 3', '474:2175'],
  ['12-boss-entrance', 'Baba Yaga entrance (gate 7)', '843:6304'],
  ['13-max-win', 'Big Boss final MAX WIN popup', '819:6677'],
  ['14-boss-decision', 'Baba Yaga (gate 7) before FIGHT (L7 reference)', '748:6069'],
  ['15-yaga-hero-attacks', 'Knight attacks Baba Yaga (her Hit)', '843:6550'],
  ['16-yaga-attacks', 'Baba Yaga attacks (knight Hit)', '843:6674'],
  ['17-yaga-defeat', 'DEFEAT by Baba Yaga: knight caged, red light', '843:6912'],
]

const checks = []
const info = []
const check = (name, ok, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}
const MONEY = /^\d{1,3}(,\d{3})*\.\d{2}$/
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function startServer() {
  execSync('npm run build', { cwd: ROOT, stdio: 'ignore' })
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE)
      if (res.ok) return server
    } catch {
      // not up yet
    }
    await sleep(250)
  }
  server.kill()
  throw new Error('vite preview did not start')
}

// --- page helpers ----------------------------------------------------------
const phase = (page) => page.evaluate(() => window.__casino?.state.phase)
// Waits until the game is in `target` (a state name or a list of state names).
async function waitPhase(page, target, timeout = 12000) {
  const wanted = [target].flat()
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if (wanted.includes(await phase(page))) return
    await sleep(25)
  }
  throw new Error(`timeout waiting for ${wanted.join('|')} (now ${await phase(page)})`)
}
const act = (page, name, arg) => page.evaluate(([n, a]) => window.__casino.actions[n](a), [name, arg])
const text = (page, selector) => page.evaluate((s) => document.querySelector(s)?.textContent?.trim() ?? null, selector)
const slot = (page, label) => text(page, `[data-qa="slot-${label}"] > span:last-child`)
const cta = (page, label) =>
  page.evaluate((l) => {
    const b = [...document.querySelectorAll('.cta')].find((x) => x.querySelector('.cta__label')?.textContent === l)
    return b ? { amount: b.querySelector('.cta__amount')?.textContent ?? '', disabled: b.disabled } : null
  }, label)
const balance = (page) => page.evaluate(() => document.querySelector('[aria-label^="Balance"]').getAttribute('aria-label').replace('Balance ', ''))
const derived = (page) => page.evaluate(() => window.__casino.derived)
const toNum = (s) => Number(String(s).replace(/[^0-9.\-]/g, ''))

// Waits until the characters show the given poses (data-pose on the sprite wrappers).
async function waitPoses(page, hero, enemy, timeout = 20000) {
  await page.waitForFunction(
    ([h, e]) => document.querySelector('[data-qa="char-hero"]')?.dataset.pose === h && document.querySelector('[data-qa="char-enemy"]')?.dataset.pose === e,
    [hero, enemy],
    { timeout },
  )
}

// Slow motion for fight screenshots: page timers run 8x longer after slow(page),
// so a full-size screenshot (~1–2 s to render) lands on the step it waited for.
const slowInit = () => {
  const st = window.setTimeout
  window.__slow = 1
  window.setTimeout = (fn, ms = 0, ...a) => st(fn, ms * window.__slow, ...a)
}
const slow = (page) => page.evaluate(() => (window.__slow = 8))

async function open(browser, params = '') {
  // deviceScaleFactor 1: Chromium renders backdrop-filter mirrored below DPR 1,
  // so shots are taken at full size and downscaled to 960x540 afterwards.
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  await page.addInitScript(slowInit)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}?debug=1&difficulty=medium&seed=7${params}`)
  await page.waitForFunction(() => window.__casino && document.fonts.status === 'loaded')
  // Hide the debug panel in screenshots.
  await page.addStyleTag({ content: '.fixed.top-3{display:none!important}' })
  await sleep(1200)
  page.qaErrors = errors
  return page
}
// Screenshot at 1920x1080, downscaled to 960x540 JPEG in a separate helper page
// so the game page's main thread is not disturbed (no image tooling needed).
let helper
async function shot(page, name) {
  const png = (await page.screenshot({ type: 'png' })).toString('base64')
  const jpeg = await helper.evaluate(async (data) => {
    const img = new Image()
    img.src = `data:image/png;base64,${data}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 960
    canvas.height = 540
    canvas.getContext('2d').drawImage(img, 0, 0, 960, 540)
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
  }, png)
  writeFileSync(join(APP_DIR, `${name}.jpg`), Buffer.from(jpeg, 'base64'))
}

// Start a round and win `levels` fights, skipping animations; ends in DECISION.
async function playToLevel(page, levels) {
  await act(page, 'play')
  await waitPhase(page, 'ENTERING')
  await act(page, 'skip')
  await waitPhase(page, 'DECISION')
  for (let i = 0; i < levels; i++) await winOne(page)
}

// One forced win, skipped to the next DECISION. Waits on the gate count rather
// than on the short-lived WIN_BANNER state, so slow machines cannot miss it.
async function winOne(page) {
  const passed = await page.evaluate(() => window.__casino.state.passed)
  await act(page, 'forceNext', 'win')
  await act(page, 'fight')
  await page.waitForFunction((p) => window.__casino.state.passed > p, passed, { timeout: 12000 })
  while ((await phase(page)) !== 'DECISION') {
    await act(page, 'skip')
    await sleep(40)
  }
}

// Money checks on a DECISION screen (after count-ups settle).
async function decisionMoney(page, level) {
  await sleep(900)
  const d = await derived(page)
  const atRisk = await slot(page, 'AT RISK')
  const ifWon = await slot(page, 'IF WON')
  const counter = await text(page, '[data-qa="counter-win"]')
  const take = await cta(page, 'TAKE')
  const fight = await cta(page, 'FIGHT')
  check(`L${level}: AT RISK (dock) = WIN (counter)`, atRisk === counter, `${atRisk} vs ${counter}`)
  check(`L${level}: AT RISK = game value`, toNum(atRisk) === d.atRisk, `${atRisk} vs ${d.atRisk}`)
  if (level > 0) check(`L${level}: TAKE amount = AT RISK`, take.amount === atRisk, `${take.amount} vs ${atRisk}`)
  else check('L0: TAKE disabled before the first win', take.disabled && take.amount === '—')
  check(`L${level}: IF WON = FIGHT amount`, fight.amount === `up to ${ifWon}`, `${fight.amount} vs ${ifWon}`)
  for (const [n, v] of [['AT RISK', atRisk], ['IF WON', ifWon], ['WIN', counter]]) check(`L${level}: ${n} has 2 decimals`, MONEY.test(v), v)
}

async function run() {
  mkdirSync(APP_DIR, { recursive: true })
  const server = await startServer()
  const browser = await chromium.launch()
  helper = await browser.newPage()
  const longTasks = []
  const mounts = []
  const allErrors = []
  try {
    // 01–06: setup and decision levels 1–5 (one round), with money checks.
    let page = await open(browser)
    await shot(page, '01-setup')
    // Block H: the debug panel shows p^n × m_n per gate (Medium: 0.65 × 1.20 = 78.0 %).
    const rtp = await page.evaluate(() => [...document.querySelectorAll('[data-qa="debug-rtp"] > span')].map((s) => s.textContent.trim()))
    check('Debug panel: effective RTP for all 7 gates (g1 = 78.0 %)', rtp.length === 7 && rtp[0] === 'g1 78.0%' && rtp[6] === 'g7 93.1%', rtp.join(' '))
    const balanceStart = toNum(await balance(page))
    await playToLevel(page, 0)
    await decisionMoney(page, 0)
    check('Balance after PLAY = start − bet', toNum(await balance(page)) === balanceStart - 5, await balance(page))
    for (let level = 1; level <= 5; level++) {
      await winOne(page)
      await decisionMoney(page, level)
      if (level === 1) {
        // Block A: the path shows only the reached gates (decision 18.10).
        const gatesShown = await page.evaluate(() => document.querySelectorAll('[role="list"][aria-label^="Gates passed"] [role="listitem"]').length)
        check('L1: path shows only the reached gate', gatesShown === 1, String(gatesShown))
        const d = await derived(page)
        // Plate/Multiplier 554:4220: text only, over the vovkulak's head (L3 reference 756:6778: 1193,360).
        const plate = await page.evaluate(() => {
          const el = document.querySelector('[data-qa="plate-multiplier"]')
          return { x: el.offsetLeft, y: el.offsetTop, text: el.textContent.trim(), images: el.querySelectorAll('img').length }
        })
        check('L1: plate is text only (no plate art)', plate.images === 0 && plate.text === `×${d.nextMultiplier.toFixed(2)}`, plate.text)
        check('L1: plate over the vovkulak at 1193,360 (Figma 756:6778)', plate.x === 1193 && plate.y === 360, `${plate.x},${plate.y}`)
      }
      if (level === 5) {
        // Block A: gate 6 is the vovkulak boss, a normal fight (no MAX WIN labels).
        const d = await derived(page)
        const label = await text(page, '[data-qa="slot-IF WON"] > span:first-child')
        const plate = await page.evaluate(() => { const el = document.querySelector('[data-qa="plate-multiplier"]'); return { x: el.offsetLeft, y: el.offsetTop } })
        check('L5: gate 6 enemy is the vovkulak boss, not final', d.enemy === 'vovkulakBoss' && d.isFinal === false, `${d.enemy} final=${d.isFinal}`)
        check('L5: dock still reads IF WON on gate 6', label === 'IF WON', label)
        check('L5: plate over the boss at 1201,327 (Figma 756:6539)', plate.x === 1201 && plate.y === 327, `${plate.x},${plate.y}`)
      }
      await shot(page, `0${level + 1}-decision-l${level}`)
    }
    allErrors.push(...page.qaErrors)
    await page.close()

    // Gate 6 boss intro: "BOSS BATTLE · ×11.50" before the boss enters (no MAX WIN), FIGHT glows.
    page = await open(browser)
    await playToLevel(page, 4)
    await act(page, 'forceNext', 'win')
    await act(page, 'fight')
    await act(page, 'skip')
    await waitPhase(page, 'WIN_BANNER')
    await waitPhase(page, 'ENTERING', 4000)
    await sleep(300)
    const bossBanner = await text(page, '[data-qa="boss-banner"]')
    check('Gate 6 boss intro banner: BOSS BATTLE · ×11.50, no MAX WIN', !!bossBanner && bossBanner.includes('BOSS BATTLE') && bossBanner.includes('×11.50') && !bossBanner.includes('MAX WIN'), bossBanner ?? 'missing')
    await act(page, 'skip')
    await waitPhase(page, 'DECISION')
    await sleep(500)
    const gate6Glow = await page.evaluate(() => [...document.querySelectorAll('.cta')].find((x) => x.querySelector('.cta__label')?.textContent === 'FIGHT')?.hasAttribute('data-highlight'))
    check('Gate 6: FIGHT uses Highlight (boss)', gate6Glow === true)
    allErrors.push(...page.qaErrors)
    await page.close()

    // Block C+B: the exchange of blows (ticket #93). For a fixed seed: 2–3 exchanges,
    // the final blow by the winner, and no sprite jumps (sampled every frame).
    for (const outcome of ['win', 'lose']) {
      page = await open(browser)
      await playToLevel(page, 2)
      await act(page, 'forceNext', outcome)
      // Every x change of a sprite must happen through a CSS transform transition
      // (a slide), never as an instant jump; shadows always sit on the y750 line.
      const samples = page.evaluate(() => new Promise((resolve) => {
        const moves = []
        let fight = null
        let yOff = 0
        const shadowY = (el) => {
          const sh = el.querySelector('.char-shadow').getBoundingClientRect()
          const stage = el.offsetParent.getBoundingClientRect()
          return (sh.top + sh.height / 2 - stage.top) / (stage.width / 1920)
        }
        const obs = new MutationObserver((list) => {
          for (const m of list) {
            const el = m.target
            if (m.attributeName !== 'data-x' || m.oldValue === el.dataset.x) continue
            const tr = el.style.transition
            const ms = Number((tr.match(/transform (\d+)ms/) || [0, 0])[1])
            moves.push({ who: el.dataset.qa, from: +m.oldValue, to: +el.dataset.x, ms })
          }
        })
        obs.observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-x'] })
        const t0 = performance.now()
        const tick = () => {
          fight = window.__casino.fight ?? fight
          for (const q of ['char-hero', 'char-enemy']) {
            const el = document.querySelector(`[data-qa="${q}"]`)
            if (el) yOff = Math.max(yOff, Math.abs(shadowY(el) - 750))
          }
          if (['WIN_BANNER', 'DEFEAT'].includes(window.__casino.state.phase) || performance.now() - t0 > 8000) {
            obs.disconnect()
            resolve({ moves, fight, yOff })
          } else setTimeout(tick, 16)
        }
        tick()
      }))
      await act(page, 'fight')
      const { moves, fight: script, yOff } = await samples
      const winner = outcome === 'win' ? 'hero' : 'enemy'
      const last = script?.steps[script.steps.length - 1]
      check(`Fight (${outcome}): 2–3 exchanges, final blow by the ${winner}`, !!script && [2, 3].includes(script.exchanges) && script.winner === winner && last[winner].pose === 'victory', script ? `${script.exchanges} exchanges, winner ${script.winner}` : 'no script')
      const jumps = moves.filter((m) => m.ms < 150)
      check(`Fight (${outcome}): no sprite jumps — every move slides (≥150 ms), shadows on y750 ±4`, moves.length >= 4 && jumps.length === 0 && yOff <= 4, `${moves.length} moves, ${jumps.length} jumps${jumps[0] ? ` (${jumps[0].who} ${jumps[0].from}→${jumps[0].to})` : ''}, y off ${yOff.toFixed(1)} px`)
      allErrors.push(...page.qaErrors)
      await page.close()
    }

    // Block D: Baba Yaga (gate 7). Her sprites, the cage light that follows the cage,
    // and the caged knight + red light when she wins.
    page = await open(browser)
    await playToLevel(page, 6)
    await act(page, 'forceNext', 'win')
    await slow(page)
    await act(page, 'fight')
    await waitPoses(page, 'attack', 'hit')
    await shot(page, '15-yaga-hero-attacks')
    const light = await page.evaluate(() => {
      const l = document.querySelector('[data-qa="char-light"]'), e = document.querySelector('[data-qa="char-enemy"]')
      return { has: !!l, follows: !!l && l.style.transform === e.style.transform, src: l?.querySelector('img').getAttribute('src') }
    })
    check('Baba Yaga: cage light is on and follows her (same x as the enemy)', light.has && light.follows && light.src.endsWith('cage-light.webp'), JSON.stringify(light))
    allErrors.push(...page.qaErrors)
    await page.close()

    page = await open(browser)
    await playToLevel(page, 6)
    await act(page, 'forceNext', 'lose')
    await slow(page)
    await act(page, 'fight')
    await waitPoses(page, 'hit', 'attack')
    await shot(page, '16-yaga-attacks')
    await waitPhase(page, 'DEFEAT', 60000)
    await waitPoses(page, 'caged', 'victory')
    await sleep(600)
    await shot(page, '17-yaga-defeat')
    const defeat = await page.evaluate(() => ({
      hero: document.querySelector('[data-qa="char-hero"]').dataset.pose,
      enemyX: document.querySelector('[data-qa="char-enemy"]').dataset.x,
      red: !!document.querySelector('[data-qa="red-light"]'),
      cage: document.querySelector('[data-qa="char-light"] img')?.getAttribute('src'),
    }))
    check('DEFEAT by Baba Yaga: knight caged at home, she wins on her step 1180', defeat.hero === 'caged' && defeat.enemyX === '1180', JSON.stringify(defeat))
    check('DEFEAT by Baba Yaga: red defeat light on, cage light turns red', defeat.red && (defeat.cage ?? '').endsWith('cage-light-red.webp'), JSON.stringify(defeat))
    allErrors.push(...page.qaErrors)
    await page.close()

    // 07: hero attacks at level 3 (real animation), with long-task observer.
    page = await open(browser)
    await playToLevel(page, 3)
    await act(page, 'forceNext', 'win')
    await slow(page)
    await act(page, 'fight')
    // First blow of the exchange: knight on his step in Attack, vovkulak Hit at home (457:7257).
    await waitPoses(page, 'attack', 'hit')
    await shot(page, '07-hero-attacks')
    allErrors.push(...page.qaErrors)
    await page.close()

    // Performance: a full round start, two fights and a next-enemy entrance with
    // real animations and no screenshots, observing long tasks (> 50 ms).
    page = await open(browser)
    // Wait until the setup scene (bg + focus lights) has mounted before measuring.
    await page.waitForFunction(() => performance.getEntriesByType('measure').some((m) => m.name.includes('bg_scene')), null, { timeout: 15000 })
    await page.evaluate(() => {
      window.__long = []
      new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ type: 'longtask' })
      // Only clips mounted during the round count (bg_scene mounts once at page load).
      performance.clearMeasures()
    })
    await act(page, 'play')
    await waitPhase(page, 'DECISION')
    for (const outcome of ['win', 'lose']) {
      await act(page, 'forceNext', outcome)
      await act(page, 'fight')
      await waitPhase(page, ['FIGHTING', 'RESOLVING'])
      await waitPhase(page, outcome === 'win' ? 'DECISION' : 'DEFEAT', 15000)
    }
    await sleep(500)
    longTasks.push(...(await page.evaluate(() => window.__long)))
    mounts.push(
      ...(await page.evaluate(() =>
        performance.getEntriesByType('measure').filter((m) => m.name.startsWith('lottie mount')).map((m) => ({ name: m.name.split('/').pop(), ms: m.duration })),
      )),
    )
    allErrors.push(...page.qaErrors)
    await page.close()

    // 08: enemy attacks at level 3.
    page = await open(browser)
    await playToLevel(page, 3)
    await act(page, 'forceNext', 'lose')
    await slow(page)
    await act(page, 'fight')
    // The vovkulak answers: enemy on its step in Attack, knight Hit at home (456:7095).
    await waitPoses(page, 'hit', 'attack')
    await shot(page, '08-enemy-attacks')
    allErrors.push(...page.qaErrors)
    await page.close()

    // 09: victory banner L3 → L4.
    page = await open(browser)
    await playToLevel(page, 3)
    await act(page, 'forceNext', 'win')
    await act(page, 'fight')
    await act(page, 'skip')
    await waitPhase(page, 'WIN_BANNER')
    await sleep(800)
    const bannerAmount = await text(page, '[data-qa="banner-amount"]')
    await shot(page, '09-victory-banner')
    check('Victory banner = AT RISK growth (19.50 − 12.00)', bannerAmount === '+7.50', bannerAmount)
    allErrors.push(...page.qaErrors)
    await page.close()

    // 10: defeat after level 3 (banner, then modal).
    page = await open(browser)
    const balanceBeforeDefeat = toNum(await balance(page))
    await playToLevel(page, 3)
    await act(page, 'forceNext', 'lose')
    await act(page, 'fight')
    await act(page, 'skip')
    await waitPhase(page, 'DEFEAT')
    await sleep(2200)
    await shot(page, '10-defeat')
    check('Defeat popup = −bet', (await text(page, '[data-qa="popup-amount"]')) === '−5.00')
    check('Defeat: balance = before − bet', toNum(await balance(page)) === balanceBeforeDefeat - 5, await balance(page))
    allErrors.push(...page.qaErrors)
    await page.close()

    // 11: cashed out at level 3.
    page = await open(browser)
    const balanceBeforeCash = toNum(await balance(page))
    await playToLevel(page, 3)
    await sleep(900)
    const takeAmount = (await cta(page, 'TAKE')).amount
    const atRiskAtTake = await slot(page, 'AT RISK')
    await act(page, 'take')
    await waitPhase(page, 'CASHED_OUT')
    await sleep(1200)
    await shot(page, '11-cashed-out')
    const popup = await text(page, '[data-qa="popup-amount"]')
    check('Cashed out popup = TAKE amount = AT RISK', popup === `+${takeAmount}` && takeAmount === atRiskAtTake, `${popup} / ${takeAmount} / ${atRiskAtTake}`)
    check('Cashed out: balance = before − bet + payout', toNum(await balance(page)) === balanceBeforeCash - 5 + toNum(takeAmount), await balance(page))
    allErrors.push(...page.qaErrors)
    await page.close()

    // 12–13: boss entrance and MAX WIN.
    page = await open(browser)
    const balanceBeforeBoss = toNum(await balance(page))
    await playToLevel(page, 5)
    await act(page, 'forceNext', 'win')
    await act(page, 'fight')
    await act(page, 'skip')
    await waitPhase(page, 'WIN_BANNER')
    await waitPhase(page, 'ENTERING', 4000)
    // L12: "FINAL BATTLE · MAX WIN ×19.00" banner first, then the boss enters.
    await sleep(300)
    const finalBanner = await text(page, '[data-qa="boss-banner"]')
    const bossDerived = await derived(page)
    check('Baba Yaga intro banner shows FINAL BATTLE and the final multiplier', !!finalBanner && finalBanner.includes('FINAL BATTLE') && finalBanner.includes(`×${bossDerived.finalMultiplier.toFixed(2)}`), finalBanner ?? 'missing')
    await sleep(2300)
    await shot(page, '12-boss-entrance')
    await waitPhase(page, 'DECISION')
    await sleep(900)
    await shot(page, '14-boss-decision')
    const ifWonBoss = await slot(page, 'IF WON')
    const bossLabel = await text(page, '[data-qa="slot-IF WON"] > span:first-child')
    const bossFight = await cta(page, 'FIGHT')
    const bossPlate = await text(page, '[data-qa="plate-multiplier"]')
    const bossPlateBox = await page.evaluate(() => { const el = document.querySelector('[data-qa="plate-multiplier"]'); return { x: el.offsetLeft, y: el.offsetTop } })
    const fightGlows = await page.evaluate(() => [...document.querySelectorAll('.cta')].find((x) => x.querySelector('.cta__label')?.textContent === 'FIGHT')?.hasAttribute('data-highlight'))
    check('Baba Yaga: dock label reads MAX WIN', bossLabel === 'MAX WIN', bossLabel)
    check('Baba Yaga: FIGHT reads "max win" = MAX WIN slot', bossFight.amount === `max win ${ifWonBoss}`, `${bossFight.amount} vs ${ifWonBoss}`)
    check('Baba Yaga: FIGHT uses Highlight', fightGlows === true)
    check('Baba Yaga: plate shows only the final multiplier', bossPlate === `×${bossDerived.finalMultiplier.toFixed(2)}`, bossPlate)
    check('Baba Yaga: plate over her head at 1247,306 (Figma 748:6069)', bossPlateBox.x === 1247 && bossPlateBox.y === 306, `${bossPlateBox.x},${bossPlateBox.y}`)
    check('Baba Yaga: gate 7 enemy is final', bossDerived.enemy === 'babaYaga' && bossDerived.isFinal === true, `${bossDerived.enemy} final=${bossDerived.isFinal}`)
    await act(page, 'forceNext', 'win')
    await act(page, 'fight')
    await act(page, 'skip')
    await waitPhase(page, 'MAX_WIN')
    const balanceDuringBanner = toNum(await balance(page))
    await sleep(2800)
    await shot(page, '13-max-win')
    const maxPopup = await text(page, '[data-qa="popup-amount"]')
    check('MAX WIN popup = IF WON before the boss fight', maxPopup === `+${ifWonBoss}`, `${maxPopup} vs ${ifWonBoss}`)
    check('MAX WIN: balance unchanged until the popup shows', balanceDuringBanner === balanceBeforeBoss - 5, String(balanceDuringBanner))
    check('MAX WIN: balance = before − bet + payout', toNum(await balance(page)) === balanceBeforeBoss - 5 + toNum(maxPopup), await balance(page))
    allErrors.push(...page.qaErrors)
    await page.close()

    // Headless Chromium paints with SwiftShader (software GL), so frame/long-task
    // numbers here are render-bound and not representative. The automated gate
    // is the JS cost we control: cloning + building each Lottie clip. Real fps /
    // long tasks are checked in Chrome on a MacBook (docs/qa/checklist.md).
    const worstMount = mounts.reduce((w, m) => (m.ms > w.ms ? m : w), { ms: 0, name: '—' })
    // Block C+B: characters are sprites, so a round mounts no character Lottie at all.
    check('Lottie clip mount during a round (JS) < 100 ms each (roadmap long-task target)', worstMount.ms < 100, mounts.length ? `${mounts.length} mounts, worst ${Math.round(worstMount.ms)} ms (${worstMount.name})` : 'no Lottie mounted during the round (characters are sprites)')
    const maxLong = longTasks.length ? Math.round(Math.max(...longTasks)) : 0
    info.push(`Headless (software GL) long tasks during the perf round: ${longTasks.length}, max ${maxLong} ms. Not a gate; see checklist for real-GPU numbers.`)
    check('No page errors or console errors', allErrors.length === 0, allErrors.slice(0, 3).join(' | '))
  } finally {
    await browser.close()
    server.kill()
  }
  writeReport()
  const failed = checks.filter((c) => !c.ok).length
  console.log(`\n${checks.length - failed}/${checks.length} checks passed. Report: docs/qa/report.html`)
  process.exitCode = failed ? 1 : 0
}

function writeReport() {
  const rows = SHOTS.map(
    ([file, label, node]) => `
    <section>
      <h2>${label} <code>${node}</code></h2>
      <div class="row" data-file="${file}">
        <figure><img src="figma/${file}.jpg" alt="Figma ${label}"><figcaption>Figma</figcaption></figure>
        <figure><img src="app/${file}.jpg" alt="App ${label}"><figcaption>App</figcaption></figure>
        <figure><canvas width="960" height="540"></canvas><figcaption>Difference (black = identical)</figcaption></figure>
      </div>
    </section>`,
  ).join('')
  const checkRows = checks
    .map((c) => `<tr class="${c.ok ? 'ok' : 'bad'}"><td>${c.ok ? 'PASS' : 'FAIL'}</td><td>${c.name}</td><td>${c.detail}</td></tr>`)
    .join('')
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Casino Game · QA report</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 24px; background: #111; color: #e9dcc0; font: 14px/1.4 ui-sans-serif, system-ui, sans-serif; }
  h1 { margin: 0 0 4px; } h2 { font-size: 16px; margin: 32px 0 8px; } code { color: #a89c86; }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  figure { margin: 0; } img, canvas { width: 100%; height: auto; display: block; background: #000; }
  figcaption { color: #a89c86; font-size: 12px; margin-top: 4px; }
  table { border-collapse: collapse; margin-top: 12px; } td { padding: 4px 10px; border-bottom: 1px solid #333; vertical-align: top; }
  tr.ok td:first-child { color: #3fe0d0; } tr.bad td:first-child { color: #f05a5a; font-weight: bold; }
</style></head><body>
<h1>Casino Game · visual QA</h1>
<p>Generated ${new Date().toISOString()} by <code>prototype/scripts/visual-qa.mjs</code> · app at 1920×1080 (shown at 960×540) · Figma file LXMHPQWUYxLjZiYVTfbx5X.
Animated frames (attacks, boss entrance) will differ slightly: judge layout, UI and numbers. Character art comes from Lottie, so poses differ from the static Figma frames.</p>
<h2>Money and runtime checks: ${checks.filter((c) => c.ok).length}/${checks.length} passed</h2>
<table>${checkRows}</table>
${info.map((i) => `<p><code>info</code> ${i}</p>`).join('')}
${rows}
<script>
  // Pixel difference computed in the browser (no extra tooling): |figma − app| per channel.
  for (const row of document.querySelectorAll('.row')) {
    const [fig, app] = row.querySelectorAll('img');
    const canvas = row.querySelector('canvas');
    const draw = () => {
      if (!fig.complete || !app.complete) return;
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(fig, 0, 0, 960, 540);
      ctx.globalCompositeOperation = 'difference';
      ctx.drawImage(app, 0, 0, 960, 540);
    };
    fig.onload = app.onload = draw; draw();
  }
</script>
</body></html>`
  writeFileSync(join(DOCS_QA, 'report.html'), html)
  writeFileSync(join(DOCS_QA, 'results.json'), JSON.stringify({ generated: new Date().toISOString(), checks, info }, null, 2))
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
