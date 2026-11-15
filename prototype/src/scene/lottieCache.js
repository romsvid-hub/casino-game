// Fetched Lottie JSON and pre-cloned copies, shared by LottieLayer and the preloader.
// In-memory cache of fetched Lottie JSON, keyed by URL (one request per file).
const cache = new Map()

// lottie-web mutates animationData, so every instance needs its own copy.
// Copies are prepared ahead of time in idle callbacks (one spare per file), so
// mounting a clip mid-fight does not pay for cloning a ~1 MB JSON (L11 perf).
const spares = new Map()
const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 50))
function prepareSpare(src, data) {
  if (spares.has(src)) return
  idle(() => {
    if (!spares.has(src)) spares.set(src, structuredClone(data))
  })
}
export function takeCopy(src, data) {
  const spare = spares.get(src)
  spares.delete(src)
  prepareSpare(src, data)
  return spare ?? structuredClone(data)
}

export function preloadLottie(src) {
  if (!cache.has(src)) {
    const request = fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Lottie ${src}: HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        prepareSpare(src, data)
        return data
      })
      .catch((err) => {
        cache.delete(src)
        throw err
      })
    cache.set(src, request)
  }
  return cache.get(src)
}

// lottie-web (~300 kB) is its own chunk: only the boss landing and MAX WIN use it,
// so it loads in the background with the bosses instead of with the first screen.
let player = null
export function loadLottiePlayer() {
  player ??= import('lottie-web').then((m) => m.default)
  return player
}
