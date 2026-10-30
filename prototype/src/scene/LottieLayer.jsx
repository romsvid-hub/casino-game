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
  onComplete,
  className = 'absolute inset-0',
}) {
  const containerRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const segmentKey = segment ? segment.join(':') : ''

  useEffect(() => {
    let anim = null
    let cancelled = false

    preloadLottie(src)
      .then((data) => {
        if (cancelled || !containerRef.current) return
        const frames = resolveSegment(data, segment, marker)
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay: autoplay && !frames,
          // lottie-web mutates animationData, so each instance gets its own copy.
          animationData: structuredClone(data),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        })
        anim.addEventListener('complete', () => onCompleteRef.current?.())
        if (frames && autoplay) anim.playSegments(frames, true)
      })
      .catch((err) => console.error(err))

    return () => {
      cancelled = true
      anim?.destroy()
    }
    // segment is compared by value through segmentKey
  }, [src, loop, autoplay, segmentKey, marker])

  return <div ref={containerRef} className={`pointer-events-none ${className}`} />
}
