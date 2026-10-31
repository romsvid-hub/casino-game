// Cross-browser smoke QA (Level 11). Run: npm run qa:smoke
// Chromium, Firefox and WebKit (Safari's engine) via Playwright: window sizes,
// keyboard-only round, Skip in every animation state, click spam on FIGHT/TAKE,
// refresh mid-round, Rules/Menu, /kit. Writes docs/qa/smoke.json.
import { spawn, execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, firefox, webkit } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4177
const BASE = `http://localhost:${PORT}/`
const SIZES = [
  [1280, 720],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
let current = ''
const check = (name, ok, detail = '') => {
  results.push({ browser: current, name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${current}] ${name}${detail ? '  — ' + detail : ''}`)
}

async function startServer() {
  execSync('npm run build', { cwd: ROOT, stdio: 'ignore' })
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return server
    } catch {
      // not up yet
    }
    await sleep(250)
  }
  server.kill()
  throw new Error('vite preview did not start')
}

const phase = (page) => page.evaluate(() => window.__casino?.state.phase)
const game = (page) => page.evaluate(() => ({ ...window.__casino.state, atRisk: window.__casino.derived.atRisk }))
async function waitPhase(page, target, timeout = 15000) {
  const wanted = [target].flat()
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if (wanted.includes(await phase(page))) return true
    await sleep(25)
  }
  return false
}
// Waits until the game leaves `from` and returns the new state name.
async function leave(page, from, timeout = 4000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    const p = await phase(page)
    if (p !== from) return p
    await sleep(15)
  }
  return from
}

async function openPage(browser, params, size = [1920, 1080], errors = []) {
  const page = await browser.newPage({ viewport: { width: size[0], height: size[1] } })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}${params}`)
  await page.waitForFunction(() => document.querySelector('[style*="scale("]'))
  await sleep(800)
  return page
}

async function sizes(browser) {
  for (const size of SIZES) {
    const errors = []
    const page = await openPage(browser, '?seed=1&difficulty=medium', size, errors)
    const r = await page.evaluate(() => {
      const el = document.querySelector('[style*="scale("]').getBoundingClientRect()
      return { w: el.width, h: el.height, left: el.left, top: el.top, vw: innerWidth, vh: innerHeight, debug: !!document.querySelector('.fixed.top-3') }
    })
    const ratio = r.w / r.h
    const inside = r.left >= -0.5 && r.top >= -0.5 && r.left + r.w <= r.vw + 0.5 && r.top + r.h <= r.vh + 0.5
    const fills = Math.abs(r.w - r.vw) < 1 || Math.abs(r.h - r.vh) < 1
    const centered = Math.abs(r.left - (r.vw - r.w - r.left)) < 1 && Math.abs(r.top - (r.vh - r.h - r.top)) < 1
    check(`${size[0]}x${size[1]}: stage 16:9, uncropped, centered, fills one side`, Math.abs(ratio - 16 / 9) < 0.01 && inside && fills && centered, `${Math.round(r.w)}x${Math.round(r.h)} at ${Math.round(r.left)},${Math.round(r.top)}`)
    if (size[0] === 1920) check('No debug panel without ?debug=1', !r.debug)
    check(`${size[0]}x${size[1]}: no errors on load`, errors.length === 0, errors[0] ?? '')
    await page.close()
  }
}

async function keyboardRound(browser) {
  const errors = []
  const page = await openPage(browser, '?debug=1&seed=1&difficulty=medium', [1920, 1080], errors)
  await page.evaluate(() => document.activeElement?.blur())
  const start = await game(page)
  await page.keyboard.press('Enter')
  check('Keyboard: Enter starts the round (PLAY)', await waitPhase(page, 'ENTERING', 3000))
  for (const [state, next] of [
    ['ENTERING', 'DECISION'],
    ['DECISION', null],
  ]) {
    if (next) {
      await page.keyboard.press('s')
      check(`Skip in ${state} → ${next}`, await waitPhase(page, next, 2000))
    }
  }
  // Three fights (seed 1 wins three), skipping every animation state with S.
  // A slow engine may already be in RESOLVING (impact at 0.27 s) when S lands; both skip to the result.
  let skipOk = true
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Space')
    const fighting = await leave(page, 'DECISION')
    if (!['FIGHTING', 'RESOLVING'].includes(fighting)) skipOk = false
    await page.keyboard.press('s') // FIGHTING / RESOLVING → WIN_BANNER
    if (!(await waitPhase(page, 'WIN_BANNER', 3000))) skipOk = false
    await page.keyboard.press('s') // WIN_BANNER → DECISION
    if (!(await waitPhase(page, 'DECISION', 3000))) skipOk = false
  }
  check('Keyboard: Space = FIGHT, S skips FIGHTING and WIN_BANNER (3 wins)', skipOk && (await game(page)).passed === 3)
  // RESOLVING skip: fight then wait for RESOLVING, then S.
  await page.keyboard.press('Space')
  await waitPhase(page, 'RESOLVING', 3000)
  const fromResolving = await phase(page)
  await page.keyboard.press('s')
  const afterResolving = await leave(page, fromResolving)
  check('Skip in RESOLVING jumps to the result', fromResolving === 'RESOLVING' && ['WIN_BANNER', 'DEFEAT', 'MAX_WIN'].includes(afterResolving), `${fromResolving} → ${afterResolving}`)
  if (afterResolving === 'WIN_BANNER') {
    await page.keyboard.press('s')
    await waitPhase(page, 'DECISION', 2000)
    await page.keyboard.press('t')
    check('Keyboard: T = TAKE', await waitPhase(page, 'CASHED_OUT', 2000))
  }
  // Result popup (DEFEAT shows its banner for 1.5 s first): NEW ROUND is focused; Enter presses it.
  await page.waitForSelector('[role=dialog]', { timeout: 4000 }).catch(() => {})
  await sleep(300)
  const focused = await page.evaluate(() => document.activeElement?.querySelector?.('.cta__label')?.textContent)
  await page.keyboard.press('Escape')
  const stillOpen = await page.evaluate(() => !!document.querySelector('[role=dialog]'))
  await page.keyboard.press('Enter')
  check('Result popup: NEW ROUND focused, Esc ignored, Enter = NEW ROUND', focused === 'NEW ROUND' && stillOpen && (await waitPhase(page, 'SETUP', 2000)), `focused ${focused}`)
  const end = await game(page)
  check('Keyboard round: same bet and difficulty kept', end.bet === start.bet && end.difficulty === start.difficulty)
  check('Keyboard round: no errors', errors.length === 0, errors[0] ?? '')
  await page.close()
}

