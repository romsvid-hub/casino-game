// Lobby 13.11 checks (885:10856): layout boxes at t = 0 of the background loops
// (?still=1), the speech bubble stays put while the pitchfork shakes, the rules card
// has no square brackets and reads its facts from config (max multiplier follows the
// difficulty), reduced motion leaves the sky still, the splash logo lands exactly on
// the card logo. Saves screenshots and frames to docs/qa/lobby/.
import { spawn, execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, '..', 'docs', 'qa', 'lobby')
const PORT = 4179
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

const box = (p, sel) =>
  p.evaluate((s) => {
    const e = document.querySelector(s)
    if (!e) return null
    const r = e.getBoundingClientRect()
    return [r.x, r.y, r.width, r.height].map((v) => Math.round(v))
  }, sel)
const near = (a, b, tol = 4) => a && a.every((v, i) => Math.abs(v - b[i]) <= tol)

// Figma 885:10856 (13.11 brief): x, y, w, h on the 1920x1080 canvas.
const LAYOUT = {
  'balance HUD 980:9470': ['[data-qa="hud-balance"]', [40, 24, null, 84]],
  'rules card 992:6990': ['[data-qa="rules-card"]', [548, 24, 824, null]],
  'card logo (= splash logo 885:10855)': ['[data-i="card-logo"]', [701, 74, 519, 292]],
  'knight 885:10934': ['[data-i="hero"]', [277, 590, 307, 307]],
}

