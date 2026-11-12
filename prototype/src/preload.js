// Loads and decodes the images the game shows (splash, lobby, scenes, character
// parts, FX, UI skins) and the fonts before they are needed, so nothing appears
// piece by piece and no enemy shows up half-loaded (review 12.11).
// - `preloadStart`: splash, lobby, UI, the forest, the knight and the vovkulak.
//   The game mounts after it (a short progress bar).
// - `preloadBosses`: the field, the hut, the two bosses and the boss FX. It runs in
//   the background right after the start set, while the splash and the first gates play.
// Rig parts use ONE density per device (DENSITY), the same URL the <img> uses, so
// the preloaded file is the one on screen. Decoded images stay referenced.
import { assets } from './assets.js'
import env from './scene/env.json'
import FX from './scene/fx.json'
import { preloadLottie } from './scene/LottieLayer.jsx'
import RIGS from './scene/rigs.json'
import INTRO from './ui/lobby/intro.json'

export const DENSITY = typeof window !== 'undefined' && window.devicePixelRatio > 1.25 ? 2 : 1
export const partSrc = (p) => (DENSITY === 2 && p.src2x ? p.src2x : p.src)

const BOSS_SETS = ['vovkulakBoss', 'babaYaga']
const BOSS_SCENES = ['field', 'hut']

function srcs(v, out = new Set()) {
  if (!v || typeof v !== 'object') return out
  if (Array.isArray(v)) {
    v.forEach((x) => srcs(x, out))
    return out
  }
  for (const [k, x] of Object.entries(v)) {
    if (k === 'src' && typeof x === 'string' && !x.endsWith('.json')) out.add(x.startsWith('/') ? x : `/${x}`)
    else if (k !== 'src2x' && k !== 'lottie') srcs(x, out)
  }
  return out
}
const rigUrls = (sets) =>
  Object.entries(RIGS)
    .filter(([key]) => sets.includes(key.split('.')[0]))
    .flatMap(([, rig]) => rig.parts.map(partSrc))

function startUrls() {
  const urls = new Set()
  // The splash and the lobby first, so they arrive earliest.
  srcs(INTRO, urls)
  srcs(env.lobby, urls)
  srcs(assets, urls)
  srcs(FX, urls)
  srcs(env.forest, urls)
  rigUrls(['hero', 'vovkulak']).forEach((u) => urls.add(u))
  return [...urls]
}
function bossUrls() {
  const urls = new Set()
  BOSS_SCENES.forEach((s) => srcs(env[s], urls))
  rigUrls(BOSS_SETS).forEach((u) => urls.add(u))
  return [...urls]
}

const kept = []
const loaded = new Map()
function image(url) {
  if (!loaded.has(url)) {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    kept.push(img)
    loaded.set(url, img.decode().catch(() => {}))
  }
  return loaded.get(url)
}

// Loads `urls` (+ extra promises), 12 at a time; `onProgress(done, total)`.
function load(urls, extra, onProgress) {
  let done = 0
  const total = urls.length + extra.length
  const tick = () => onProgress?.(++done, total)
  const queue = [...urls]
  const worker = async () => {
    while (queue.length) await image(queue.shift()).then(tick)
  }
  return Promise.all([...Array.from({ length: 12 }, worker), ...extra.map((p) => p.then(tick))])
}

const FACES = ["16px 'Ruslan Display'", "16px 'Kurale'", "16px 'Roboto'", "400 16px 'Inter'", "600 16px 'Inter'"]
const fonts = () =>
  Promise.all(FACES.map((f) => document.fonts?.load(f).catch(() => {}))).then(() => document.fonts?.ready)

let start = null
let bosses = null
export function preloadStart(onProgress) {
  start ??= load(startUrls(), [fonts()], onProgress)
  return start
}
export function preloadBosses(onProgress) {
  bosses ??= load(
    bossUrls(),
    Object.values(assets.lottie).map((c) => preloadLottie(c.src).catch(() => {})),
    onProgress,
  )
  return bosses
}
