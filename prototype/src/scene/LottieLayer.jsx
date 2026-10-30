import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'

// In-memory cache of fetched Lottie JSON, keyed by URL (one request per file).
const cache = new Map()

export function preloadLottie(src) {
  if (!cache.has(src)) {
    const request = fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Lottie ${src}: HTTP ${res.status}`)
        return res.json()
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

  useEffect(() => {
    let anim = null
    let cancelled = false

    preloadLottie(src)
      .then((data) => {
        if (cancelled || !containerRef.current) return
        const [introMarker, loopMarker] = markerSequence ?? []
        const frames = resolveSegment(data, segment, introMarker ?? marker)
        const loopFrames = loopMarker ? resolveSegment(data, null, loopMarker) : null
        // lottie-web mutates animationData, so each instance gets its own copy.
        const animationData = structuredClone(data)
        if (keepLayerRef.current) animationData.layers = animationData.layers.filter((l) => keepLayerRef.current(l.nm ?? ''))
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: loopFrames ? false : loop,
          autoplay: autoplay && !frames,
          animationData,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        })
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
      })
      .catch((err) => console.error(err))

    return () => {
      cancelled = true
      anim?.destroy()
    }
    // segment is compared by value through segmentKey
  }, [src, loop, autoplay, segmentKey, marker, sequenceKey])

  return <div ref={containerRef} className={`pointer-events-none ${className}`} />
}
