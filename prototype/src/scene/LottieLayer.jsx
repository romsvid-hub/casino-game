import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'

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
function takeCopy(src, data) {
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

// Resolves the frames to play: an explicit [start, end] segment or a named marker.
function resolveSegment(data, segment, marker) {
  if (segment) return segment
  if (marker) {
    const m = data.markers?.find((x) => x.cm === marker)
    if (m) return [m.tm, m.tm + m.dr]
    console.warn(`Lottie marker "${marker}" not found`)
  }
  return null
}

// Full-size Lottie layer (svg renderer). Files are 1920x1080 and pre-positioned,
// so the default className stretches the layer over the whole stage.
export default function LottieLayer({
  src,
  loop = false,
  autoplay = true,
  // Hold the first frame, then play after this many ms (Infinity = keep holding).
  // Used for the dead clips: the body lies on frame 0, then crumbles to ash.
  playDelay,
  segment,
  marker,
  // [introMarker, loopMarker]: play the first marker once, then loop the second
  // (popup_maxwin: intro 0–18, loop 18–90).
  markerSequence,
  // Keep only layers whose name passes this test (e.g. drop a baked panel).
  keepLayer,
  onComplete,
  onReady,
  className = 'absolute inset-0',
}) {
  const containerRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const onReadyRef = useRef(onReady)
  onCompleteRef.current = onComplete
  onReadyRef.current = onReady

  const segmentKey = segment ? segment.join(':') : ''
  const sequenceKey = markerSequence ? markerSequence.join(':') : ''
  const keepLayerRef = useRef(keepLayer)
  keepLayerRef.current = keepLayer
  // playDelay can change after mount (body lies → ash) without remounting.
  const playDelayRef = useRef(playDelay)
  playDelayRef.current = playDelay
  const animRef = useRef(null)
  const delayTimer = useRef(null)
  const schedulePlay = () => {
    clearTimeout(delayTimer.current)
    const anim = animRef.current
    if (anim && Number.isFinite(playDelayRef.current)) delayTimer.current = setTimeout(() => anim.play(), playDelayRef.current)
  }

  useEffect(() => {
    let anim = null
    let cancelled = false
    const held = playDelayRef.current != null

    preloadLottie(src)
      .then((data) => {
        if (cancelled || !containerRef.current) return
        const [introMarker, loopMarker] = markerSequence ?? []
        const frames = resolveSegment(data, segment, introMarker ?? marker)
        const loopFrames = loopMarker ? resolveSegment(data, null, loopMarker) : null
        // Timing shows up as "lottie mount …" in the Chrome performance panel.
        const mountStart = performance.now()
        // Own copy per instance (a pre-made spare when available, see takeCopy).
        const animationData = takeCopy(src, data)
        if (keepLayerRef.current) animationData.layers = animationData.layers.filter((l) => keepLayerRef.current(l.nm ?? ''))
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: loopFrames ? false : loop,
          autoplay: autoplay && !frames && !held,
          animationData,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        })
        performance.measure(`lottie mount ${src}`, { start: mountStart })
        if (loopFrames) {
          anim.addEventListener('complete', () => {
            if (anim.loop) return
            anim.loop = true
            anim.playSegments(loopFrames, true)
          })
        }
        anim.addEventListener('complete', () => onCompleteRef.current?.())
        // First frame is in the DOM: safe to fade this layer in.
        anim.addEventListener('DOMLoaded', () => onReadyRef.current?.())
        // With inline animationData lottie may finish loading synchronously.
        if (anim.isLoaded) onReadyRef.current?.()
        if (frames && autoplay) anim.playSegments(frames, true)
        animRef.current = anim
        if (held) {
          anim.goToAndStop(0, true)
          schedulePlay()
        }
      })
      .catch((err) => console.error(err))

    return () => {
      cancelled = true
      clearTimeout(delayTimer.current)
      animRef.current = null
      anim?.destroy()
    }
    // segment is compared by value through segmentKey
  }, [src, loop, autoplay, segmentKey, marker, sequenceKey])

  // A held clip whose playDelay becomes finite starts its countdown now.
  useEffect(() => {
    if (animRef.current && playDelay != null) schedulePlay()
  }, [playDelay])

  return <div ref={containerRef} className={`pointer-events-none ${className}`} />
}
