// Intro splash → lobby checks (12.11 splash brief): the full run, SKIP ×4 and a
// second press, the return visit without a splash, ?intro=1, the rules card behind "?".
// Saves frames of each run to docs/qa/intro/ (for the recordings in the report).
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, '..', 'docs', 'qa', 'intro')
const PORT = 4178
const BASE = `http://localhost:${PORT}/`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const checks = []
const check = (name, ok, detail = '') => {
  checks.push({ name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
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
  throw new Error('preview server did not start')
}

const intro = (p) => p.evaluate(() => !!document.querySelector('[data-qa="lobby"][data-intro]'))
async function waitSettled(p, ms) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (!(await intro(p))) return Date.now() - t0
    await sleep(40)
  }
  return null
}
async function frames(p, dir, times) {
  mkdirSync(join(OUT, dir), { recursive: true })
  const t0 = Date.now()
  for (const [i, t] of times.entries()) {
    const wait = t - (Date.now() - t0)
    if (wait > 0) await sleep(wait)
    const buf = await p.screenshot({ type: 'jpeg', quality: 70 })
    writeFileSync(join(OUT, dir, `${String(i).padStart(2, '0')}-${t}ms.jpg`), buf)
  }
}

async function run() {
  mkdirSync(OUT, { recursive: true })
  const server = await startServer()
  const browser = await chromium.launch()
  try {
    // 1. First launch: the full splash, then the lobby with the rules card.
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    let p = await ctx.newPage()
    const errors = []
    p.on('pageerror', (e) => errors.push(e.message))
    await p.goto(`${BASE}?debug=1`)
    await p.waitForSelector('[data-qa="lobby"]')
    check('First launch plays the splash', await intro(p))
    const playLocked = await p.evaluate(() => getComputedStyle(document.querySelector('[data-dock]')).pointerEvents === 'none')
    check('PLAY is not clickable during the splash', playLocked)
    await frames(p, 'full', [300, 1200, 2000, 2800, 3600, 4400, 5200, 5600, 6200, 6800, 7400])
    const left = await waitSettled(p, 4000)
    check('Full splash ends in the lobby (≈7 s)', left !== null, left === null ? 'still in the intro' : '')
    check('Rules card shows on the first lobby entry', await p.getByRole('region', { name: 'How to play' }).isVisible())
    // 2. Return visit in the same session: no splash.
    await p.reload()
    await p.waitForSelector('[data-qa="lobby"]')
    check('Return visit opens the lobby directly (no splash)', !(await intro(p)))
    await frames(p, 'return', [100, 400, 800])
    // 3. Rules card: after a round it waits behind "?".
    const phase = () => p.evaluate(() => window.__casino.state.phase)
    const until = async (ph) => {
      for (let i = 0; i < 200 && (await phase()) !== ph; i++) await sleep(50)
    }
    await p.evaluate(() => window.__casino.actions.play())
    await until('DECISION')
    await p.evaluate(() => {
      window.__casino.actions.forceNext('lose')
      window.__casino.actions.fight()
      window.__casino.actions.skip()
    })
    await until('DEFEAT')
    await p.evaluate(() => window.__casino.actions.newRound())
    await until('SETUP')
    await sleep(400)
    const hidden = !(await p.getByRole('region', { name: 'How to play' }).count())
    await p.getByRole('button', { name: 'Rules' }).click()
    const reopened = await p.getByRole('region', { name: 'How to play' }).isVisible()
    check('After a round the rules card is hidden; "?" reopens it', hidden && reopened, `hidden ${hidden}, reopened ${reopened}`)
    check('No page errors', errors.length === 0, errors[0] ?? '')
    await ctx.close()

    // 4. SKIP: ×4 speed reaches the lobby in about 1.5–1.8 s; a second press ends at once.
    const ctx2 = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    p = await ctx2.newPage()
    await p.goto(BASE)
    await p.waitForSelector('[data-qa="lobby"][data-intro]')
    await sleep(200)
    const t0 = Date.now()
    await p.getByRole('button', { name: 'Skip intro' }).click()
    const shots = frames(p, 'skip', [100, 400, 700, 1000, 1300, 1600])
    const fast = await waitSettled(p, 4000)
    const took = Date.now() - t0
    await shots
    check('SKIP plays the splash ×4 (lobby in < 2.4 s)', fast !== null && took < 2400, `${took} ms`)
    await ctx2.close()

    const ctx3 = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    p = await ctx3.newPage()
    await p.goto(BASE)
    await p.waitForSelector('[data-qa="lobby"][data-intro]')
    await p.keyboard.press('Space')
    await sleep(100)
    const t1 = Date.now()
    await p.keyboard.press('Enter')
    const jump = await waitSettled(p, 1500)
    check('A second press jumps straight to the lobby', jump !== null && Date.now() - t1 < 800, `${Date.now() - t1} ms`)
    // 5. ?intro=1 forces the splash even after it was seen.
    await p.goto(`${BASE}?intro=1`)
    await p.waitForSelector('[data-qa="lobby"]')
    check('?intro=1 forces the splash', await intro(p))
    await ctx3.close()
  } finally {
    await browser.close()
    server.kill()
  }
  writeFileSync(join(OUT, 'results.json'), JSON.stringify({ generated: new Date().toISOString(), checks }, null, 2))
  const failed = checks.filter((c) => !c.ok).length
  console.log(`\n${checks.length - failed}/${checks.length} intro checks passed.`)
  process.exitCode = failed ? 1 : 0
}

run()
