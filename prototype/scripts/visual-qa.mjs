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
  ['06-decision-l5', 'DECISION level 5', '473:1307'],
  ['07-hero-attacks', 'Hero attacks (level 3)', '457:7257'],
  ['08-enemy-attacks', 'Enemy attacks (level 3)', '456:7095'],
  ['09-victory-banner', 'Victory banner L3 → L4', '474:2008'],
  ['10-defeat', 'Defeat after level 3', '474:2089'],
  ['11-cashed-out', 'Cashed out at level 3', '474:2175'],
  ['12-boss-entrance', 'Boss entrance', '650:7598'],
  ['13-max-win', 'Boss final MAX WIN popup', '660:5112'],
  ['14-boss-decision', 'Boss level before FIGHT', '473:1397'],
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

async function open(browser, params = '') {
  // deviceScaleFactor 1: Chromium renders backdrop-filter mirrored below DPR 1,
  // so shots are taken at full size and downscaled to 960x540 afterwards.
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
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
    const balanceStart = toNum(await balance(page))
    await playToLevel(page, 0)
    await decisionMoney(page, 0)
    check('Balance after PLAY = start − bet', toNum(await balance(page)) === balanceStart - 5, await balance(page))
    for (let level = 1; level <= 5; level++) {
      await winOne(page)
      await decisionMoney(page, level)
      if (level === 1) {
        // L12: the boss gate is always on the path, locked, with the fights left.
        const finalGate = await page.evaluate(() => document.querySelector('[role="list"][aria-label^="Gates passed"]')?.lastElementChild?.lastElementChild?.textContent?.trim() ?? '')
        const d = await derived(page)
        check('L1: path ends with the locked boss gate (final multiplier)', finalGate === `×${d.finalMultiplier.toFixed(2)}`, finalGate)
        // Plate/Multiplier 554:4220: text only, x1217, 60 px below Counter/Win (y330).
        const plate = await page.evaluate(() => {
          const el = document.querySelector('[data-qa="plate-multiplier"]')
          // Stage coordinates (offsetLeft/Top ignore the stage scale and letterbox).
          return { x: el.offsetLeft, y: el.offsetTop, text: el.textContent.trim(), images: el.querySelectorAll('img').length }
        })
        check('L1: plate is text only (no plate art)', plate.images === 0 && plate.text === `×${d.nextMultiplier.toFixed(2)}`, plate.text)
        check('L1: plate at x1217, 60 px below Counter/Win (y330)', plate.x === 1217 && plate.y === 330, `${plate.x},${plate.y}`)
      }
      await shot(page, `0${level + 1}-decision-l${level}`)
    }
    allErrors.push(...page.qaErrors)
    await page.close()

    // 07: hero attacks at level 3 (real animation), with long-task observer.
    page = await open(browser)
    await playToLevel(page, 3)
    await act(page, 'forceNext', 'win')
    await act(page, 'fight')
    await sleep(200)
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
    await act(page, 'fight')
    await sleep(220)
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
    const finalBanner = await text(page, '[data-qa="final-banner"]')
    const bossDerived = await derived(page)
    check('Boss intro banner shows FINAL BATTLE and the final multiplier', !!finalBanner && finalBanner.includes('FINAL BATTLE') && finalBanner.includes(`×${bossDerived.finalMultiplier.toFixed(2)}`), finalBanner ?? 'missing')
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
    check('Boss level: dock label reads MAX WIN', bossLabel === 'MAX WIN', bossLabel)
    check('Boss level: FIGHT reads "max win" = MAX WIN slot', bossFight.amount === `max win ${ifWonBoss}`, `${bossFight.amount} vs ${ifWonBoss}`)
    check('Boss level: FIGHT uses Highlight', fightGlows === true)
    check('Boss level: plate shows only the final multiplier', bossPlate === `×${bossDerived.finalMultiplier.toFixed(2)}`, bossPlate)
    check('Boss level: plate at x1217, 30 px below Counter/Win (y300)', bossPlateBox.x === 1217 && bossPlateBox.y === 300, `${bossPlateBox.x},${bossPlateBox.y}`)
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
    check('Lottie clip mount during a round (JS) < 100 ms each (roadmap long-task target)', mounts.length > 0 && worstMount.ms < 100, `${mounts.length} mounts, worst ${Math.round(worstMount.ms)} ms (${worstMount.name})`)
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