async function run() {
  mkdirSync(OUT, { recursive: true })
  const server = await startServer()
  const browser = await chromium.launch()
  try {
    // 1. Still lobby: layout boxes and a screenshot.
    let ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    let p = await ctx.newPage()
    const errors = []
    p.on('pageerror', (e) => errors.push(e.message))
    await p.goto(`${BASE}?intro=0&still=1&debug=1`)
    await p.waitForSelector('[data-qa="rules-card"]', { timeout: 60000 })
    await sleep(800)
    for (const [name, [sel, want]] of Object.entries(LAYOUT)) {
      const got = await box(p, sel)
      const ok = got && want.every((v, i) => v == null || Math.abs(v - got[i]) <= 4)
      check(`Layout: ${name}`, ok, `got ${got}, want ${want}`)
    }
    writeFileSync(join(OUT, 'lobby-still.png'), await p.screenshot())

    // 2. Card copy: no square brackets; facts from config; max multiplier follows difficulty.
    const text = await p.locator('[data-qa="rules-card"]').innerText()
    check('Rules card has no [ or ]', !/[[\]]/.test(text))
    const fact = () => p.locator('[data-qa="fact-max"]').innerText()
    const cfg = await p.evaluate(() => window.__casino && window.__casino.state.difficulty)
    const before = await fact()
    await p.evaluate(() => window.__casino.actions.setDifficulty('high'))
    await sleep(100)
    const high = await fact()
    await p.evaluate(() => window.__casino.actions.setDifficulty('easy'))
    await sleep(100)
    const easy = await fact()
    check('"Max multiplier" changes with the difficulty', before !== high && high !== easy, `${cfg}: ${before.replace(/\n/g, ' ')} · high: ${high.replace(/\n/g, ' ')} · easy: ${easy.replace(/\n/g, ' ')}`)
    check('No page errors (still lobby)', errors.length === 0, errors[0] ?? '')
    await ctx.close()

    // 3. Moving lobby: the bubble stays put while the pitchfork shakes.
    ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    p = await ctx.newPage()
    await p.goto(`${BASE}?intro=0`)
    await p.waitForSelector('[data-qa="speech-bubble"]', { timeout: 60000 })
    await sleep(1400) // after the bubble's pop-in
    const samples = []
    for (let i = 0; i < 12; i++) {
      samples.push(
        await p.evaluate(() => ({
          bubble: (() => {
            const r = document.querySelector('[data-qa="speech-bubble"]').getBoundingClientRect()
            return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 10) / 10).join(',')
          })(),
          arm: getComputedStyle(document.querySelector('[data-qa="pitchfork"]')).transform,
        })),
      )
      await sleep(180)
    }
    const arms = new Set(samples.map((s) => s.arm))
    const bubbles = new Set(samples.map((s) => s.bubble))
    check('The pitchfork shakes', arms.size > 3, `${arms.size} distinct arm transforms`)
    check('The bubble box stays fixed while the arm moves', bubbles.size === 1, [...bubbles].join(' | '))
    const sky = new Set()
    for (let i = 0; i < 5; i++) {
      sky.add(await p.evaluate(() => getComputedStyle(document.querySelector('[data-qa="lobby-sky"]')).translate + ' ' + getComputedStyle(document.querySelector('[data-qa="lobby-sky"]')).scale))
      await sleep(500)
    }
    check('The sky (clouds) drifts in the lobby', sky.size > 1, `${sky.size} distinct sky transforms in 2 s`)
    await ctx.close()

    // 4. Reduced motion: the clouds do not move over 2 s, no pitchfork shake.
    ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' })
    p = await ctx.newPage()
    await p.goto(`${BASE}?intro=0`)
    await p.waitForSelector('[data-qa="lobby-sky"]', { timeout: 60000 })
    const skyAt = () => p.evaluate(() => {
      const s = getComputedStyle(document.querySelector('[data-qa="lobby-sky"]'))
      return `${s.translate} ${s.scale} ${s.transform}`
    })
    const a = await skyAt()
    await sleep(2000)
    const b = await skyAt()
    check('Reduced motion: the sky transform stays the same over 2 s', a === b, `${a} → ${b}`)
    const armStill = await p.evaluate(() => document.querySelector('[data-qa="pitchfork"]').getAnimations().length === 0)
    check('Reduced motion: no pitchfork shake', armStill)
    await ctx.close()

    // 5. First visit: the splash logo ends exactly on the card logo; the bubble comes after the faces.
    ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    p = await ctx.newPage()
    await p.goto(`${BASE}?intro=1`)
    await p.waitForSelector('[data-qa="lobby"][data-ready]', { timeout: 60000 })
    // Layout boxes without the running animations' transforms.
    const layout = (sel) =>
      p.evaluate((s) => {
        let e = document.querySelector(s)
        const w = e.offsetWidth, h = e.offsetHeight
        let x = 0, y = 0
        while (e && !e.matches('[data-qa="lobby"]')) {
          x += e.offsetLeft + (e.offsetParent?.clientLeft ?? 0)
          y += e.offsetTop + (e.offsetParent?.clientTop ?? 0)
          e = e.offsetParent
        }
        return [x, y, w, h]
      }, sel)
    const big = await layout('[data-i="logo-big"]')
    const card = await layout('[data-i="card-logo"]')
    check('Splash logo and card logo share one box (no jump)', near(big, card, 1), `splash ${big} · card ${card}`)
    mkdirSync(join(OUT, 'first-visit'), { recursive: true })
    const t0 = Date.now()
    let bubbleAt = null
    for (const t of [500, 2000, 3500, 4500, 5400, 6000, 6600, 7200, 7800, 9000, 11000]) {
      const wait = t - (Date.now() - t0)
      if (wait > 0) await sleep(wait)
      writeFileSync(join(OUT, 'first-visit', `${String(t).padStart(5, '0')}ms.jpg`), await p.screenshot({ type: 'jpeg', quality: 70 }))
      if (bubbleAt == null && (await p.evaluate(() => Number(getComputedStyle(document.querySelector('[data-qa="speech-bubble"]')).opacity) > 0.5))) bubbleAt = Date.now() - t0
    }
    check('First visit: the bubble appears after the crowd faces (≈ 7 s)', bubbleAt != null && bubbleAt > 6500, `visible at ≈ ${bubbleAt} ms`)
    // Return visit: the crowd fades in, the bubble pops 0.3 s later.
    await p.reload()
    await p.waitForSelector('[data-qa="lobby"]:not([data-intro])', { timeout: 60000 })
    mkdirSync(join(OUT, 'return-visit'), { recursive: true })
    const t1 = Date.now()
    for (const t of [100, 400, 700, 900, 1200, 2000]) {
      const wait = t - (Date.now() - t1)
      if (wait > 0) await sleep(wait)
      writeFileSync(join(OUT, 'return-visit', `${String(t).padStart(5, '0')}ms.jpg`), await p.screenshot({ type: 'jpeg', quality: 70 }))
    }
    await ctx.close()
  } finally {
    await browser.close()
    server.kill()
  }
  writeFileSync(join(OUT, 'results.json'), JSON.stringify({ generated: new Date().toISOString(), checks }, null, 2))
  const failed = checks.filter((c) => !c.ok).length
  console.log(`\n${checks.length - failed}/${checks.length} lobby checks passed.`)
  process.exitCode = failed ? 1 : 0
}

run()