async function spamAndRefresh(browser) {
  const errors = []
  const page = await openPage(browser, '?debug=1&seed=1&difficulty=medium', [1920, 1080], errors)
  const cta = (label) => page.locator('.cta', { has: page.locator('.cta__label', { hasText: new RegExp(`^${label}$`) }) }).first()
  await page.evaluate(() => window.__casino.actions.play())
  await waitPhase(page, 'DECISION')
  const before = await game(page)
  // Spam FIGHT: only one fight may start.
  for (let i = 0; i < 6; i++) await cta('FIGHT').click({ force: true, noWaitAfter: true }).catch(() => {})
  await waitPhase(page, ['WIN_BANNER', 'DEFEAT'], 8000)
  const afterFight = await game(page)
  check('Click spam on FIGHT runs exactly one fight', afterFight.passed - before.passed <= 1 && afterFight.rngState !== before.rngState, `passed ${before.passed} → ${afterFight.passed}`)
  await page.evaluate(() => window.__casino.actions.skip())
  await waitPhase(page, 'DECISION')
  // Spam TAKE: paid once.
  const beforeTake = await game(page)
  for (let i = 0; i < 6; i++) await cta('TAKE').click({ force: true, noWaitAfter: true }).catch(() => {})
  await waitPhase(page, 'CASHED_OUT', 3000)
  const afterTake = await game(page)
  check('Click spam on TAKE pays once', Math.abs(afterTake.balance - (beforeTake.balance + beforeTake.atRisk)) < 0.001, `${beforeTake.balance} + ${beforeTake.atRisk} → ${afterTake.balance}`)
  // Refresh mid-round returns to SETUP with the starting balance (no persistence).
  await page.evaluate(() => window.__casino.actions.newRound())
  await page.evaluate(() => window.__casino.actions.play())
  await waitPhase(page, 'DECISION')
  await page.evaluate(() => window.__casino.actions.fight())
  await page.reload()
  await page.waitForFunction(() => window.__casino)
  const fresh = await game(page)
  check('Refresh mid-round returns to SETUP cleanly', fresh.phase === 'SETUP' && fresh.balance === 40, `${fresh.phase} balance ${fresh.balance}`)
  check('Spam / refresh: no errors', errors.length === 0, errors[0] ?? '')
  await page.close()
}

async function modalsAndKit(browser) {
  const errors = []
  const page = await openPage(browser, '?seed=1&difficulty=medium', [1920, 1080], errors)
  await page.getByRole('button', { name: 'Rules' }).click()
  const rules = await page.getByRole('dialog', { name: 'HOW TO PLAY' }).isVisible()
  await page.keyboard.press('Escape')
  const rulesClosed = !(await page.getByRole('dialog').count())
  await page.getByRole('button', { name: 'Menu' }).click()
  const menu = await page.getByRole('dialog', { name: 'MENU' }).isVisible()
  await page.getByRole('switch').click()
  const switched = await page.getByRole('switch').getAttribute('aria-checked')
  await page.getByRole('switch').click()
  await page.keyboard.press('Escape')
  check('Rules opens and closes (Esc); Menu opens; Skip animations toggles', rules && rulesClosed && menu && switched === 'true')
  await page.goto(`${BASE}#/kit`)
  await page.waitForSelector('text=Components')
  await sleep(800)
  const kit = await page.evaluate(() => ({ ctas: document.querySelectorAll('.cta').length, imgs: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0).length }))
  check('/kit renders components with no broken images', kit.ctas > 10 && kit.imgs === 0, `${kit.ctas} CTAs, ${kit.imgs} broken images`)
  check('Modals / kit: no errors', errors.length === 0, errors[0] ?? '')
  await page.close()
}

async function run() {
  const server = await startServer()
  try {
    for (const [name, type] of [
      ['chromium', chromium],
      ['firefox', firefox],
      ['webkit', webkit],
    ]) {
      current = name
      const browser = await type.launch()
      try {
        await sizes(browser)
        await keyboardRound(browser)
        await spamAndRefresh(browser)
        await modalsAndKit(browser)
      } catch (err) {
        check('Suite finished without crashing', false, String(err.message ?? err))
      } finally {
        await browser.close()
      }
    }
  } finally {
    server.kill()
  }
  writeFileSync(join(ROOT, '..', 'docs', 'qa', 'smoke.json'), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2))
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} smoke checks passed.`)
  process.exitCode = failed ? 1 : 0
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
